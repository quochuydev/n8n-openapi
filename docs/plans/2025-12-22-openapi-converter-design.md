# OpenAPI to n8n HTTP Nodes Converter - Design

## Overview

A web tool that converts OpenAPI/Swagger specifications into n8n HTTP Request nodes, allowing users to quickly generate n8n workflow nodes from API documentation.

## User Flow

### Input Stage
- Three input methods via tabs:
  - **Paste**: Textarea for raw OpenAPI JSON/YAML
  - **Upload**: File picker for .json/.yaml files
  - **URL**: Input field to fetch from swagger URL
- Parse button processes input
- YAML converted to JSON using `js-yaml` library

### Conversion Stage
- Automatically convert ALL endpoints to n8n HTTP nodes on parse
- Extract: paths, methods, operationId, parameters, headers
- Base URL shown in editable field (pre-filled from `servers[0]`)
- Auth requirements added to node description

### Output Stage
- Left panel: Flex grid of node cards
- Right panel: Combined JSON output (updates as user toggles)
- Each card: checkbox (default selected), copy button, method badge
- "Copy All" button for combined JSON
- Unselecting removes from combined output

## Technical Architecture

### Project Structure
```
client/src/
├── App.tsx              # Main app with state management
├── components/
│   ├── InputPanel.tsx   # Paste/Upload/URL tabs
│   ├── NodeCard.tsx     # Individual endpoint card
│   ├── NodeList.tsx     # Grid of NodeCards
│   └── JsonOutput.tsx   # Combined JSON panel with copy
├── lib/
│   ├── parser.ts        # OpenAPI parsing (JSON/YAML)
│   └── converter.ts     # OpenAPI → n8n node conversion
└── types/
    └── index.ts         # TypeScript types
```

### Dependencies
- `js-yaml` - YAML parsing
- `tailwindcss` + `daisyui` - Styling

### State Management
- React `useState` (no external state library needed)
- Key state:
  - `spec`: parsed OpenAPI object
  - `nodes`: generated n8n nodes array
  - `selectedIds`: Set of selected node IDs

## n8n Node Mapping

### Generated Structure
```json
{
  "id": "uuid-generated",
  "name": "Get Users",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.3,
  "position": [x, y],
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/users/{id}",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        { "name": "limit", "value": "" },
        { "name": "offset", "value": "" }
      ]
    },
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "X-Custom-Header", "value": "" }
      ]
    },
    "options": {
      "description": "Auth: Bearer token required"
    }
  }
}
```

### Mapping Rules
- `method` → from OpenAPI path method
- `url` → baseUrl + path (keep `{param}` syntax)
- `queryParameters` → from `parameters` where `in: "query"`
- `headerParameters` → from `parameters` where `in: "header"`
- `description` → auth requirements + operation description

## UI Layout

Flex-based layout for easy future updates:

```
┌─────────────────────────────────────────────────────────┐
│  Header: "OpenAPI → n8n Converter"                      │
├─────────────────────────────────────────────────────────┤
│  Input Panel (tabs: Paste | Upload | URL)               │
│  Base URL: [editable input]                             │
│  [Parse & Convert Button]                               │
├──────────────────────────┬──────────────────────────────┤
│  Node Cards (flex wrap)  │  JSON Output                 │
│  ☑ GET /users [copy]     │  { "nodes": [...] }          │
│  ☑ POST /users [copy]    │                              │
│  ☑ PUT /users [copy]     │  [Copy All]                  │
└──────────────────────────┴──────────────────────────────┘
```

### DaisyUI Components
- `tabs` - input method switching
- `textarea`, `file-input`, `input` - inputs
- `btn btn-primary` - actions
- `card` + `badge` - node cards with method badges
- `checkbox` - selection toggle

## Format Support
- JSON (native parsing)
- YAML (via js-yaml library)
