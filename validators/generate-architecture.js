#!/usr/bin/env node

/**
 * Architecture Generator
 * 
 * Generates UIPath architecture documents based on requirements using
 * the knowledge base and templates.
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Requirements {
  projectName: string;
  businessProblem: string;
  goals: string[];
  systems: Array<{
    name: string;
    type: string;
    role: string;
  }>;
  processType: 'attended' | 'unattended' | 'hybrid';
  volumes?: {
    itemsPerDay?: number;
    peakLoad?: number;
  };
}

async function generateArchitecture(requirementsPath: string): Promise<void> {
  console.log('🏗️  UIPath Architecture Generator\n');

  // Load requirements
  console.log('📖 Loading requirements...');
  const requirementsContent = await readFile(requirementsPath, 'utf-8');
  const requirements: Requirements = JSON.parse(requirementsContent);

  console.log(`   Project: ${requirements.projectName}`);
  console.log(`   Type: ${requirements.processType}`);

  // Load template
  console.log('\n📄 Loading architecture template...');
  const templatePath = join(__dirname, '../templates/architecture/architecture-template.md');
  let template = await readFile(templatePath, 'utf-8');

  // Generate architecture
  console.log('\n⚙️  Generating architecture document...');

  // Replace placeholders
  template = template.replace('[Projektname]', requirements.projectName);
  template = template.replace('[Datum]', new Date().toISOString().split('T')[0]);
  template = template.replace('[Beschreibung des Business-Problems, das gelöst werden soll]', requirements.businessProblem);

  // Add goals
  if (requirements.goals && requirements.goals.length > 0) {
    const goalsText = requirements.goals.map((g, i) => `  - ${g}`).join('\n');
    template = template.replace('  - [Ziel 1]\n  - [Ziel 2]', goalsText);
  }

  // Add system components
  if (requirements.systems && requirements.systems.length > 0) {
    let componentsText = '';
    requirements.systems.forEach((sys, i) => {
      componentsText += `\n#### ${i + 1}. ${sys.name}\n\n`;
      componentsText += `**Typ:** ${sys.type}\n`;
      componentsText += `**Verantwortlichkeit:** ${sys.role}\n\n`;
    });
    
    // Find and replace first component section
    const componentRegex = /#### 1\. \[Komponente Name\][\s\S]*?(?=####|## Process Design)/;
    template = template.replace(componentRegex, componentsText);
  }

  // Output path
  const outputPath = join(
    __dirname,
    '../knowledge/generated',
    `architecture-${requirements.projectName.toLowerCase().replace(/\s+/g, '-')}.md`
  );

  // Save document
  console.log(`\n💾 Saving architecture document...`);
  await writeFile(outputPath, template);

  console.log(`✅ Architecture document generated: ${outputPath}`);

  // Generate recommendations
  console.log('\n💡 Recommendations:');
  console.log('   1. Review and complete all [placeholder] sections');
  console.log('   2. Add specific technical details for your components');
  console.log('   3. Define monitoring metrics and alerts');
  console.log('   4. Document integration points and APIs');
  console.log('   5. Validate with the knowledge base using the validator');
  console.log(`\n   Next: npm run validate -- ${outputPath}`);
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: generate-architecture.js <requirements.json>');
  console.error('\nExample:');
  console.error('  node generate-architecture.js ./requirements.json');
  process.exit(1);
}

generateArchitecture(args[0]).catch(console.error);
