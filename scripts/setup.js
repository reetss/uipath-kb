#!/usr/bin/env node

/**
 * UIPath Knowledge Base - Cross-Platform Setup Script
 * 
 * This script handles the complete setup of the UIPath Knowledge Base project.
 * It works on Windows, macOS, and Linux.
 * 
 * Usage:
 *   npm run setup        # Full setup
 *   npm run setup:check  # Check if everything is installed
 * 
 * @author UIPath Knowledge Base Team
 * @version 2.0.0
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  nodeMinVersion: 18,
  pythonMinVersion: '3.10',
  requiredDirs: ['logs', 'knowledge/videos/audio', 'knowledge/reddit', 'knowledge/usecases'],
  mcpServers: ['uipath-docs', 'youtube-scraper', 'local-knowledge', 'reddit-search'],
};

// ============================================================================
// UTILITIES
// ============================================================================

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, type = 'info') {
  const icons = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✅${colors.reset}`,
    warning: `${colors.yellow}⚠️${colors.reset}`,
    error: `${colors.red}❌${colors.reset}`,
    step: `${colors.cyan}➤${colors.reset}`,
  };
  console.log(`${icons[type] || ''} ${message}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
}

function runCommand(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd || PROJECT_ROOT,
      ...options,
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

function commandExists(command) {
  try {
    const checkCmd = isWindows ? `where ${command}` : `which ${command}`;
    execSync(checkCmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getCommandVersion(command, versionFlag = '--version') {
  try {
    const output = execSync(`${command} ${versionFlag}`, { encoding: 'utf-8', stdio: 'pipe' });
    return output.trim().split('\n')[0];
  } catch {
    return null;
  }
}

// ============================================================================
// CHECK FUNCTIONS
// ============================================================================

function checkNode() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0], 10);
  
  if (major < CONFIG.nodeMinVersion) {
    log(`Node.js ${version} is too old. Required: v${CONFIG.nodeMinVersion}+`, 'error');
    return false;
  }
  
  log(`Node.js ${version}`, 'success');
  return true;
}

function checkNpm() {
  const version = getCommandVersion('npm');
  if (!version) {
    log('npm not found', 'error');
    return false;
  }
  log(`npm ${version}`, 'success');
  return true;
}

function checkPython() {
  // Try python3 first, then python
  const pythonCmd = commandExists('python3') ? 'python3' : 'python';
  
  if (!commandExists(pythonCmd)) {
    log('Python not found. Install Python 3.10+', 'error');
    return false;
  }
  
  const version = getCommandVersion(pythonCmd);
  log(`Python: ${version}`, 'success');
  return true;
}

function checkYtDlp() {
  if (!commandExists('yt-dlp')) {
    log('yt-dlp not found', 'warning');
    log('  Install with: brew install yt-dlp (macOS) or pip install yt-dlp', 'info');
    return false;
  }
  
  const version = getCommandVersion('yt-dlp');
  log(`yt-dlp: ${version}`, 'success');
  return true;
}

function checkFfmpeg() {
  if (!commandExists('ffmpeg')) {
    log('ffmpeg not found', 'warning');
    log('  Install with: brew install ffmpeg (macOS) or download from ffmpeg.org', 'info');
    return false;
  }
  
  const version = getCommandVersion('ffmpeg');
  log(`ffmpeg: ${version?.split(' ')[2] || 'installed'}`, 'success');
  return true;
}

function checkPythonVenv() {
  const venvPath = path.join(PROJECT_ROOT, '.venv-whisper');
  const pythonPath = isWindows
    ? path.join(venvPath, 'Scripts', 'python.exe')
    : path.join(venvPath, 'bin', 'python');
  
  if (!fs.existsSync(pythonPath)) {
    log('Python venv (.venv-whisper) not found', 'warning');
    return false;
  }
  
  // Check if faster-whisper is installed
  try {
    const checkCmd = `"${pythonPath}" -c "import faster_whisper; print('ok')"`;
    execSync(checkCmd, { stdio: 'pipe' });
    log('Python venv with faster-whisper', 'success');
    return true;
  } catch {
    log('faster-whisper not installed in venv', 'warning');
    return false;
  }
}

function checkMcpServers() {
  let allBuilt = true;
  
  for (const server of CONFIG.mcpServers) {
    const distPath = path.join(PROJECT_ROOT, 'mcp-servers', server, 'dist', 'index.js');
    if (!fs.existsSync(distPath)) {
      log(`MCP Server ${server}: not built`, 'warning');
      allBuilt = false;
    } else {
      log(`MCP Server ${server}: built`, 'success');
    }
  }
  
  return allBuilt;
}

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

function createDirectories() {
  log('Creating required directories...', 'step');
  
  for (const dir of CONFIG.requiredDirs) {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`  Created: ${dir}`, 'info');
    }
  }
  
  log('Directories ready', 'success');
}

function installNodeDependencies() {
  log('Installing Node.js dependencies...', 'step');
  runCommand('npm install');
  log('Node.js dependencies installed', 'success');
}

function buildMcpServers() {
  log('Building MCP servers...', 'step');
  runCommand('npm run build');
  log('MCP servers built', 'success');
}

function createPythonVenv() {
  const venvPath = path.join(PROJECT_ROOT, '.venv-whisper');
  
  if (fs.existsSync(venvPath)) {
    log('Python venv already exists', 'info');
    return;
  }
  
  log('Creating Python virtual environment...', 'step');
  
  const pythonCmd = commandExists('python3') ? 'python3' : 'python';
  runCommand(`${pythonCmd} -m venv .venv-whisper`);
  
  // Install faster-whisper
  const pipPath = isWindows
    ? path.join(venvPath, 'Scripts', 'pip')
    : path.join(venvPath, 'bin', 'pip');
  
  log('Installing faster-whisper (this may take a few minutes)...', 'step');
  runCommand(`"${pipPath}" install --upgrade pip`);
  runCommand(`"${pipPath}" install faster-whisper`);
  
  log('Python environment ready', 'success');
}

function runTests() {
  log('Running tests...', 'step');
  
  try {
    runCommand('npm run test:reddit', { stdio: 'inherit' });
    log('All tests passed', 'success');
    return true;
  } catch {
    log('Some tests failed', 'warning');
    return false;
  }
}

function generateClaudeConfig() {
  log('Generating Claude Desktop configuration...', 'step');
  
  const config = {
    mcpServers: {},
  };
  
  for (const server of CONFIG.mcpServers) {
    const serverPath = path.join(PROJECT_ROOT, 'mcp-servers', server, 'dist', 'index.js');
    config.mcpServers[server] = {
      command: 'node',
      args: [serverPath],
      env: {},
    };
  }
  
  const configPath = path.join(PROJECT_ROOT, 'claude-desktop-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  log(`Configuration saved to: claude-desktop-config.json`, 'success');
  log('Copy contents to your Claude Desktop config file:', 'info');
  
  if (isMac) {
    log('  ~/Library/Application Support/Claude/claude_desktop_config.json', 'info');
  } else if (isWindows) {
    log('  %APPDATA%\\Claude\\claude_desktop_config.json', 'info');
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function checkOnly() {
  logSection('UIPath Knowledge Base - System Check');
  
  log('Checking required tools...', 'step');
  console.log('');
  
  const checks = {
    'Node.js': checkNode(),
    'npm': checkNpm(),
    'Python': checkPython(),
    'yt-dlp': checkYtDlp(),
    'ffmpeg': checkFfmpeg(),
    'Python venv': checkPythonVenv(),
    'MCP Servers': checkMcpServers(),
  };
  
  console.log('');
  
  const failed = Object.entries(checks).filter(([, ok]) => !ok);
  
  if (failed.length === 0) {
    log('All checks passed! System is ready.', 'success');
  } else {
    log(`${failed.length} check(s) need attention. Run 'npm run setup' to fix.`, 'warning');
  }
}

async function fullSetup() {
  logSection('UIPath Knowledge Base - Full Setup');
  
  console.log(`Platform: ${os.platform()} (${os.arch()})`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Project: ${PROJECT_ROOT}\n`);
  
  // Step 1: Check prerequisites
  log('Checking prerequisites...', 'step');
  
  if (!checkNode()) {
    log('Please install Node.js 18+ first', 'error');
    process.exit(1);
  }
  
  if (!checkPython()) {
    log('Please install Python 3.10+ first', 'error');
    process.exit(1);
  }
  
  // Step 2: Create directories
  createDirectories();
  
  // Step 3: Install Node dependencies
  installNodeDependencies();
  
  // Step 4: Build MCP servers
  buildMcpServers();
  
  // Step 5: Create Python venv (optional, for video transcription)
  if (checkYtDlp() && checkFfmpeg()) {
    createPythonVenv();
  } else {
    log('Skipping Python venv (yt-dlp or ffmpeg not found)', 'warning');
    log('Video transcription will not be available', 'info');
  }
  
  // Step 6: Run tests
  runTests();
  
  // Step 7: Generate Claude config
  generateClaudeConfig();
  
  // Done!
  logSection('Setup Complete!');
  
  console.log('Next steps:');
  console.log('');
  console.log('1. Copy the MCP server config to Claude Desktop:');
  console.log('   cat claude-desktop-config.json');
  console.log('');
  console.log('2. Restart Claude Desktop');
  console.log('');
  console.log('3. Test the MCP servers:');
  console.log('   - Ask Claude: "Search r/UiPath for API integration"');
  console.log('   - Ask Claude: "Search UIPath docs for REFramework"');
  console.log('');
  console.log('For video transcription (optional):');
  if (isMac) {
    console.log('   brew install yt-dlp ffmpeg');
  } else if (isWindows) {
    console.log('   pip install yt-dlp');
    console.log('   Download ffmpeg from https://ffmpeg.org/download.html');
  }
  console.log('   npm run setup  # Re-run to create Python venv');
  console.log('');
}

// Entry point
const args = process.argv.slice(2);

if (args.includes('--check') || args.includes('-c')) {
  checkOnly();
} else {
  fullSetup();
}
