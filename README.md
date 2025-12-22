# OpenAPI to n8n Converter

A web-based tool that converts OpenAPI/Swagger specifications into n8n workflow nodes. Simply paste your API spec and get ready-to-use n8n HTTP Request nodes.

![Demo](public/demo.mov)

## Features

- **Multiple Input Methods**: Fetch from URL, paste directly, or upload files
- **Format Support**: OpenAPI 3.x and Swagger 2.0 (JSON/YAML)
- **Tab-based Interface**: Work with multiple API specs simultaneously
- **Node Selection**: Pick specific endpoints to include in your workflow
- **Editable Base URL**: Override the API base URL as needed
- **Copy to Clipboard**: One-click copy for individual nodes or entire workflows
- **Local Storage**: Your conversions persist across browser sessions

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Input your OpenAPI spec**:
   - **URL**: Enter the URL to your swagger.json or openapi.yaml
   - **Paste**: Paste the raw JSON/YAML content
   - **Upload**: Upload a local spec file

2. **Click "Parse & Convert"** to generate n8n nodes

3. **Select the nodes** you want to include in your workflow

4. **Copy the output** and paste directly into n8n's workflow editor

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [DaisyUI 5](https://daisyui.com/) - Component library
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety

## How It Works

The converter parses your OpenAPI/Swagger specification and generates n8n HTTP Request nodes for each endpoint. Each node includes:

- HTTP method and URL
- Path parameters
- Query parameters
- Request body schema (for POST/PUT/PATCH)
- Proper n8n node formatting

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Huy Pham
