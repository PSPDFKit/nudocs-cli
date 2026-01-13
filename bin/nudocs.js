#!/usr/bin/env node

/**
 * Nudocs CLI - Upload, manage, and export documents via Nudocs.ai
 * https://github.com/PSPDFKit/nudocs-cli
 * 
 * @license MIT
 * @copyright PSPDFKit GmbH
 */

const fs = require('fs');
const path = require('path');

// Config paths
const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'nudocs');
const API_KEY_FILE = path.join(CONFIG_DIR, 'api_key');
const STATE_FILE = path.join(CONFIG_DIR, 'state.json');
const BASE_URL = process.env.NUDOCS_URL || 'https://nudocs.ai';

// MIME type mappings
const MIME_TYPES = {
  md: 'text/markdown',
  markdown: 'text/markdown',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
  html: 'text/html',
  txt: 'text/plain',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  epub: 'application/epub+zip',
  latex: 'application/x-latex',
  tex: 'application/x-latex',
};

// File extensions for output
const EXTENSIONS = {
  'text/markdown': 'md',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/pdf': 'pdf',
  'text/html': 'html',
  'text/plain': 'txt',
};

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function getApiKey() {
  // Check environment variable first
  if (process.env.NUDOCS_API_KEY) {
    return process.env.NUDOCS_API_KEY;
  }
  
  // Fall back to config file
  if (fs.existsSync(API_KEY_FILE)) {
    return fs.readFileSync(API_KEY_FILE, 'utf-8').trim();
  }
  
  console.error('Error: No API key found.');
  console.error('');
  console.error('Set your API key using one of these methods:');
  console.error('');
  console.error('  1. Environment variable:');
  console.error('     export NUDOCS_API_KEY="nudocs_your_key_here"');
  console.error('');
  console.error('  2. Config file:');
  console.error('     mkdir -p ~/.config/nudocs');
  console.error('     echo "nudocs_your_key_here" > ~/.config/nudocs/api_key');
  console.error('');
  console.error('Get your API key at: https://nudocs.ai (click "Integration")');
  process.exit(1);
}

function getState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveState(state) {
  ensureConfigDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function updateLastUpload(ulid, title) {
  const state = getState();
  state.lastUpload = {
    ulid,
    title,
    uploadedAt: new Date().toISOString(),
  };
  saveState(state);
}

function getLastUlid() {
  const state = getState();
  return state.lastUpload?.ulid;
}

async function apiRequest(endpoint, options = {}) {
  const apiKey = getApiKey();
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const text = await response.text();
    let errorMsg;
    try {
      const json = JSON.parse(text);
      errorMsg = json.error || json.message || text;
    } catch {
      errorMsg = text;
    }
    throw new Error(`API Error (${response.status}): ${errorMsg}`);
  }
  
  return response;
}

function getMimeType(format) {
  const normalized = format.toLowerCase().replace('.', '');
  return MIME_TYPES[normalized] || MIME_TYPES.md;
}

// ─────────────────────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────────────────────

async function uploadFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
  
  // Create form data using a boundary
  const boundary = '----NudocsBoundary' + Date.now();
  const formData = Buffer.concat([
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`),
    Buffer.from(`Content-Type: ${mimeType}\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  
  console.log(`Uploading: ${fileName}...`);
  
  const response = await apiRequest('/api/public/documents', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: formData,
  });
  
  const result = await response.json();
  
  // Save the ULID for future reference
  updateLastUpload(result.ulid, result.title);
  
  // Get the access link
  const linkResponse = await apiRequest(`/api/public/documents/${result.ulid}`);
  const linkResult = await linkResponse.json();
  
  console.log('');
  console.log('✓ Upload successful');
  console.log(`  ULID:  ${result.ulid}`);
  console.log(`  Title: ${result.title}`);
  console.log(`  Link:  ${linkResult.url}`);
  
  return result;
}

async function listDocuments() {
  const response = await apiRequest('/api/public/documents');
  const docs = await response.json();
  
  if (docs.length === 0) {
    console.log('No documents found.');
    return;
  }
  
  console.log(`Found ${docs.length} document(s):\n`);
  
  for (const doc of docs) {
    const title = doc.title || 'Untitled';
    console.log(`  ${doc.ulid}`);
    console.log(`    Title: ${title}`);
    console.log(`    Owner: ${doc.owner}`);
    console.log('');
  }
}

async function getLink(ulid) {
  const targetUlid = ulid || getLastUlid();
  
  if (!targetUlid) {
    console.error('Error: No ULID provided and no previous upload found.');
    console.error('Usage: nudocs link <ulid>');
    process.exit(1);
  }
  
  if (!ulid) {
    console.log(`Using last upload: ${targetUlid}`);
  }
  
  const response = await apiRequest(`/api/public/documents/${targetUlid}`);
  const result = await response.json();
  
  console.log(result.url);
  
  return result.url;
}

async function pullDocument(ulid, format = 'docx', outputPath) {
  const targetUlid = ulid || getLastUlid();
  
  if (!targetUlid) {
    console.error('Error: No ULID provided and no previous upload found.');
    console.error('Usage: nudocs pull <ulid> [--format md|docx|pdf]');
    process.exit(1);
  }
  
  if (!ulid) {
    console.log(`Using last upload: ${targetUlid}`);
  }
  
  const mimeType = getMimeType(format);
  
  console.log(`Downloading ${targetUlid} as ${format}...`);
  
  const response = await apiRequest(`/api/public/documents/${targetUlid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mimeType }),
  });
  
  const buffer = Buffer.from(await response.arrayBuffer());
  
  // Determine output filename
  const ext = EXTENSIONS[mimeType] || format;
  const outFile = outputPath || `${targetUlid}.${ext}`;
  
  fs.writeFileSync(outFile, buffer);
  
  console.log(`✓ Saved: ${outFile}`);
  
  return outFile;
}

async function deleteDocument(ulid) {
  if (!ulid) {
    console.error('Error: ULID required for delete.');
    console.error('Usage: nudocs delete <ulid>');
    process.exit(1);
  }
  
  console.log(`Deleting ${ulid}...`);
  
  await apiRequest(`/api/public/documents/${ulid}`, {
    method: 'DELETE',
  });
  
  // Clear from state if it was the last upload
  const state = getState();
  if (state.lastUpload?.ulid === ulid) {
    delete state.lastUpload;
    saveState(state);
  }
  
  console.log('✓ Deleted');
}

async function showConfig() {
  console.log('Nudocs CLI Configuration\n');
  console.log(`Config directory: ${CONFIG_DIR}`);
  console.log(`API key file:     ${API_KEY_FILE}`);
  console.log(`State file:       ${STATE_FILE}`);
  console.log(`API base URL:     ${BASE_URL}`);
  console.log('');
  
  const hasKey = process.env.NUDOCS_API_KEY || fs.existsSync(API_KEY_FILE);
  console.log(`API key:          ${hasKey ? '✓ configured' : '✗ not set'}`);
  
  const state = getState();
  if (state.lastUpload) {
    console.log('');
    console.log('Last upload:');
    console.log(`  ULID:  ${state.lastUpload.ulid}`);
    console.log(`  Title: ${state.lastUpload.title}`);
    console.log(`  Date:  ${state.lastUpload.uploadedAt}`);
  }
}

// ─────────────────────────────────────────────────────────────
// CLI Entry Point
// ─────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
Nudocs CLI - Manage documents on Nudocs.ai

USAGE
  nudocs <command> [options]

COMMANDS
  upload <file>              Upload a file and get an edit link
  list                       List all your documents
  link [ulid]                Get the edit link (uses last upload if no ULID)
  pull [ulid] [options]      Download/export a document
  delete <ulid>              Delete a document
  config                     Show configuration info

OPTIONS
  --format <fmt>             Export format: md, docx, pdf, html, txt (default: docx)
  --output <path>            Output file path for pull command
  --help, -h                 Show this help message
  --version, -v              Show version

SETUP
  Get your API key at https://nudocs.ai (click "Integration")

  Set via environment variable:
    export NUDOCS_API_KEY="nudocs_your_key_here"

  Or save to config file:
    mkdir -p ~/.config/nudocs
    echo "nudocs_your_key_here" > ~/.config/nudocs/api_key

EXAMPLES
  nudocs upload my-blog.md           Upload and get edit link
  nudocs link                        Get link for last uploaded doc
  nudocs pull --format md            Download last doc as markdown
  nudocs pull ABC123 --format pdf    Download specific doc as PDF
  nudocs list                        Show all documents
  nudocs delete ABC123               Delete a document

SUPPORTED FORMATS
  Input:  md, docx, doc, pdf, html, txt, odt, rtf, epub, latex, tex
  Output: md, docx, pdf, html, txt, odt, rtf, epub

More info: https://nudocs.ai
Repository: https://github.com/PSPDFKit/nudocs-cli
`);
}

function printVersion() {
  const pkg = require('../package.json');
  console.log(`nudocs-cli v${pkg.version}`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    printVersion();
    process.exit(0);
  }
  
  const command = args[0];
  
  // Parse options
  let format = 'docx';
  let output = null;
  let positionalArgs = [];
  
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      format = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      output = args[++i];
    } else if (!args[i].startsWith('--')) {
      positionalArgs.push(args[i]);
    }
  }
  
  try {
    switch (command) {
      case 'upload':
        if (!positionalArgs[0]) {
          console.error('Error: File path required.');
          console.error('Usage: nudocs upload <file>');
          process.exit(1);
        }
        await uploadFile(positionalArgs[0]);
        break;
        
      case 'list':
      case 'ls':
        await listDocuments();
        break;
        
      case 'link':
      case 'url':
        await getLink(positionalArgs[0]);
        break;
        
      case 'pull':
      case 'download':
      case 'export':
        await pullDocument(positionalArgs[0], format, output);
        break;
        
      case 'delete':
      case 'rm':
        await deleteDocument(positionalArgs[0]);
        break;
        
      case 'config':
        await showConfig();
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run "nudocs --help" for usage.');
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n✗ ${error.message}`);
    process.exit(1);
  }
}

main();
