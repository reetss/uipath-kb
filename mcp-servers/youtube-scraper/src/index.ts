#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Storage directory for video data
const VIDEOS_DIR = join(__dirname, "../../../knowledge/videos");
const FABRIC_PATH = "/opt/homebrew/opt/fabric-ai/bin/fabric-ai";

interface VideoMetadata {
  videoId: string;
  title: string;
  url: string;
  channel: string;
  duration: string;
  publishedAt: string;
  description: string;
}

interface VideoTranscript {
  videoId: string;
  transcript: string;
  language: string;
  generatedAt: string;
}

interface VideoWisdom {
  videoId: string;
  summary: string;
  mainPoints: string[];
  insights: string[];
  quotes: string[];
  habits: string[];
  facts: string[];
  references: string[];
  recommendations: string[];
  generatedAt: string;
}

class YouTubeScraperServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "youtube-scraper-mcp",
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
          name: "youtube_get_metadata",
          description:
            "Extract metadata from a YouTube video (title, channel, duration, description). Uses fabric-ai to get video information.",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "YouTube video URL or video ID",
              },
            },
            required: ["url"],
          },
        },
        {
          name: "youtube_get_transcript",
          description:
            "Get the transcript/subtitles of a YouTube video. Useful for extracting spoken content from UIPath tutorials and presentations.",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "YouTube video URL or video ID",
              },
              language: {
                type: "string",
                description: "Preferred language code (e.g., 'en', 'de'). Default: auto-detect",
              },
            },
            required: ["url"],
          },
        },
        {
          name: "youtube_extract_wisdom",
          description:
            "Extract key insights, summaries, and wisdom from a YouTube video using fabric-ai's extract_wisdom pattern. Returns structured insights including main points, quotes, habits, facts, and recommendations.",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "YouTube video URL or video ID",
              },
              force_refresh: {
                type: "boolean",
                description: "Force re-extraction even if cached (default: false)",
                default: false,
              },
            },
            required: ["url"],
          },
        },
        {
          name: "youtube_summarize",
          description:
            "Create a concise summary of a YouTube video using fabric-ai. Perfect for quickly understanding video content without watching.",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "YouTube video URL or video ID",
              },
            },
            required: ["url"],
          },
        },
        {
          name: "youtube_list_cached",
          description:
            "List all cached YouTube videos with their metadata. Shows what videos have been processed and are available locally.",
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
          case "youtube_get_metadata":
            return await this.handleGetMetadata(args);
          case "youtube_get_transcript":
            return await this.handleGetTranscript(args);
          case "youtube_extract_wisdom":
            return await this.handleExtractWisdom(args);
          case "youtube_summarize":
            return await this.handleSummarize(args);
          case "youtube_list_cached":
            return await this.handleListCached();
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

  private extractVideoId(urlOrId: string): string {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = urlOrId.match(pattern);
      if (match) return match[1];
    }

    throw new Error("Invalid YouTube URL or video ID");
  }

  private async handleGetMetadata(args: any) {
    const url = args.url as string;
    const videoId = this.extractVideoId(url);

    console.error(`[Metadata] Video ID: ${videoId}`);

    try {
      // Use fabric-ai to get metadata
      const { stdout } = await execAsync(
        `${FABRIC_PATH} --youtube "https://www.youtube.com/watch?v=${videoId}" --pattern extract_video_metadata 2>/dev/null || echo "{}"`
      );

      let metadata: VideoMetadata;

      // Parse fabric output or create basic metadata
      try {
        const parsed = JSON.parse(stdout.trim() || "{}");
        metadata = {
          videoId,
          title: parsed.title || "Unknown Title",
          url: `https://www.youtube.com/watch?v=${videoId}`,
          channel: parsed.channel || "Unknown Channel",
          duration: parsed.duration || "Unknown",
          publishedAt: parsed.publishedAt || new Date().toISOString(),
          description: parsed.description || "",
        };
      } catch {
        // Fallback metadata
        metadata = {
          videoId,
          title: "Unknown Title",
          url: `https://www.youtube.com/watch?v=${videoId}`,
          channel: "Unknown Channel",
          duration: "Unknown",
          publishedAt: new Date().toISOString(),
          description: "",
        };
      }

      // Save metadata
      await this.saveMetadata(videoId, metadata);

      const text = `# Video Metadata\n\n` +
        `**Title:** ${metadata.title}\n` +
        `**Channel:** ${metadata.channel}\n` +
        `**URL:** ${metadata.url}\n` +
        `**Duration:** ${metadata.duration}\n` +
        `**Published:** ${metadata.publishedAt}\n\n` +
        `**Description:**\n${metadata.description}`;

      return {
        content: [{ type: "text", text }],
      };
    } catch (error) {
      throw new Error(`Failed to get metadata: ${error}`);
    }
  }

  private async handleGetTranscript(args: any) {
    const url = args.url as string;
    const language = args.language as string | undefined;
    const videoId = this.extractVideoId(url);

    console.error(`[Transcript] Video ID: ${videoId}, Language: ${language || "auto"}`);

    try {
      // Check cache first
      const cached = await this.loadTranscript(videoId);
      if (cached) {
        return {
          content: [{
            type: "text",
            text: `# Transcript (cached)\n\n${cached.transcript}`,
          }],
        };
      }

      // Use fabric-ai to get transcript
      const langArg = language ? `--lang ${language}` : "";
      const { stdout } = await execAsync(
        `${FABRIC_PATH} --youtube "https://www.youtube.com/watch?v=${videoId}" ${langArg} --transcript`
      );

      const transcript: VideoTranscript = {
        videoId,
        transcript: stdout.trim(),
        language: language || "auto",
        generatedAt: new Date().toISOString(),
      };

      await this.saveTranscript(videoId, transcript);

      return {
        content: [{
          type: "text",
          text: `# Transcript\n\n${transcript.transcript}`,
        }],
      };
    } catch (error) {
      throw new Error(`Failed to get transcript: ${error}`);
    }
  }

  private async handleExtractWisdom(args: any) {
    const url = args.url as string;
    const forceRefresh = args.force_refresh === true;
    const videoId = this.extractVideoId(url);

    console.error(`[Extract Wisdom] Video ID: ${videoId}, Force: ${forceRefresh}`);

    try {
      // Check cache
      if (!forceRefresh) {
        const cached = await this.loadWisdom(videoId);
        if (cached) {
          return {
            content: [{
              type: "text",
              text: this.formatWisdom(cached),
            }],
          };
        }
      }

      // Use fabric-ai extract_wisdom pattern
      const { stdout } = await execAsync(
        `${FABRIC_PATH} --youtube "https://www.youtube.com/watch?v=${videoId}" --pattern extract_wisdom`
      );

      // Parse the wisdom output
      const wisdom = this.parseWisdomOutput(videoId, stdout);
      await this.saveWisdom(videoId, wisdom);

      return {
        content: [{
          type: "text",
          text: this.formatWisdom(wisdom),
        }],
      };
    } catch (error) {
      throw new Error(`Failed to extract wisdom: ${error}`);
    }
  }

  private parseWisdomOutput(videoId: string, output: string): VideoWisdom {
    // Parse fabric's extract_wisdom output format
    const wisdom: VideoWisdom = {
      videoId,
      summary: "",
      mainPoints: [],
      insights: [],
      quotes: [],
      habits: [],
      facts: [],
      references: [],
      recommendations: [],
      generatedAt: new Date().toISOString(),
    };

    const lines = output.split("\n");
    let currentSection = "";

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith("# SUMMARY")) {
        currentSection = "summary";
      } else if (trimmed.startsWith("# MAIN POINTS") || trimmed.startsWith("# IDEAS")) {
        currentSection = "mainPoints";
      } else if (trimmed.startsWith("# INSIGHTS")) {
        currentSection = "insights";
      } else if (trimmed.startsWith("# QUOTES")) {
        currentSection = "quotes";
      } else if (trimmed.startsWith("# HABITS")) {
        currentSection = "habits";
      } else if (trimmed.startsWith("# FACTS")) {
        currentSection = "facts";
      } else if (trimmed.startsWith("# REFERENCES")) {
        currentSection = "references";
      } else if (trimmed.startsWith("# RECOMMENDATIONS")) {
        currentSection = "recommendations";
      } else if (trimmed.startsWith("-") || trimmed.match(/^\d+\./)) {
        const content = trimmed.replace(/^[-\d.]\s*/, "").trim();
        if (content) {
          switch (currentSection) {
            case "mainPoints": wisdom.mainPoints.push(content); break;
            case "insights": wisdom.insights.push(content); break;
            case "quotes": wisdom.quotes.push(content); break;
            case "habits": wisdom.habits.push(content); break;
            case "facts": wisdom.facts.push(content); break;
            case "references": wisdom.references.push(content); break;
            case "recommendations": wisdom.recommendations.push(content); break;
          }
        }
      } else if (currentSection === "summary" && trimmed && !trimmed.startsWith("#")) {
        wisdom.summary += (wisdom.summary ? " " : "") + trimmed;
      }
    }

    return wisdom;
  }

  private formatWisdom(wisdom: VideoWisdom): string {
    let text = `# Video Wisdom: ${wisdom.videoId}\n\n`;
    text += `**Generated:** ${wisdom.generatedAt}\n\n`;
    
    if (wisdom.summary) {
      text += `## Summary\n\n${wisdom.summary}\n\n`;
    }
    
    if (wisdom.mainPoints.length > 0) {
      text += `## Main Points\n\n`;
      wisdom.mainPoints.forEach((point, i) => {
        text += `${i + 1}. ${point}\n`;
      });
      text += "\n";
    }
    
    if (wisdom.insights.length > 0) {
      text += `## Insights\n\n`;
      wisdom.insights.forEach((insight) => {
        text += `- ${insight}\n`;
      });
      text += "\n";
    }
    
    if (wisdom.quotes.length > 0) {
      text += `## Notable Quotes\n\n`;
      wisdom.quotes.forEach((quote) => {
        text += `> ${quote}\n\n`;
      });
    }
    
    if (wisdom.recommendations.length > 0) {
      text += `## Recommendations\n\n`;
      wisdom.recommendations.forEach((rec) => {
        text += `- ${rec}\n`;
      });
      text += "\n";
    }

    return text;
  }

  private async handleSummarize(args: any) {
    const url = args.url as string;
    const videoId = this.extractVideoId(url);

    console.error(`[Summarize] Video ID: ${videoId}`);

    try {
      const { stdout } = await execAsync(
        `${FABRIC_PATH} --youtube "https://www.youtube.com/watch?v=${videoId}" --pattern summarize`
      );

      return {
        content: [{
          type: "text",
          text: `# Video Summary\n\n${stdout.trim()}`,
        }],
      };
    } catch (error) {
      throw new Error(`Failed to summarize: ${error}`);
    }
  }

  private async handleListCached() {
    try {
      await mkdir(VIDEOS_DIR, { recursive: true });
      const files = await readdir(VIDEOS_DIR);
      
      const metadataFiles = files.filter(f => f.endsWith("-metadata.json"));
      const videos: string[] = [];

      for (const file of metadataFiles) {
        const videoId = file.replace("-metadata.json", "");
        const metadata = await this.loadMetadata(videoId);
        if (metadata) {
          videos.push(
            `**${metadata.title}** (${videoId})\n` +
            `Channel: ${metadata.channel}\n` +
            `URL: ${metadata.url}\n`
          );
        }
      }

      const text = videos.length > 0
        ? `# Cached Videos\n\n${videos.join("\n---\n\n")}`
        : "No cached videos found.";

      return {
        content: [{ type: "text", text }],
      };
    } catch (error) {
      throw new Error(`Failed to list cached videos: ${error}`);
    }
  }

  // Storage helpers
  private async saveMetadata(videoId: string, metadata: VideoMetadata): Promise<void> {
    await mkdir(VIDEOS_DIR, { recursive: true });
    const file = join(VIDEOS_DIR, `${videoId}-metadata.json`);
    await writeFile(file, JSON.stringify(metadata, null, 2));
  }

  private async loadMetadata(videoId: string): Promise<VideoMetadata | null> {
    try {
      const file = join(VIDEOS_DIR, `${videoId}-metadata.json`);
      const data = await readFile(file, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async saveTranscript(videoId: string, transcript: VideoTranscript): Promise<void> {
    await mkdir(VIDEOS_DIR, { recursive: true });
    const file = join(VIDEOS_DIR, `${videoId}-transcript.json`);
    await writeFile(file, JSON.stringify(transcript, null, 2));
  }

  private async loadTranscript(videoId: string): Promise<VideoTranscript | null> {
    try {
      const file = join(VIDEOS_DIR, `${videoId}-transcript.json`);
      const data = await readFile(file, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async saveWisdom(videoId: string, wisdom: VideoWisdom): Promise<void> {
    await mkdir(VIDEOS_DIR, { recursive: true });
    const file = join(VIDEOS_DIR, `${videoId}-wisdom.json`);
    await writeFile(file, JSON.stringify(wisdom, null, 2));
  }

  private async loadWisdom(videoId: string): Promise<VideoWisdom | null> {
    try {
      const file = join(VIDEOS_DIR, `${videoId}-wisdom.json`);
      const data = await readFile(file, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("YouTube Scraper MCP Server running on stdio");
  }
}

const server = new YouTubeScraperServer();
server.run().catch(console.error);
