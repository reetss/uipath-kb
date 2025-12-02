#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache directory for documentation
const CACHE_DIR = join(__dirname, "../../../knowledge/official/cache");

interface SearchResult {
  title: string;
  url: string;
  excerpt: string;
  relevance: number;
}

interface DocContent {
  title: string;
  url: string;
  content: string;
  sections: Array<{ heading: string; content: string }>;
  lastUpdated: string;
}

class UIPathDocsServer {
  private server: Server;
  private baseUrl = "https://docs.uipath.com";

  constructor() {
    this.server = new Server(
      {
        name: "uipath-docs-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "uipath_docs_search",
          description:
            "Search UIPath official documentation. Returns up to 10 relevant content chunks with title, URL, and excerpt. Use this to quickly find information about UIPath products, features, activities, and best practices.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "Search query for UIPath documentation (e.g., 'orchestrator API', 'process mining', 'document understanding')",
              },
              product: {
                type: "string",
                description:
                  "Optional: Filter by product (e.g., 'studio', 'orchestrator', 'robot', 'insights', 'test-suite')",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "uipath_docs_fetch",
          description:
            "Fetch complete content of a specific UIPath documentation page and convert to markdown. Use this after search when you need full details, tutorials, or complete API documentation.",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description:
                  "Full URL of the UIPath documentation page (must be from docs.uipath.com)",
              },
              use_cache: {
                type: "boolean",
                description: "Use cached version if available (default: true)",
                default: true,
              },
            },
            required: ["url"],
          },
        },
        {
          name: "uipath_docs_list_products",
          description:
            "List all available UIPath products and their documentation sections. Useful for exploring what documentation is available.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ] as Tool[],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "uipath_docs_search":
            return await this.handleSearch(args);
          case "uipath_docs_fetch":
            return await this.handleFetch(args);
          case "uipath_docs_list_products":
            return await this.handleListProducts();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleSearch(args: any) {
    const query = args.query as string;
    const product = args.product as string | undefined;

    console.error(`[Search] Query: "${query}", Product: ${product || "all"}`);

    // For now, we'll use Google Custom Search or direct scraping
    // This is a simplified implementation
    const searchUrl = product
      ? `${this.baseUrl}/${product}/search?q=${encodeURIComponent(query)}`
      : `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;

    try {
      const results = await this.performSearch(query, product);

      const resultText = results.map((r, i) => {
        return `## ${i + 1}. ${r.title}\n**URL:** ${r.url}\n**Relevance:** ${r.relevance.toFixed(2)}\n\n${r.excerpt}\n`;
      }).join("\n---\n\n");

      return {
        content: [
          {
            type: "text",
            text: resultText || "No results found for your query.",
          },
        ],
      };
    } catch (error) {
      throw new Error(`Search failed: ${error}`);
    }
  }

  private async performSearch(
    query: string,
    product?: string
  ): Promise<SearchResult[]> {
    // Simplified search - in production, you'd want to use UIPath's search API
    // or implement proper web scraping with rate limiting
    
    const searchTerms = query.toLowerCase().split(" ");
    const results: SearchResult[] = [];

    // Common UIPath documentation URLs to check
    const docsToCheck = [
      { path: "/studio/docs/introduction", title: "Studio Introduction", product: "studio" },
      { path: "/orchestrator/docs/introduction", title: "Orchestrator Introduction", product: "orchestrator" },
      { path: "/robot/docs/introduction", title: "Robot Introduction", product: "robot" },
      { path: "/activities/docs/about-activities", title: "About Activities", product: "activities" },
      { path: "/studio/docs/automation-best-practices", title: "Automation Best Practices", product: "studio" },
    ];

    for (const doc of docsToCheck) {
      if (product && doc.product !== product) continue;

      const relevance = this.calculateRelevance(
        searchTerms,
        doc.title.toLowerCase()
      );

      if (relevance > 0) {
        results.push({
          title: doc.title,
          url: `${this.baseUrl}${doc.path}`,
          excerpt: `Documentation page about ${doc.title}`,
          relevance,
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  private calculateRelevance(searchTerms: string[], text: string): number {
    let score = 0;
    for (const term of searchTerms) {
      if (text.includes(term)) {
        score += 1;
      }
    }
    return score / searchTerms.length;
  }

  private async handleFetch(args: any) {
    const url = args.url as string;
    const useCache = args.use_cache !== false;

    if (!url.startsWith(this.baseUrl)) {
      throw new Error("URL must be from docs.uipath.com");
    }

    console.error(`[Fetch] URL: ${url}, Cache: ${useCache}`);

    try {
      const content = await this.fetchDocContent(url, useCache);

      const markdown = this.convertToMarkdown(content);

      return {
        content: [
          {
            type: "text",
            text: markdown,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch document: ${error}`);
    }
  }

  private async fetchDocContent(
    url: string,
    useCache: boolean
  ): Promise<DocContent> {
    // Check cache first
    if (useCache) {
      const cached = await this.getFromCache(url);
      if (cached) return cached;
    }

    // Fetch from web
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract content (this is simplified - actual implementation would need
    // to handle UIPath's specific HTML structure)
    const title = $("h1").first().text().trim() || $("title").text();
    const sections: Array<{ heading: string; content: string }> = [];

    $("h2, h3").each((_, elem) => {
      const heading = $(elem).text().trim();
      const content = $(elem).nextUntil("h2, h3").text().trim();
      if (heading) {
        sections.push({ heading, content });
      }
    });

    const docContent: DocContent = {
      title,
      url,
      content: $("article, .content, main").first().text().trim(),
      sections,
      lastUpdated: new Date().toISOString(),
    };

    // Save to cache
    await this.saveToCache(url, docContent);

    return docContent;
  }

  private convertToMarkdown(doc: DocContent): string {
    let md = `# ${doc.title}\n\n`;
    md += `**Source:** ${doc.url}\n`;
    md += `**Last Updated:** ${doc.lastUpdated}\n\n`;
    md += `---\n\n`;

    if (doc.sections.length > 0) {
      for (const section of doc.sections) {
        md += `## ${section.heading}\n\n`;
        md += `${section.content}\n\n`;
      }
    } else {
      md += doc.content;
    }

    return md;
  }

  private async handleListProducts() {
    const products = [
      {
        name: "Studio",
        slug: "studio",
        description: "Design and develop automation workflows",
      },
      {
        name: "Orchestrator",
        slug: "orchestrator",
        description: "Manage and monitor robots and processes",
      },
      {
        name: "Robot",
        slug: "robot",
        description: "Execute automation workflows",
      },
      {
        name: "Activities",
        slug: "activities",
        description: "Pre-built automation activities and packages",
      },
      {
        name: "Insights",
        slug: "insights",
        description: "Analytics and reporting platform",
      },
      {
        name: "Test Suite",
        slug: "test-suite",
        description: "Automated testing solution",
      },
      {
        name: "Document Understanding",
        slug: "document-understanding",
        description: "AI-powered document processing",
      },
      {
        name: "Process Mining",
        slug: "process-mining",
        description: "Discover and optimize business processes",
      },
    ];

    const text = products
      .map(
        (p) =>
          `**${p.name}** (\`${p.slug}\`)\n${p.description}\nDocs: ${this.baseUrl}/${p.slug}/docs`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `# UIPath Products\n\n${text}`,
        },
      ],
    };
  }

  private async getFromCache(url: string): Promise<DocContent | null> {
    try {
      const cacheFile = this.getCacheFilePath(url);
      const data = await readFile(cacheFile, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async saveToCache(url: string, content: DocContent): Promise<void> {
    try {
      await mkdir(CACHE_DIR, { recursive: true });
      const cacheFile = this.getCacheFilePath(url);
      await writeFile(cacheFile, JSON.stringify(content, null, 2));
    } catch (error) {
      console.error("[Cache] Failed to save:", error);
    }
  }

  private getCacheFilePath(url: string): string {
    const hash = Buffer.from(url).toString("base64").replace(/[/+=]/g, "_");
    return join(CACHE_DIR, `${hash}.json`);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("UIPath Docs MCP Server running on stdio");
  }
}

const server = new UIPathDocsServer();
server.run().catch(console.error);
