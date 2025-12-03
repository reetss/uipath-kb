#!/usr/bin/env node

/**
 * Reddit Search MCP Server v2.0
 * 
 * Provides REAL search of r/UiPath subreddit via Reddit JSON API.
 * No more mock data - actual Reddit content.
 * 
 * Features:
 * - Real web scraping of r/UiPath via Reddit's public JSON API
 * - Structured logging with timestamps
 * - Log file output for debugging
 * - Comprehensive error handling
 * 
 * @author UIPath Knowledge Base Team
 * @version 2.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================

const LOG_DIR = path.join(__dirname, '..', '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'reddit-search.log');

// Ensure log directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (err) {
  // Log dir creation failed, continue without file logging
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function log(level: LogLevel, message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data: data || null,
  };
  
  const logLine = `[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
  
  // Console output (stderr for MCP compatibility)
  console.error(logLine);
  
  // File output
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
  } catch {
    // Silently fail file logging
  }
}

// ============================================================================
// REDDIT API TYPES
// ============================================================================

interface RedditPost {
  title: string;
  author: string;
  url: string;
  permalink: string;
  upvotes: number;
  comments: number;
  content: string;
  created: string;
  tags: string[];
}

interface RedditApiChild {
  data: {
    title: string;
    author: string;
    permalink: string;
    ups: number;
    num_comments: number;
    selftext: string;
    created_utc: number;
    link_flair_text?: string;
  };
}

interface RedditApiResponse {
  data: {
    children: RedditApiChild[];
  };
}

// ============================================================================
// REDDIT SCRAPING FUNCTIONS
// ============================================================================

async function fetchRedditPosts(
  subreddit: string,
  sort: 'hot' | 'new' | 'top' = 'hot',
  limit: number = 25,
  timeframe: string = 'week'
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&t=${timeframe}`;
  
  log('INFO', `Fetching Reddit posts`, { url, subreddit, sort, limit, timeframe });
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UIPathKnowledgeBase/2.0 (Educational Bot)',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      log('ERROR', `Reddit API returned ${response.status}`, { 
        status: response.status, 
        statusText: response.statusText 
      });
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }
    
    const json = await response.json() as RedditApiResponse;
    
    const posts: RedditPost[] = json.data.children.map((child: RedditApiChild) => {
      const post = child.data;
      return {
        title: post.title,
        author: post.author,
        url: `https://www.reddit.com${post.permalink}`,
        permalink: post.permalink,
        upvotes: post.ups,
        comments: post.num_comments,
        content: post.selftext.substring(0, 500) + (post.selftext.length > 500 ? '...' : ''),
        created: new Date(post.created_utc * 1000).toISOString(),
        tags: extractTags(post.title + ' ' + post.selftext, post.link_flair_text),
      };
    });
    
    log('INFO', `Successfully fetched ${posts.length} posts from r/${subreddit}`);
    return posts;
    
  } catch (error) {
    log('ERROR', `Failed to fetch Reddit posts`, { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

function extractTags(text: string, flair?: string): string[] {
  const tags: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Common UIPath-related keywords
  const keywords = [
    'api', 'http', 'orchestrator', 'queue', 'selector', 'excel', 
    'reframework', 'citrix', 'pdf', 'email', 'database', 'as400',
    'legacy', 'integration', 'error', 'bug', 'help', 'best-practices',
    'certification', 'learning', 'studio', 'robot', 'attended', 'unattended',
    'document-understanding', 'ai', 'ml', 'automation', 'workflow'
  ];
  
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  // Add flair as tag if present
  if (flair) {
    tags.push(flair.toLowerCase().replace(/\s+/g, '-'));
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

async function searchRedditPosts(query: string, limit: number = 10): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/UiPath/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=${limit}&sort=relevance`;
  
  log('INFO', `Searching Reddit for "${query}"`, { query, limit });
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UIPathKnowledgeBase/2.0 (Educational Bot)',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      log('WARN', `Reddit search returned ${response.status}, falling back to hot posts`);
      // Fallback: fetch hot posts and filter locally
      const allPosts = await fetchRedditPosts('UiPath', 'hot', 50);
      return filterPostsByQuery(allPosts, query).slice(0, limit);
    }
    
    const json = await response.json() as RedditApiResponse;
    
    const posts: RedditPost[] = json.data.children.map((child: RedditApiChild) => {
      const post = child.data;
      return {
        title: post.title,
        author: post.author,
        url: `https://www.reddit.com${post.permalink}`,
        permalink: post.permalink,
        upvotes: post.ups,
        comments: post.num_comments,
        content: post.selftext.substring(0, 500) + (post.selftext.length > 500 ? '...' : ''),
        created: new Date(post.created_utc * 1000).toISOString(),
        tags: extractTags(post.title + ' ' + post.selftext, post.link_flair_text),
      };
    });
    
    log('INFO', `Search returned ${posts.length} results for "${query}"`);
    return posts;
    
  } catch (error) {
    log('ERROR', `Search failed, using fallback`, { error: error instanceof Error ? error.message : String(error) });
    // Fallback to local filtering
    const allPosts = await fetchRedditPosts('UiPath', 'hot', 50);
    return filterPostsByQuery(allPosts, query).slice(0, limit);
  }
}

function filterPostsByQuery(posts: RedditPost[], query: string): RedditPost[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  return posts.filter(post => {
    const searchText = `${post.title} ${post.content} ${post.tags.join(' ')}`.toLowerCase();
    return queryWords.some(word => searchText.includes(word));
  }).sort((a, b) => {
    // Sort by relevance (number of matching words)
    const aMatches = queryWords.filter(w => 
      `${a.title} ${a.content}`.toLowerCase().includes(w)
    ).length;
    const bMatches = queryWords.filter(w => 
      `${b.title} ${b.content}`.toLowerCase().includes(w)
    ).length;
    return bMatches - aMatches;
  });
}

function identifyProblems(posts: RedditPost[]): Array<{
  problem: string;
  description: string;
  frequency: number;
  posts: string[];
}> {
  const problemKeywords: Record<string, string> = {
    'api': 'API Integration Issues',
    'selector': 'Selector Stability Problems',
    'orchestrator': 'Orchestrator Configuration',
    'queue': 'Queue Management',
    'excel': 'Excel Automation Challenges',
    'error': 'Runtime Errors',
    'timeout': 'Timeout Issues',
    'credential': 'Credential Management',
    'citrix': 'Citrix/Virtual Environment',
    'legacy': 'Legacy System Integration',
  };
  
  const problemCounts: Record<string, { count: number; posts: string[] }> = {};
  
  posts.forEach(post => {
    const text = `${post.title} ${post.content}`.toLowerCase();
    
    Object.entries(problemKeywords).forEach(([keyword, problemName]) => {
      if (text.includes(keyword)) {
        if (!problemCounts[problemName]) {
          problemCounts[problemName] = { count: 0, posts: [] };
        }
        problemCounts[problemName].count++;
        problemCounts[problemName].posts.push(post.title);
      }
    });
  });
  
  return Object.entries(problemCounts)
    .map(([problem, data]) => ({
      problem,
      description: `Found in ${data.count} recent discussions`,
      frequency: data.count,
      posts: data.posts.slice(0, 3),
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

// ============================================================================
// MCP SERVER CLASS
// ============================================================================

class RedditSearchServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'reddit-search-server',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    log('INFO', 'Reddit Search MCP Server initialized');
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      log('DEBUG', 'Tools list requested');
      return {
        tools: [
          {
            name: 'reddit_search_uipath',
            description: 'Search r/UiPath subreddit for problems, solutions, and discussions. Returns relevant posts with titles, content, and engagement metrics. Uses REAL Reddit data via API.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query (e.g., "API integration", "selector problems", "orchestrator queue")',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 10, max: 25)',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'reddit_get_trending',
            description: 'Get currently trending topics and hot discussions from r/UiPath. Uses REAL Reddit data.',
            inputSchema: {
              type: 'object',
              properties: {
                timeframe: {
                  type: 'string',
                  enum: ['day', 'week', 'month'],
                  description: 'Timeframe for trending posts',
                  default: 'week',
                },
                limit: {
                  type: 'number',
                  description: 'Number of posts to analyze (default: 25)',
                  default: 25,
                },
              },
            },
          },
          {
            name: 'reddit_get_top_problems',
            description: 'Analyze r/UiPath posts to identify the most discussed problems and pain points. Uses REAL Reddit data.',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Number of top problems to return',
                  default: 5,
                },
              },
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      log('INFO', `Tool called: ${name}`, { args });

      try {
        switch (name) {
          case 'reddit_search_uipath':
            return await this.handleSearch(
              (args?.query as string) || '',
              Math.min((args?.limit as number) || 10, 25)
            );
          
          case 'reddit_get_trending':
            return await this.handleTrending(
              (args?.timeframe as string) || 'week',
              (args?.limit as number) || 25
            );
          
          case 'reddit_get_top_problems':
            return await this.handleTopProblems((args?.limit as number) || 5);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        log('ERROR', `Tool ${name} failed`, { error: errorMsg });
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: ${errorMsg}\n\nCheck logs at: ${LOG_FILE}`,
            },
          ],
        };
      }
    });
  }

  private async handleSearch(query: string, limit: number) {
    if (!query || query.trim() === '') {
      throw new Error('Query is required');
    }
    
    log('INFO', `Searching for: "${query}" (limit: ${limit})`);
    
    const posts = await searchRedditPosts(query, limit);
    
    if (posts.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `# r/UiPath Search Results for "${query}"\n\n` +
                `No posts found matching your query. Try:\n` +
                `- Using different keywords\n` +
                `- Checking for typos\n` +
                `- Using more general terms`,
        }],
      };
    }
    
    const resultText = posts.map(post => 
      `## ${post.title}\n` +
      `**Author:** u/${post.author} | **Date:** ${post.created.split('T')[0]}\n` +
      `**Engagement:** 👍 ${post.upvotes} | 💬 ${post.comments} comments\n` +
      `**Tags:** ${post.tags.length > 0 ? post.tags.join(', ') : 'none'}\n\n` +
      `${post.content || '*No content*'}\n\n` +
      `🔗 [View on Reddit](${post.url})\n\n` +
      `---\n`
    ).join('\n');

    log('INFO', `Search completed, found ${posts.length} results`);
    
    return {
      content: [{
        type: 'text',
        text: `# r/UiPath Search Results for "${query}"\n\n` +
              `Found **${posts.length}** relevant posts:\n\n${resultText}`,
      }],
    };
  }

  private async handleTrending(timeframe: string, limit: number) {
    log('INFO', `Getting trending posts (timeframe: ${timeframe}, limit: ${limit})`);
    
    const posts = await fetchRedditPosts('UiPath', 'hot', limit, timeframe);
    
    // Extract trending topics from tags
    const tagCounts: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const trendingTopics = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count], i) => `${i + 1}. **${topic}** (${count} mentions)`);
    
    const hotPosts = posts.slice(0, 5).map(post =>
      `### ${post.title}\n` +
      `👍 ${post.upvotes} | 💬 ${post.comments} | 🔗 [Link](${post.url})\n`
    );

    log('INFO', `Trending analysis complete, ${trendingTopics.length} topics identified`);
    
    return {
      content: [{
        type: 'text',
        text: `# r/UiPath Trending (${timeframe})\n\n` +
              `## 🔥 Hot Topics\n${trendingTopics.length > 0 ? trendingTopics.join('\n') : 'No specific topics identified'}\n\n` +
              `## 📰 Top Posts\n${hotPosts.join('\n')}`,
      }],
    };
  }

  private async handleTopProblems(limit: number) {
    log('INFO', `Analyzing top problems (limit: ${limit})`);
    
    // Fetch more posts for better analysis
    const posts = await fetchRedditPosts('UiPath', 'hot', 50, 'month');
    const problems = identifyProblems(posts).slice(0, limit);
    
    if (problems.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `# r/UiPath Top Problems\n\nNo specific problem patterns identified in recent posts.`,
        }],
      };
    }
    
    const resultText = problems.map((p, i) => 
      `## ${i + 1}. ${p.problem}\n` +
      `**Frequency:** ${p.frequency} mentions\n` +
      `**Example posts:**\n${p.posts.map(t => `- ${t}`).join('\n')}\n`
    ).join('\n\n');

    log('INFO', `Problem analysis complete, ${problems.length} problems identified`);
    
    return {
      content: [{
        type: 'text',
        text: `# r/UiPath Top Community Problems\n\n` +
              `Based on analysis of ${posts.length} recent posts:\n\n${resultText}`,
      }],
    };
  }

  async run() {
    log('INFO', 'Starting Reddit Search MCP Server...');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    log('INFO', 'Server connected and ready');
  }
}

// ============================================================================
// MAIN
// ============================================================================

const server = new RedditSearchServer();
server.run().catch(error => {
  log('ERROR', 'Server crashed', { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});
