# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-13

### 🎉 Initial Release

First public release of the Nudocs CLI — a command-line interface for [Nudocs.ai](https://nudocs.ai).

### Added

- **`upload`** — Upload documents (markdown, docx, pdf, html, and more) to Nudocs and get an edit link
- **`list`** — List all your Nudocs documents
- **`link`** — Get a shareable edit link for any document
- **`pull`** — Download/export documents in various formats (docx, md, pdf, html, txt)
- **`delete`** — Delete documents from your Nudocs account
- **`config`** — Show current CLI configuration and status

### Features

- 📄 **15+ input formats** — Upload markdown, Word, PDF, HTML, LaTeX, EPUB, and more
- 📤 **Multiple export formats** — Pull documents back as DOCX (default), Markdown, PDF, HTML, or plain text
- 🔑 **Flexible authentication** — API key via environment variable or config file
- 💾 **Smart state tracking** — Remembers your last upload for quick follow-up commands
- 🤖 **AI agent friendly** — Designed for use with Claude, Codex, Clawdbot, and other AI assistants
- 🔧 **Zero dependencies** — Uses native Node.js fetch, works with Node 18+

### Links

- [Nudocs.ai](https://nudocs.ai)
- [npm package](https://www.npmjs.com/package/@nutrient-sdk/nudocs-cli)
- [GitHub repository](https://github.com/PSPDFKit/nudocs-cli)
- [MCP Server](https://github.com/PSPDFKit/nudocs-mcp-server) (for Claude Desktop)

[1.0.0]: https://github.com/PSPDFKit/nudocs-cli/releases/tag/v1.0.0
