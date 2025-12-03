#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile, readdir, stat, writeFile, mkdir } from "fs/promises";
import { join, dirname, relative, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KNOWLEDGE_BASE = join(__dirname, "../../../knowledge");

interface Document {
  path: string;
  relativePath: string;
  category: "official" | "custom" | "generated" | "videos" | "usecases";
  title: string;
  content: string;
  metadata: {
    createdAt: string;
    modifiedAt: string;
    size: number;
    tags?: string[];
  };
}

interface SearchResult {
  document: Document;
  relevance: number;
  matchedSections: string[];
}

class LocalKnowledgeServer {
  private server: Server;
  private documents: Document[] = [];
  private indexLoaded = false;

  constructor() {
    this.server = new Server(
      {
        name: "local-knowledge-mcp",
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
          name: "knowledge_search",
          description:
            "Search through local knowledge base including official docs, custom documentation, generated content, and video transcripts. Returns relevant documents with matched sections.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for the knowledge base",
              },
              category: {
                type: "string",
                enum: ["official", "custom", "generated", "videos", "usecases", "all"],
                description: "Filter by document category (default: all)",
              },
              limit: {
                type: "number",
                description: "Maximum number of results to return (default: 10)",
                default: 10,
              },
            },
            required: ["query"],
          },
        },
        {
          name: "knowledge_get_document",
          description:
            "Retrieve the complete content of a specific document from the knowledge base by its path.",
          inputSchema: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Relative path to the document within the knowledge base",
              },
            },
            required: ["path"],
          },
        },
        {
          name: "knowledge_list_documents",
          description:
            "List all documents in the knowledge base, optionally filtered by category. Returns metadata for each document.",
          inputSchema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["official", "custom", "generated", "videos", "usecases", "all"],
                description: "Filter by category (default: all)",
              },
            },
          },
        },
        {
          name: "knowledge_add_document",
          description:
            "Add a new document to the custom knowledge base. Creates a markdown file with optional metadata.",
          inputSchema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Title of the document",
              },
              content: {
                type: "string",
                description: "Content of the document (markdown format)",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Optional tags for categorization",
              },
            },
            required: ["title", "content"],
          },
        },
        {
          name: "knowledge_rebuild_index",
          description:
            "Rebuild the search index by scanning all documents in the knowledge base. Run this after adding new documents manually.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "knowledge_list_usecases",
          description:
            "List all Use Cases with their status (has technical.md or not). Use Cases are stored in knowledge/usecases/uc-XXX-name/ folders.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "knowledge_get_usecase",
          description:
            "Get complete information about a specific Use Case including README.md (business) and technical.md (if exists).",
          inputSchema: {
            type: "object",
            properties: {
              usecaseId: {
                type: "string",
                description: "Use Case ID (e.g., 'uc-001' or 'uc-001-onboarding')",
              },
            },
            required: ["usecaseId"],
          },
        },
      ] as Tool[],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        // Ensure index is loaded
        if (!this.indexLoaded && name !== "knowledge_rebuild_index") {
          await this.loadIndex();
        }

        switch (name) {
          case "knowledge_search":
            return await this.handleSearch(args);
          case "knowledge_get_document":
            return await this.handleGetDocument(args);
          case "knowledge_list_documents":
            return await this.handleListDocuments(args);
          case "knowledge_add_document":
            return await this.handleAddDocument(args);
          case "knowledge_rebuild_index":
            return await this.handleRebuildIndex();
          case "knowledge_list_usecases":
            return await this.handleListUsecases();
          case "knowledge_get_usecase":
            return await this.handleGetUsecase(args);
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

  private async loadIndex(): Promise<void> {
    console.error("[Index] Loading documents...");
    this.documents = [];

    const categories = ["official", "custom", "generated", "videos", "usecases"];

    for (const category of categories) {
      const categoryPath = join(KNOWLEDGE_BASE, category);
      try {
        await this.scanDirectory(
          categoryPath,
          category as Document["category"]
        );
      } catch (error) {
        console.error(`[Index] Failed to scan ${category}:`, error);
      }
    }

    this.indexLoaded = true;
    console.error(`[Index] Loaded ${this.documents.length} documents`);
  }

  private async scanDirectory(
    dirPath: string,
    category: Document["category"]
  ): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, category);
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase();
          if ([".md", ".txt", ".json"].includes(ext)) {
            try {
              const doc = await this.loadDocument(fullPath, category);
              this.documents.push(doc);
            } catch (error) {
              console.error(`[Index] Failed to load ${fullPath}:`, error);
            }
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist yet - that's ok
    }
  }

  private async loadDocument(
    path: string,
    category: Document["category"]
  ): Promise<Document> {
    const content = await readFile(path, "utf-8");
    const stats = await stat(path);
    const relativePath = relative(KNOWLEDGE_BASE, path);

    // Extract title from first heading or filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch
      ? titleMatch[1]
      : relativePath.split("/").pop()!.replace(/\.[^.]+$/, "");

    // Extract tags from frontmatter if present
    let tags: string[] | undefined;
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const tagsMatch = frontmatterMatch[1].match(/tags:\s*\[(.*?)\]/);
      if (tagsMatch) {
        tags = tagsMatch[1].split(",").map((t) => t.trim().replace(/['"]/g, ""));
      }
    }

    return {
      path,
      relativePath,
      category,
      title,
      content,
      metadata: {
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
        size: stats.size,
        tags,
      },
    };
  }

  private async handleSearch(args: any) {
    const query = args.query as string;
    const category = (args.category as Document["category"] | "all") || "all";
    const limit = (args.limit as number) || 10;

    console.error(`[Search] Query: "${query}", Category: ${category}`);

    const results = this.searchDocuments(query, category, limit);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No matching documents found.",
          },
        ],
      };
    }

    const text = results
      .map((result, i) => {
        let section = `## ${i + 1}. ${result.document.title}\n`;
        section += `**Category:** ${result.document.category}\n`;
        section += `**Path:** ${result.document.relativePath}\n`;
        section += `**Relevance:** ${result.relevance.toFixed(2)}\n`;
        if (result.document.metadata.tags) {
          section += `**Tags:** ${result.document.metadata.tags.join(", ")}\n`;
        }
        section += `\n**Matched Sections:**\n`;
        result.matchedSections.forEach((section) => {
          section += `\n${section}\n`;
        });
        return section;
      })
      .join("\n---\n\n");

    return {
      content: [{ type: "text", text }],
    };
  }

  private searchDocuments(
    query: string,
    category: Document["category"] | "all",
    limit: number
  ): SearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const results: SearchResult[] = [];

    for (const doc of this.documents) {
      if (category !== "all" && doc.category !== category) continue;

      const contentLower = doc.content.toLowerCase();
      const titleLower = doc.title.toLowerCase();

      let relevance = 0;
      const matchedSections: string[] = [];

      // Title matches are more relevant
      for (const term of queryTerms) {
        if (titleLower.includes(term)) relevance += 3;
        if (contentLower.includes(term)) relevance += 1;
      }

      // Tag matches
      if (doc.metadata.tags) {
        for (const tag of doc.metadata.tags) {
          if (queryTerms.some((term) => tag.toLowerCase().includes(term))) {
            relevance += 2;
          }
        }
      }

      if (relevance > 0) {
        // Extract matching sections
        const lines = doc.content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (
            queryTerms.some((term) => line.toLowerCase().includes(term))
          ) {
            // Get context around match
            const start = Math.max(0, i - 2);
            const end = Math.min(lines.length, i + 3);
            const section = lines.slice(start, end).join("\n");
            matchedSections.push(section);
            if (matchedSections.length >= 3) break;
          }
        }

        results.push({
          document: doc,
          relevance,
          matchedSections: matchedSections.slice(0, 3),
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  }

  private async handleGetDocument(args: any) {
    const relativePath = args.path as string;
    const fullPath = join(KNOWLEDGE_BASE, relativePath);

    console.error(`[Get Document] Path: ${relativePath}`);

    try {
      const content = await readFile(fullPath, "utf-8");
      return {
        content: [{ type: "text", text: content }],
      };
    } catch (error) {
      throw new Error(`Document not found: ${relativePath}`);
    }
  }

  private async handleListDocuments(args: any) {
    const category = (args.category as Document["category"] | "all") || "all";

    console.error(`[List] Category: ${category}`);

    const filtered =
      category === "all"
        ? this.documents
        : this.documents.filter((d) => d.category === category);

    const text = filtered
      .map((doc) => {
        let line = `**${doc.title}** (${doc.category})\n`;
        line += `Path: ${doc.relativePath}\n`;
        line += `Modified: ${doc.metadata.modifiedAt}\n`;
        if (doc.metadata.tags) {
          line += `Tags: ${doc.metadata.tags.join(", ")}\n`;
        }
        return line;
      })
      .join("\n---\n\n");

    return {
      content: [
        {
          type: "text",
          text: text || "No documents found.",
        },
      ],
    };
  }

  private async handleAddDocument(args: any) {
    const title = args.title as string;
    const content = args.content as string;
    const tags = (args.tags as string[]) || [];

    console.error(`[Add Document] Title: ${title}`);

    // Create filename from title
    const filename = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const customDir = join(KNOWLEDGE_BASE, "custom");
    await mkdir(customDir, { recursive: true });

    const filePath = join(customDir, `${filename}.md`);

    // Build document with frontmatter
    let document = "---\n";
    document += `title: "${title}"\n`;
    document += `created: ${new Date().toISOString()}\n`;
    if (tags.length > 0) {
      document += `tags: [${tags.map((t) => `"${t}"`).join(", ")}]\n`;
    }
    document += "---\n\n";
    document += `# ${title}\n\n`;
    document += content;

    await writeFile(filePath, document);

    // Reload index
    await this.loadIndex();

    return {
      content: [
        {
          type: "text",
          text: `Document created: custom/${filename}.md`,
        },
      ],
    };
  }

  private async handleRebuildIndex() {
    console.error("[Rebuild] Starting index rebuild...");
    await this.loadIndex();

    return {
      content: [
        {
          type: "text",
          text: `Index rebuilt successfully. Loaded ${this.documents.length} documents.`,
        },
      ],
    };
  }

  private async handleListUsecases() {
    console.error("[List Use Cases] Scanning use case folders...");
    
    const usecasesDir = join(KNOWLEDGE_BASE, "usecases");
    const usecases: Array<{
      id: string;
      name: string;
      path: string;
      hasReadme: boolean;
      hasTechnical: boolean;
      status: string;
    }> = [];

    try {
      const entries = await readdir(usecasesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith("uc-")) {
          const ucPath = join(usecasesDir, entry.name);
          
          // Check for README.md and technical.md
          let hasReadme = false;
          let hasTechnical = false;
          
          try {
            await stat(join(ucPath, "README.md"));
            hasReadme = true;
          } catch {}
          
          try {
            await stat(join(ucPath, "technical.md"));
            hasTechnical = true;
          } catch {}
          
          // Determine status
          let status = "❌ Missing README";
          if (hasReadme && hasTechnical) {
            status = "✅ Documented";
          } else if (hasReadme) {
            status = "⏳ Needs technical.md";
          }
          
          usecases.push({
            id: entry.name,
            name: entry.name.replace(/^uc-\d+-/, "").replace(/-/g, " "),
            path: `usecases/${entry.name}`,
            hasReadme,
            hasTechnical,
            status,
          });
        }
      }
    } catch (error) {
      console.error("[List Use Cases] Error:", error);
    }

    if (usecases.length === 0) {
      return {
        content: [{ type: "text", text: "No Use Cases found in knowledge/usecases/" }],
      };
    }

    const text = usecases
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((uc) => {
        return `**${uc.id}** - ${uc.name}\n` +
          `Status: ${uc.status}\n` +
          `Path: ${uc.path}/`;
      })
      .join("\n\n---\n\n");

    return {
      content: [{ type: "text", text: `# Use Cases\n\n${text}` }],
    };
  }

  private async handleGetUsecase(args: any) {
    const usecaseId = args.usecaseId as string;
    console.error(`[Get Use Case] ID: ${usecaseId}`);
    
    const usecasesDir = join(KNOWLEDGE_BASE, "usecases");
    
    // Find matching use case folder
    let ucFolder: string | null = null;
    try {
      const entries = await readdir(usecasesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith(usecaseId)) {
          ucFolder = entry.name;
          break;
        }
      }
    } catch (error) {
      throw new Error(`Use Cases directory not found`);
    }

    if (!ucFolder) {
      throw new Error(`Use Case not found: ${usecaseId}`);
    }

    const ucPath = join(usecasesDir, ucFolder);
    let result = `# Use Case: ${ucFolder}\n\n`;

    // Read README.md (Business Use Case)
    try {
      const readme = await readFile(join(ucPath, "README.md"), "utf-8");
      result += `## Business Use Case (README.md)\n\n${readme}\n\n`;
    } catch {
      result += `## Business Use Case (README.md)\n\n⚠️ README.md not found\n\n`;
    }

    // Read technical.md (Technical Documentation)
    try {
      const technical = await readFile(join(ucPath, "technical.md"), "utf-8");
      result += `---\n\n## Technical Documentation (technical.md)\n\n${technical}\n\n`;
    } catch {
      result += `---\n\n## Technical Documentation (technical.md)\n\n⏳ technical.md not yet created. Use "Dokumentiere bitte ${usecaseId} technisch" to generate it.\n\n`;
    }

    // List assets if present
    try {
      const assetsPath = join(ucPath, "assets");
      const assets = await readdir(assetsPath);
      if (assets.length > 0) {
        result += `---\n\n## Assets\n\n`;
        assets.forEach((asset) => {
          result += `- ${asset}\n`;
        });
      }
    } catch {}

    return {
      content: [{ type: "text", text: result }],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Local Knowledge MCP Server running on stdio");
  }
}

const server = new LocalKnowledgeServer();
server.run().catch(console.error);
