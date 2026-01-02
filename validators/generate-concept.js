#!/usr/bin/env node

/**
 * Concept Generator
 * 
 * Generates UIPath concept documents based on a topic using
 * the knowledge base and templates.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateConcept(inputPath) {
  console.log('📝 UIPath Concept Generator\n');

  // Load input
  console.log('📖 Loading concept input...');
  const inputContent = await readFile(inputPath, 'utf-8');
  const input = JSON.parse(inputContent);

  console.log(`   Concept: ${input.name}`);
  console.log(`   Category: ${input.category}`);

  // Load template
  console.log('\n📄 Loading concept template...');
  const templatePath = join(__dirname, '../templates/concepts/concept-template.md');
  let template = await readFile(templatePath, 'utf-8');

  // Generate concept
  console.log('\n⚙️  Generating concept document...');

  // Replace placeholders
  template = template.replace('[Konzeptname]', input.name);
  template = template.replace('[Datum]', new Date().toISOString().split('T')[0]);
  template = template.replace('[Technical/Business/Process]', 
    input.category.charAt(0).toUpperCase() + input.category.slice(1));
  template = template.replace('[Beschreibung des Problems oder der Herausforderung]', input.problem);
  template = template.replace('[Warum ist dieses Konzept wichtig? Welche Benefits bringt es?]', input.motivation);

  // Add components if provided
  if (input.components && input.components.length > 0) {
    let componentsText = '';
    input.components.forEach((comp, i) => {
      componentsText += `\n#### ${i + 1}. ${comp}\n\n`;
      componentsText += `[Beschreibung der Komponente und ihrer Rolle]\n\n`;
      componentsText += `**Eigenschaften:**\n`;
      componentsText += `- [Eigenschaft 1]\n`;
      componentsText += `- [Eigenschaft 2]\n`;
    });
    
    // Replace first component section
    const componentRegex = /#### 1\. \[Komponente 1\][\s\S]*?(?=####|### Funktionsweise)/;
    template = template.replace(componentRegex, componentsText);
  }

  // Add tags
  if (input.tags && input.tags.length > 0) {
    const tagsText = input.tags.map(t => `\`${t}\``).join(', ');
    template = template.replace('`[tag1]`, `[tag2]`, `[tag3]`', tagsText);
  }

  // Output path
  const outputDir = join(__dirname, '../knowledge/generated');
  await mkdir(outputDir, { recursive: true });

  const outputPath = join(
    outputDir,
    `concept-${input.name.toLowerCase().replace(/\s+/g, '-')}.md`
  );

  // Save document
  console.log(`\n💾 Saving concept document...`);
  await writeFile(outputPath, template);

  console.log(`✅ Concept document generated: ${outputPath}`);

  // Generate recommendations
  console.log('\n💡 Recommendations:');
  console.log('   1. Add detailed description and functionality');
  console.log('   2. Include code examples and implementation steps');
  console.log('   3. Document best practices and anti-patterns');
  console.log('   4. Add use cases and real-world examples');
  console.log('   5. Reference related UIPath documentation');
  console.log(`\n   Next: npm run validate -- ${outputPath}`);
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: generate-concept.js <input.json>');
  console.error('\nExample:');
  console.error('  node generate-concept.js ./concept-input.json');
  process.exit(1);
}

generateConcept(args[0]).catch(console.error);
