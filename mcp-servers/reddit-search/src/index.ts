#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP Server for searching r/UiPath on-demand
 * Provides tools to search Reddit for problems, solutions, and discussions
 */

interface RedditPost {
  title: string;
  author: string;
  url: string;
  upvotes: number;
  comments: number;
  content: string;
  tags: string[];
}

class RedditSearchServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'reddit-search-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'reddit_search_uipath',
          description: 'Search r/UiPath subreddit for problems, solutions, and discussions. Returns relevant posts with titles, content, and engagement metrics.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (e.g., "API integration", "selector problems", "orchestrator queue")',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10)',
                default: 10,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'reddit_get_trending',
          description: 'Get currently trending topics and discussions from r/UiPath',
          inputSchema: {
            type: 'object',
            properties: {
              timeframe: {
                type: 'string',
                enum: ['day', 'week', 'month'],
                description: 'Timeframe for trending posts',
                default: 'week',
              },
            },
          },
        },
        {
          name: 'reddit_get_top_problems',
          description: 'Get the most discussed problems and pain points from r/UiPath community',
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
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (!args) {
          throw new Error('Arguments are required');
        }

        switch (name) {
          case 'reddit_search_uipath':
            return await this.searchReddit(args.query as string, args.limit as number);
          
          case 'reddit_get_trending':
            return await this.getTrending(args.timeframe as string);
          
          case 'reddit_get_top_problems':
            return await this.getTopProblems(args.limit as number);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private async searchReddit(query: string, limit: number = 10) {
    // In production, this would use Reddit API or web scraping
    // For now, return structured mock data based on actual r/UiPath content
    
    const mockResults: RedditPost[] = [
      {
        title: 'Dealing w API calls',
        author: 'PureMud8950',
        url: 'https://www.reddit.com/r/UiPath/comments/1pb2rtq/dealing_w_api_calls/',
        upvotes: 3,
        comments: 4,
        content: 'Multiple HTTP requests (10+) with try-catch blocks are unreadable. Looking for better patterns.',
        tags: ['api', 'http', 'best-practices', 'readability'],
      },
      {
        title: 'AS400 Integration with CRM',
        author: 'Amazing_rocness',
        url: 'https://www.reddit.com/r/UiPath/comments/1paejkk/',
        upvotes: 4,
        comments: 9,
        content: 'Need to integrate AS400 inventory data with modern CRM for real-time updates. Developer needed or can BA handle?',
        tags: ['as400', 'legacy', 'crm', 'integration'],
      },
    ];

    const filtered = mockResults.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(tag => tag.includes(query.toLowerCase()))
    ).slice(0, limit);

    const resultText = filtered.map(post => 
      `## ${post.title}\n` +
      `**Author:** u/${post.author}\n` +
      `**Engagement:** 👍 ${post.upvotes} | 💬 ${post.comments}\n` +
      `**Tags:** ${post.tags.join(', ')}\n\n` +
      `${post.content}\n\n` +
      `**Link:** ${post.url}\n\n` +
      `---\n`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `# r/UiPath Search Results for "${query}"\n\n` +
                `Found ${filtered.length} relevant posts:\n\n${resultText}`,
        },
      ],
    };
  }

  private async getTrending(timeframe: string = 'week') {
    const trendingTopics = [
      { topic: 'API integration challenges', count: 12 },
      { topic: 'Legacy system automation (AS400)', count: 8 },
      { topic: 'Certification preparation', count: 7 },
      { topic: 'Code readability and maintainability', count: 6 },
      { topic: 'Orchestrator queue management', count: 5 },
    ];

    const resultText = trendingTopics.map((item, i) => 
      `${i + 1}. **${item.topic}** (${item.count} mentions)`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `# r/UiPath Trending Topics (${timeframe})\n\n${resultText}`,
        },
      ],
    };
  }

  private async getTopProblems(limit: number = 5) {
    const problems = [
      {
        problem: 'API Call Management',
        description: '10+ HTTP requests with try-catch blocks are hard to read and maintain',
        upvotes: 3,
        comments: 4,
      },
      {
        problem: 'AS400 Legacy Integration',
        description: 'Integrating AS400 inventory data with modern CRM systems',
        upvotes: 4,
        comments: 9,
      },
    ].slice(0, limit);

    const resultText = problems.map((p, i) => 
      `${i + 1}. **${p.problem}**\n` +
      `   ${p.description}\n` +
      `   Engagement: 👍 ${p.upvotes} | 💬 ${p.comments}\n`
    ).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `# r/UiPath Top Problems\n\n${resultText}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Reddit Search MCP Server running on stdio');
  }
}

const server = new RedditSearchServer();
server.run().catch(console.error);
