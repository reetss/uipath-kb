#!/usr/bin/env node

/**
 * YouTube Wisdom Extractor mit OpenAI
 * 
 * Liest vorhandene Transkripte und extrahiert Insights via OpenAI API
 * Schneller und zuverlässiger als fabric-ai
 * 
 * Usage:
 *   export OPENAI_API_KEY="your-key-here"
 *   node scripts/extract-wisdom-openai.js knowledge/videos/
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VIDEOS_DIR = process.argv[2] || path.join(__dirname, '../knowledge/videos');

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable not set');
  console.error('\nUsage:');
  console.error('  export OPENAI_API_KEY="sk-..."');
  console.error('  node scripts/extract-wisdom-openai.js [videos-directory]');
  process.exit(1);
}

const WISDOM_PROMPT = `You are an expert at extracting key insights from educational videos.

Analyze this UIPath tutorial transcript and extract:

# SUMMARY
A concise summary of the main topic and purpose (2-3 sentences)

# MAIN POINTS
- Key concepts explained (5-10 bullet points)

# INSIGHTS
- Deeper insights and best practices (3-7 bullet points)

# RECOMMENDATIONS
- Actionable recommendations for developers (3-5 bullet points)

# KEY QUOTES
- Important quotes or statements (if any)

# TOPICS COVERED
- List of specific topics/features discussed

Format your response in clean markdown.`;

async function callOpenAI(transcript) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Schneller und günstiger
      messages: [
        { role: 'system', content: WISDOM_PROMPT },
        { role: 'user', content: transcript.substring(0, 120000) } // Max ~30k tokens
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function processTranscript(transcriptFile) {
  const filename = path.basename(transcriptFile);
  const videoId = filename.replace('-transcript.txt', '');
  
  console.log(`\n📹 Processing: ${videoId}`);
  
  const wisdomFile = path.join(VIDEOS_DIR, `${videoId}-wisdom-openai.md`);
  
  // Check if already processed
  try {
    await fs.access(wisdomFile);
    console.log(`   ⏭️  Already processed, skipping...`);
    return { success: true, cached: true, videoId };
  } catch {
    // Not cached, continue
  }

  try {
    // Read transcript
    console.log(`   📖 Reading transcript...`);
    const transcript = await fs.readFile(transcriptFile, 'utf-8');
    console.log(`   📊 Transcript length: ${transcript.length} chars`);
    
    if (transcript.length < 100) {
      throw new Error('Transcript too short or empty');
    }

    // Extract wisdom
    console.log(`   🧠 Extracting wisdom via OpenAI...`);
    console.log(`   ⏱️  Started: ${new Date().toLocaleTimeString()}`);
    
    const start = Date.now();
    const wisdom = await callOpenAI(transcript);
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    
    // Save wisdom
    await fs.writeFile(wisdomFile, wisdom);
    
    console.log(`   ✅ Wisdom extracted and saved`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   📊 Wisdom length: ${wisdom.length} chars`);
    console.log(`   📁 File: ${videoId}-wisdom-openai.md`);
    
    return { success: true, videoId, duration: parseFloat(duration) };
    
  } catch (err) {
    console.error(`   ❌ Failed: ${err.message}`);
    return { success: false, videoId, error: err.message };
  }
}

async function main() {
  console.log('🚀 YouTube Wisdom Extractor (OpenAI)\n');
  console.log(`📂 Videos directory: ${VIDEOS_DIR}`);
  console.log(`🔑 API Key: ${OPENAI_API_KEY.substring(0, 10)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}\n`);

  // Find all transcript files
  const files = await fs.readdir(VIDEOS_DIR);
  const transcriptFiles = files
    .filter(f => f.endsWith('-transcript.txt'))
    .map(f => path.join(VIDEOS_DIR, f));

  console.log(`📊 Found ${transcriptFiles.length} transcripts to process\n`);

  if (transcriptFiles.length === 0) {
    console.log('💡 Hint: Run batch-process-transcripts.js first to download transcripts');
    return;
  }

  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < transcriptFiles.length; i++) {
    const result = await processTranscript(transcriptFiles[i]);
    results.push(result);

    // Rate limiting: Wait 2 seconds between requests
    if (i < transcriptFiles.length - 1) {
      console.log(`\n⏳ Waiting 2 seconds (rate limiting)...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Processing Summary');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success && !r.cached);
  const failed = results.filter(r => !r.success);
  const cached = results.filter(r => r.cached);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`⏭️  Cached/Skipped: ${cached.length}`);
  console.log(`⏱️  Total time: ${totalTime}s`);
  
  if (successful.length > 0) {
    const avgTime = (successful.reduce((sum, r) => sum + (r.duration || 0), 0) / successful.length).toFixed(1);
    const totalCost = (successful.length * 0.002).toFixed(4); // Geschätzt ~$0.002 per video
    console.log(`⏱️  Average per video: ${avgTime}s`);
    console.log(`💰 Estimated cost: $${totalCost}`);
  }
  
  console.log(`📁 Output directory: ${VIDEOS_DIR}`);

  if (failed.length > 0) {
    console.log('\n❌ Failed videos:');
    failed.forEach(r => console.log(`   - ${r.videoId}: ${r.error}`));
  }

  console.log('\n✨ Done!\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
