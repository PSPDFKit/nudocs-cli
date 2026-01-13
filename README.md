<p align="center">
  <img src="https://nudocs.ai/images/nudocs-logo.svg" alt="Nudocs" width="120" />
</p>

<h1 align="center">@nutrient-sdk/nudocs-cli</h1>

<p align="center">
  <strong>Command-line interface for <a href="https://nudocs.ai">Nudocs.ai</a></strong><br>
  Upload, manage, and export documents from your terminal
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nutrient-sdk/nudocs-cli"><img src="https://img.shields.io/npm/v/@nutrient-sdk/nudocs-cli?color=blue&label=npm" alt="npm version"></a>
  <a href="https://github.com/PSPDFKit/nudocs-cli/actions"><img src="https://github.com/PSPDFKit/nudocs-cli/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/PSPDFKit/nudocs-cli/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@nutrient-sdk/nudocs-cli" alt="License"></a>
  <a href="https://www.npmjs.com/package/@nutrient-sdk/nudocs-cli"><img src="https://img.shields.io/npm/dm/@nutrient-sdk/nudocs-cli" alt="Downloads"></a>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#commands">Commands</a> •
  <a href="#use-with-ai-agents">AI Agents</a> •
  <a href="#supported-formats">Formats</a>
</p>

---

## Installation

```bash
npm install -g @nutrient-sdk/nudocs-cli
```

Or use directly with npx:

```bash
npx @nutrient-sdk/nudocs-cli upload my-document.md
```

## Quick Start

### 1. Get your API key

Sign in at [nudocs.ai](https://nudocs.ai) and click **"Integration"** to get your API key.

### 2. Configure the CLI

```bash
# Option A: Environment variable (recommended for CI)
export NUDOCS_API_KEY="nudocs_your_key_here"

# Option B: Config file (recommended for personal use)
mkdir -p ~/.config/nudocs
echo "nudocs_your_key_here" > ~/.config/nudocs/api_key
```

### 3. Upload your first document

```bash
nudocs upload my-document.md
```

You'll get back an edit link to open in Nudocs! ✨

---

## Commands

### `upload` — Upload a document

```bash
nudocs upload report.md
nudocs upload presentation.docx
```

Uploads the file and returns an edit link. The document ID is saved for quick access.

### `list` — List all documents

```bash
nudocs list
```

### `link` — Get edit link

```bash
nudocs link                    # Last uploaded document
nudocs link 01ABC123XYZ        # Specific document by ID
```

### `pull` — Download/export a document

```bash
nudocs pull                           # Last doc as .docx (default)
nudocs pull --format md               # Last doc as markdown
nudocs pull 01ABC123XYZ --format pdf  # Specific doc as PDF
nudocs pull --output report.docx      # Custom output filename
```

### `delete` — Delete a document

```bash
nudocs delete 01ABC123XYZ
```

### `config` — Show configuration

```bash
nudocs config
```

---

## Supported Formats

### Upload (Input)

| Format | Extensions |
|--------|------------|
| Markdown | `.md` |
| Microsoft Word | `.doc`, `.docx` |
| PDF | `.pdf` |
| HTML | `.html` |
| Plain text | `.txt` |
| OpenDocument | `.odt` |
| Rich Text | `.rtf` |
| EPUB | `.epub` |
| LaTeX | `.tex`, `.latex` |

### Export (Output)

| Format | Flag |
|--------|------|
| Word (default) | `--format docx` |
| Markdown | `--format md` |
| PDF | `--format pdf` |
| HTML | `--format html` |
| Plain text | `--format txt` |

---

## Use with AI Agents

This CLI is designed to work seamlessly with AI coding assistants and agents:

### Any Agent with Shell Access

```bash
# Upload a document
nudocs upload my-blog.md

# Get the edit link
nudocs link

# Pull back after editing
nudocs pull --format md
```

### Clawdbot

Install the [Nudocs skill](https://clawdhub.com) for native integration:

```bash
clawdhub install nudocs
```

### Claude Desktop / Claude Code

For native MCP integration, use [@nutrient-sdk/nudocs-mcp-server](https://github.com/PSPDFKit/nudocs-mcp-server).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NUDOCS_API_KEY` | Your Nudocs API key |
| `NUDOCS_URL` | API base URL (default: `https://nudocs.ai`) |

---

## Examples

### Blog Writing Workflow

```bash
# Write your post
echo "# My Blog Post\n\nContent here..." > blog.md

# Upload to Nudocs for rich editing
nudocs upload blog.md
# → Opens in Nudocs with AI assistance

# Pull back the polished version
nudocs pull --format md --output blog-final.md
```

### Document Conversion

```bash
# Upload a markdown file
nudocs upload report.md

# Export as PDF
nudocs pull --format pdf --output report.pdf

# Export as Word
nudocs pull --format docx --output report.docx
```

---

## License

MIT © [PSPDFKit GmbH](https://pspdfkit.com)

---

<p align="center">
  <a href="https://nudocs.ai">Nudocs.ai</a> •
  <a href="https://github.com/PSPDFKit/nudocs-cli/issues">Report Issue</a> •
  <a href="https://github.com/PSPDFKit/nudocs-mcp-server">MCP Server</a>
</p>
