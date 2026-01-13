# @nutrient-sdk/nudocs-cli

Command-line interface for [Nudocs.ai](https://nudocs.ai) - upload, manage, and export documents.

## Installation

```bash
npm install -g @nutrient-sdk/nudocs-cli
```

Or use directly with npx:

```bash
npx @nutrient-sdk/nudocs-cli upload my-document.md
```

## Setup

Get your API key from [Nudocs.ai](https://nudocs.ai) (click "Integration" after signing in).

Set your API key using one of these methods:

**Environment variable (recommended for CI/scripts):**
```bash
export NUDOCS_API_KEY="nudocs_your_key_here"
```

**Config file (recommended for personal use):**
```bash
mkdir -p ~/.config/nudocs
echo "nudocs_your_key_here" > ~/.config/nudocs/api_key
```

## Usage

### Upload a document

```bash
nudocs upload my-document.md
```

Uploads the file and returns an edit link. Supports markdown, docx, pdf, html, txt, and more.

### List documents

```bash
nudocs list
```

### Get edit link

```bash
nudocs link                    # Last uploaded document
nudocs link 01ABC123XYZ        # Specific document by ULID
```

### Download/Export a document

```bash
nudocs pull                           # Last doc as docx (default)
nudocs pull --format md               # Last doc as markdown
nudocs pull 01ABC123XYZ --format pdf  # Specific doc as PDF
nudocs pull --output report.docx      # Custom output filename
```

### Delete a document

```bash
nudocs delete 01ABC123XYZ
```

### Show configuration

```bash
nudocs config
```

## Supported Formats

### Input (upload)
- Markdown (`.md`)
- Microsoft Word (`.doc`, `.docx`)
- PDF (`.pdf`)
- HTML (`.html`)
- Plain text (`.txt`)
- OpenDocument (`.odt`)
- Rich Text (`.rtf`)
- EPUB (`.epub`)
- LaTeX (`.tex`, `.latex`)

### Output (export)
- Markdown (`.md`)
- Microsoft Word (`.docx`)
- PDF (`.pdf`)
- HTML (`.html`)
- Plain text (`.txt`)
- OpenDocument (`.odt`)
- Rich Text (`.rtf`)
- EPUB (`.epub`)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NUDOCS_API_KEY` | Your Nudocs API key |
| `NUDOCS_URL` | API base URL (default: `https://nudocs.ai`) |

## Use with AI Agents

This CLI works great with AI coding assistants and agents:

- **Claude Code / Codex**: Agents can exec `nudocs upload` and `nudocs pull` commands
- **Custom agents**: Any agent with shell access can use this CLI
- **Clawdbot**: See [@pspdfkit/nudocs-clawdbot-skill](https://clawdhub.com) for native integration

For MCP-based integrations (Claude Desktop), see [@nutrient-sdk/nudocs-mcp-server](https://github.com/PSPDFKit/nudocs-mcp-server).

## License

MIT © [PSPDFKit GmbH](https://pspdfkit.com)

## Links

- [Nudocs.ai](https://nudocs.ai)
- [GitHub Repository](https://github.com/PSPDFKit/nudocs-cli)
- [Report Issues](https://github.com/PSPDFKit/nudocs-cli/issues)
