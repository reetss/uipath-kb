#!/usr/bin/env node

/**
 * Documentation Validator
 * 
 * Validates generated documentation against the knowledge base
 * to ensure consistency, accuracy, and completeness.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

const VALIDATION_RULES = [
  // Structure checks
  {
    name: 'has-title',
    check: (content) => /^#\s+.+/m.test(content),
    message: 'Document must have a level-1 heading (# Title)',
    type: 'error',
  },
  {
    name: 'has-overview',
    check: (content) => /##\s+(Overview|Übersicht|Executive Summary)/i.test(content),
    message: 'Document should have an overview or executive summary section',
    type: 'warning',
  },
  {
    name: 'no-empty-placeholders',
    check: (content) => !/\[.*?\]/.test(content.split('---')[0] || ''),
    message: 'Document contains unfilled placeholders like [Placeholder]',
    type: 'error',
  },
  
  // UIPath specific checks
  {
    name: 'uipath-version-specified',
    check: (content) => /Studio|Orchestrator|Robot/.test(content) ? /\d+\.\d+/.test(content) : true,
    message: 'When mentioning UIPath products, specify version numbers',
    type: 'warning',
  },
  {
    name: 'error-handling-documented',
    check: (content) => /process|workflow/i.test(content) ? /error|exception|retry/i.test(content) : true,
    message: 'Process documentation should include error handling strategy',
    type: 'warning',
  },
  
  // Best practices
  {
    name: 'has-code-examples',
    check: (content) => /implementation|code|beispiel/i.test(content) ? /```/.test(content) : true,
    message: 'Technical documentation should include code examples',
    type: 'suggestion',
  },
  {
    name: 'has-diagrams',
    check: (content) => /architecture|process|flow/i.test(content) ? /```|┌|│|└|flowchart/i.test(content) : true,
    message: 'Architecture/Process docs should include diagrams or visual representations',
    type: 'suggestion',
  },
  {
    name: 'references-docs',
    check: (content) => /docs\.uipath\.com|forum\.uipath\.com/i.test(content),
    message: 'Consider adding references to official UIPath documentation',
    type: 'suggestion',
  },
  
  // Completeness
  {
    name: 'has-metadata',
    check: (content) => /version|author|date|created/i.test(content.substring(0, 500)),
    message: 'Document should include metadata (version, author, date)',
    type: 'warning',
  },
  {
    name: 'has-tags',
    check: (content) => /tags:|Tags:/i.test(content),
    message: 'Document should include tags for better searchability',
    type: 'suggestion',
  },
];

async function validateDocument(filePath) {
  console.log('🔍 UIPath Documentation Validator\n');
  console.log(`📄 Validating: ${filePath}\n`);

  const content = await readFile(filePath, 'utf-8');

  const result = {
    valid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    score: 100,
  };

  // Run all validation rules
  for (const rule of VALIDATION_RULES) {
    const passed = rule.check(content);

    if (!passed) {
      switch (rule.type) {
        case 'error':
          result.errors.push(`❌ ${rule.message}`);
          result.score -= 20;
          result.valid = false;
          break;
        case 'warning':
          result.warnings.push(`⚠️  ${rule.message}`);
          result.score -= 10;
          break;
        case 'suggestion':
          result.suggestions.push(`💡 ${rule.message}`);
          result.score -= 5;
          break;
      }
    }
  }

  // Ensure score doesn't go below 0
  result.score = Math.max(0, result.score);

  // Additional checks
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 100) {
    result.warnings.push('⚠️  Document seems very short (< 100 words). Consider adding more detail.');
    result.score -= 10;
  }

  return result;
}

async function printResults(result) {
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`📊 Validation Score: ${result.score}/100\n`);

  if (result.errors.length > 0) {
    console.log('🚨 ERRORS (Must Fix):\n');
    result.errors.forEach(err => console.log(`   ${err}`));
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS (Should Fix):\n');
    result.warnings.forEach(warn => console.log(`   ${warn}`));
    console.log();
  }

  if (result.suggestions.length > 0) {
    console.log('💡 SUGGESTIONS (Nice to Have):\n');
    result.suggestions.forEach(sugg => console.log(`   ${sugg}`));
    console.log();
  }

  if (result.valid && result.score >= 80) {
    console.log('✅ Document is valid and well-structured!\n');
  } else if (result.valid && result.score >= 60) {
    console.log('✓  Document is valid but could be improved.\n');
  } else if (result.valid) {
    console.log('⚠️  Document is valid but needs significant improvements.\n');
  } else {
    console.log('❌ Document has errors that must be fixed.\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');

  // Recommendations
  if (!result.valid || result.score < 80) {
    console.log('📝 Next Steps:\n');
    console.log('   1. Fix all errors first');
    console.log('   2. Address warnings to improve quality');
    console.log('   3. Consider suggestions for best practices');
    console.log('   4. Re-run validator after changes\n');
  }
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: validate-documentation.js <document.md>');
  console.error('\nExample:');
  console.error('  node validate-documentation.js ./knowledge/generated/architecture-myproject.md');
  process.exit(1);
}

validateDocument(args[0])
  .then(result => {
    printResults(result);
    process.exit(result.valid ? 0 : 1);
  })
  .catch(error => {
    console.error('Error during validation:', error);
    process.exit(1);
  });
