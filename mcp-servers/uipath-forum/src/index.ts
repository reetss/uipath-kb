#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

interface ForumTopicSummary {
  id: number;
  title: string;
  slug: string;
  url: string;
  category?: string;
  tags?: string[];
  created?: string;
}

interface ForumPostDetail {
  id: number;
  title: string;
  url: string;
  posts_count: number;
  created?: string;
  content?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'UIPathKnowledgeBase/1.0 (Forum MCP)',
      'Accept': 'application/json'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

async function forumLatest(limit = 20): Promise<ForumTopicSummary[]> {
  // UiPath Forum is Discourse-based; JSON endpoints follow /latest.json, /top.json, /t/{id}.json
  const json = await fetchJson<any>('https://forum.uipath.com/latest.json');
  const topics: ForumTopicSummary[] = (json?.topic_list?.topics ?? []).slice(0, limit).map((t: any) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    url: `https://forum.uipath.com/t/${t.slug}/${t.id}`,
    category: t.category_id,
    tags: t.tags ?? [],
    created: t.created_at
  }));
  return topics;
}

async function forumTop(period: 'daily'|'weekly'|'monthly'|'yearly'|'all' = 'weekly', limit = 20): Promise<ForumTopicSummary[]> {
  const json = await fetchJson<any>(`https://forum.uipath.com/top/${period}.json`);
  const topics: ForumTopicSummary[] = (json?.topic_list?.topics ?? []).slice(0, limit).map((t: any) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    url: `https://forum.uipath.com/t/${t.slug}/${t.id}`,
    category: t.category_id,
    tags: t.tags ?? [],
    created: t.created_at
  }));
  return topics;
}

async function forumGetTopic(id: number): Promise<ForumPostDetail> {
  const json = await fetchJson<any>(`https://forum.uipath.com/t/${id}.json`);
  const title = json?.title ?? `Topic ${id}`;
  const posts = json?.post_stream?.posts ?? [];
  const first = posts[0];
  return {
    id,
    title,
    url: `https://forum.uipath.com/t/${json?.slug ?? id}/${id}`,
    posts_count: json?.posts_count ?? posts.length,
    created: json?.created_at ?? first?.created_at,
    content: first?.cooked ?? first?.raw
  };
}

async function forumSearch(query: string, limit = 10): Promise<ForumTopicSummary[]> {
  // Discourse search API
  const json = await fetchJson<any>(`https://forum.uipath.com/search.json?q=${encodeURIComponent(query)}`);
  const topics = (json?.topics ?? []) as any[];
  return topics.slice(0, limit).map(t => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    url: `https://forum.uipath.com/t/${t.slug}/${t.id}`,
    tags: t.tags ?? []
  }));
}

class UiPathForumServer {
  private server: Server;

  constructor() {
    this.server = new Server({ name: 'uipath-forum', version: '1.0.0' }, { capabilities: { tools: {} } });
    this.handlers();
  }

  private handlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'forum_latest',
          description: 'Get latest topics from UiPath Forum (Discourse).',
          inputSchema: {
            type: 'object',
            properties: { limit: { type: 'number', default: 20 } }
          }
        },
        {
          name: 'forum_top',
          description: 'Get top topics by period from UiPath Forum.',
          inputSchema: {
            type: 'object',
            properties: {
              period: { type: 'string', enum: ['daily','weekly','monthly','yearly','all'], default: 'weekly' },
              limit: { type: 'number', default: 20 }
            }
          }
        },
        {
          name: 'forum_get_topic',
          description: 'Fetch detailed information for a topic by ID.',
          inputSchema: {
            type: 'object',
            properties: { id: { type: 'number' } },
            required: ['id']
          }
        },
        {
          name: 'forum_search',
          description: 'Search UiPath Forum topics by query.',
          inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' }, limit: { type: 'number', default: 10 } },
            required: ['query']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (req) => {
      const { name, arguments: args } = req.params;
      try {
        switch (name) {
          case 'forum_latest': {
            const limit = Number(args?.limit ?? 20);
            const topics = await forumLatest(limit);
            return { content: [{ type: 'text', text: JSON.stringify(topics, null, 2) }] };
          }
          case 'forum_top': {
            const period = (args?.period ?? 'weekly') as 'daily'|'weekly'|'monthly'|'yearly'|'all';
            const limit = Number(args?.limit ?? 20);
            const topics = await forumTop(period, limit);
            return { content: [{ type: 'text', text: JSON.stringify(topics, null, 2) }] };
          }
          case 'forum_get_topic': {
            const id = Number(args?.id);
            const detail = await forumGetTopic(id);
            return { content: [{ type: 'text', text: JSON.stringify(detail, null, 2) }] };
          }
          case 'forum_search': {
            const query = String(args?.query ?? '');
            const limit = Number(args?.limit ?? 10);
            const topics = await forumSearch(query, limit);
            return { content: [{ type: 'text', text: JSON.stringify(topics, null, 2) }] };
          }
          default:
            return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
        }
      } catch (err) {
        return { content: [{ type: 'text', text: `Error: ${(err as Error).message}` }] };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

new UiPathForumServer().start();
