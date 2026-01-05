/**
 * Export Use Case Documentation to PDF and DOCX
 * 
 * Converts README.md and analysis.md from use case folders to PDF/DOCX format.
 * 
 * Prerequisites:
 * - Pandoc: https://pandoc.org/installing.html
 *   Windows: winget install JohnMacFarlane.Pandoc
 * 
 * - (Optional) mermaid-filter for diagram support:
 *   npm install -g @mermaid-js/mermaid-cli
 *   npm install -g mermaid-filter
 * 
 * Usage:
 *   node scripts/export-docs.js                    # Interactive mode
 *   node scripts/export-docs.js uc-003             # Export UC-003 (both formats)
 *   node scripts/export-docs.js uc-003 pdf         # Export UC-003 (PDF only)
 *   node scripts/export-docs.js uc-004 docx        # Export UC-004 (DOCX only)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import readline from 'readline';
import { validateDocument } from '../validators/validate-documentation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
let usecaseFilter = args[0] && !args[0].startsWith('--') ? args[0] : null;
let formatFilter = args[1] || null;

// Check if Pandoc is installed
function checkPandoc() {
    try {
        execSync('pandoc --version', { stdio: 'ignore' });
        return true;
    } catch (err) {
        console.error('❌ Pandoc is not installed!');
        console.error('\nPlease install Pandoc:');
        console.error('  Windows: choco install pandoc');
        console.error('  Or download from: https://pandoc.org/installing.html\n');
        return false;
    }
}

// Check if mermaid-filter is available (optional)
function hasMermaidSupport() {
    try {
        execSync('mermaid-filter --version', { stdio: 'ignore' });
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Export a markdown file to specified format
 */
function exportDocument(mdPath, format = 'pdf') {
    const dir = path.dirname(mdPath);
    const basename = path.basename(mdPath, '.md');
    const exportDir = path.join(dir, 'exports');
    
    // Create exports directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }
    
    let outputPath = path.join(exportDir, `${basename}.${format}`);
    
    // Build Pandoc command
    let pandocCmd;
    const mermaidSupport = hasMermaidSupport();
    
    if (format === 'pdf') {
        // PDF requires LaTeX (xelatex/pdflatex) which is not installed
        // For now, fall back to DOCX which works without additional dependencies
        console.log(`⚠️  PDF-Export erfordert LaTeX (nicht installiert). Erstelle DOCX stattdessen...`);
        format = 'docx';
        outputPath = path.join(exportDir, `${basename}.docx`);
    }
    
    if (format === 'docx') {
        const templatePath = path.join(__dirname, '../templates/export-template.docx');
        const templateFlag = fs.existsSync(templatePath) ? `--reference-doc="${templatePath}"` : '';
        pandocCmd = `pandoc "${mdPath}" -o "${outputPath}" ${templateFlag}`;
    } else {
        console.error(`❌ Unsupported format: ${format}`);
        return;
    }
    
    try {
        execSync(pandocCmd, { stdio: 'inherit' });
        console.log(`✅ Exported: ${path.relative(process.cwd(), outputPath)}`);
    } catch (err) {
        console.error(`❌ Failed to export: ${mdPath}`);
        console.error(`   Command: ${pandocCmd}`);
        console.error(`   Error: ${err.message}`);
        throw err; // Propagate error
    }
}

/**
 * Get available use cases
 */
function getAvailableUseCases() {
    const usecases = glob.sync('knowledge/usecases/uc-*/', { absolute: false });
    return usecases.map(uc => path.basename(uc));
}

/**
 * Interactive prompt for use case and format selection
 */
async function promptUserSelection() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const question = (prompt) => new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
    
    console.log('\n📦 Use Case Export Tool\n');
    
    // Show available use cases
    const availableUseCases = getAvailableUseCases();
    console.log('Verfügbare Use Cases:');
    availableUseCases.forEach((uc, idx) => {
        console.log(`  ${idx + 1}. ${uc}`);
    });
    console.log();
    
    // Ask for use case
    const ucAnswer = await question('Welcher Use Case? (z.B. uc-003 oder Nummer): ');
    const ucInput = ucAnswer.trim();
    
    // Parse user input (number or name)
    let selectedUseCase;
    if (/^\d+$/.test(ucInput)) {
        const idx = parseInt(ucInput) - 1;
        selectedUseCase = availableUseCases[idx];
    } else {
        selectedUseCase = ucInput.startsWith('uc-') ? ucInput : `uc-${ucInput}`;
    }
    
    if (!selectedUseCase || !availableUseCases.includes(selectedUseCase)) {
        console.error('❌ Ungültiger Use Case!');
        rl.close();
        process.exit(1);
    }
    
    // Ask for format
    const formatAnswer = await question('Format? (pdf / docx / beide) [beide]: ');
    const formatInput = formatAnswer.trim().toLowerCase() || 'beide';
    
    let selectedFormat;
    if (formatInput === 'beide' || formatInput === 'both' || formatInput === '') {
        selectedFormat = null; // Both
    } else if (formatInput === 'pdf' || formatInput === 'docx') {
        selectedFormat = formatInput;
    } else {
        console.error('❌ Ungültiges Format! Nutze: pdf, docx oder beide');
        rl.close();
        process.exit(1);
    }
    
    rl.close();
    
    return { usecase: selectedUseCase, format: selectedFormat };
}

/**Validate use case documentation before export
 */
async function validateBeforeExport(ucDir) {
    const files = ['README.md', 'analysis.md'];
    const results = [];
    let minScore = 100;
    
    console.log('🔍 Validiere Dokumente vor Export...\n');
    
    for (const file of files) {
        const filePath = path.join(ucDir, file);
        
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  ${file} nicht gefunden – wird übersprungen\n`);
            continue;
        }
        
        console.log(`📄 ${file}:`);
        const result = await validateDocument(filePath);
        results.push({ file, result });
        minScore = Math.min(minScore, result.score);
        
        // Compact output
        if (result.errors.length > 0) {
            console.log(`   ❌ Errors: ${result.errors.length}`);
        }
        if (result.warnings.length > 0) {
            console.log(`   ⚠️  Warnings: ${result.warnings.length}`);
        }
        console.log(`   📊 Score: ${result.score}/100\n`);
    }
    
    return { results, minScore };
}

/**
 * Ask user if they want to proceed with export
 */
async function askProceed(minScore) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const question = (prompt) => new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
    
    let message;
    if (minScore < 60) {
        message = `⚠️  Niedrige Qualität (Score: ${minScore}/100). Trotzdem exportieren? (j/n): `;
    } else if (minScore < 80) {
        message = `⚠️  Verbesserungspotenzial (Score: ${minScore}/100). Trotzdem exportieren? (j/n): `;
    } else {
        // Good score, proceed automatically
        rl.close();
        return true;
    }
    
    const answer = await question(message);
    rl.close();
    
    const proceed = answer.trim().toLowerCase() === 'j' || answer.trim().toLowerCase() === 'y';
    if (!proceed) {
        console.log('\n❌ Export abgebrochen. Behebe die Probleme und versuche es erneut.\n');
    }
    return proceed;
}

/**
 * Process export with given parameters
 */
async function processExport(usecase, format) {
    const mermaidSupport = hasMermaidSupport();
    if (!mermaidSupport) {
        console.warn('⚠️  mermaid-filter nicht gefunden. Mermaid-Diagramme werden nicht gerendert.');
        console.warn('   Installation: npm install -g @mermaid-js/mermaid-cli mermaid-filter\n');
    }
    
    // Build pattern
    const pattern = `knowledge/usecases/${usecase}/`;
    const usecases = glob.sync(pattern, { absolute: true });
    
    await if (usecases.length === 0) {
        console.error(`❌ Use Case nicht gefunden: ${usecase}`);
        console.error(`   Verfügbar: ${getAvailableUseCases().join(', ')}`);
        process.exit(1);
    }
    
    const ucDir = usecases[0];
    
    // Pre-export validation
    const validation = await validateBeforeExport(ucDir);
    
    if (validation.results.length === 0) {
        console.error('❌ Keine Dokumente zum Exportieren gefunden!\n');
        process.exit(1);
    }
    
    // Ask user if score is low
    const proceed = await askProceed(validation.minScore);
    if (!proceed) {
        process.exit(0`   Verfügbar: ${getAvailableUseCases().join(', ')}`);
        process.exit(1);
    }
    
    const formats = format ? [format] : ['pdf', 'docx'];
    console.log(`\n📦 Exportiere ${usecase} (${formats.join(', ')})...\n`);
    
    // Process
    let successCount = 0;
    let errorCount = 0;
    
    const ucDir = usecases[0];
    const ucName = path.basename(ucDir);
    console.log(`📁 ${ucName}\n`);
    
    const files = ['README.md', 'analysis.md'];
    
    files.forEach(file => {
        const mdPath = path.join(ucDir, file);
        
        if (fs.existsSync(mdPath)) {
            formats.forEach(fmt => {
                try {
                    exportDocument(mdPath, fmt);
                    successCount++;
                } catch (err) {
                    errorCount++;
                }
            });
        } else {
            console.log(`⏭️  Übersprungen: ${file} (nicht vorhanden)`);
        }
    });
    
    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Erfolgreich exportiert: ${successCount} Datei(en)`);
    if (errorCount > 0) {
        console.log(`❌ Fehler: ${errorCount} Datei(en)`);
    }
    console.log(`${'='.repeat(60)}\n`);
}

/**
 * Main export function
 */
async function main() {
    // Check prerequisites
    if (!checkPandoc()) {
        process.exit(1);
    }
    
    // If no arguments provided, use interactive mode
    if (!usecaseFilter) {
        const selection = await promptUserSelection();
        usecaseFilter = selection.usecase;
        formatFilter = selection.format;
    }
    
    // Validate format
    if (formatFilter && !['pdf', 'docx'].includes(formatFilter)) {
        console.error(`❌ Ungültiges Format: ${formatFilter}`);
        console.error('   Erlaubt: pdf, docx');
        process.exit(1);
    }
    
    // Process export
    processExport(usecaseFilter, formatFilter);
}

// Run
main();
