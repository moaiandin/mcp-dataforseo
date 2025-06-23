# DataForSEO MCP Server

Model Context Protocol (MCP) server implementation for DataForSEO, enabling ChatGPT or other agents to interact with selected DataForSEO APIs and obtain SEO data through a standardized interface. The server now includes optional tools that satisfy OpenAI's remote MCP requirements for search and document retrieval.

## Features

- SERP API: real-time Search Engine Results Page (SERP) data for Google, Bing, and Yahoo;
- KEYWORDS_DATA API: keyword research and clickstream data, including search volume, cost-per-click, and other metrics;   
- ONPAGE API: allows crawling websites and webpages according to customizable parameters to obtain on-page SEO performance metrics; 
- DATAFORSEO_LABS API: data on keywords, SERPs, and domains based on DataForSEO's in-house databases and proprietary algorithms.

## Prerequisites

- Node.js (v14 or higher)
- DataForSEO API credentials (API login and password)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/dataforseo/mcp-server-typescript
cd mcp-server-typescript
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Required
export DATAFORSEO_USERNAME=your_username
export DATAFORSEO_PASSWORD=your_password

# Optional: specify which modules to enable (comma-separated)
# If not set, all modules will be enabled
export ENABLED_MODULES="SERP,KEYWORDS_DATA,ONPAGE,DATAFORSEO_LABS,BACKLINKS,BUSINESS_DATA,DOMAIN_ANALYTICS,OPENAI"

# Optional: enable full API responses
# If not set or set to false, the server will filter and transform API responses to a more concise format
# If set to true, the server will return the full, unmodified API responses
export DATAFORSEO_FULL_RESPONSE="false"
```

## Installation as an NPM Package

You can install the package globally:

```bash
npm install -g dataforseo-mcp-server
```

Or run it directly without installation:

```bash
npx dataforseo-mcp-server
```

Remember to set environment variables before running the command:

```bash
# Required environment variables
export DATAFORSEO_USERNAME=your_username
export DATAFORSEO_PASSWORD=your_password

# Run with npx
npx dataforseo-mcp-server
```

## Building and Running

Build the project:
```bash
npm run build
```

Run the server:
```bash
# Start local server (direct MCP communication)
npx dataforseo-mcp-server

# Start HTTP server
npx dataforseo-mcp-server http
```

## HTTP Server Configuration

The server runs on port 3000 by default and supports both Basic Authentication and environment variable-based authentication.

To start the HTTP server, run:
```bash
npm run http
```

### Authentication Methods

1. **Basic Authentication**
   - Send requests with Basic Auth header:
   ```
   Authorization: Basic <base64-encoded-credentials>
   ```
   - Credentials format: `username:password`

2. **Environment Variables**
   - If no Basic Auth is provided, the server will use credentials from environment variables:
   ```bash
   export DATAFORSEO_USERNAME=your_username
   export DATAFORSEO_PASSWORD=your_password
   ```
   
## Available Modules

The following modules are available to be enabled/disabled:

- `SERP`: real-time SERP data for Google, Bing, and Yahoo;
- `KEYWORDS_DATA`: keyword research and clickstream data;
- `ONPAGE`: crawl websites and webpages to obtain on-page SEO performance metrics;
- `DATAFORSEO_LABS`: data on keywords, SERPs, and domains based on DataForSEO's databases and algorithms;
- `BACKLINKS`: data on inbound links, referring domains and referring pages for any domain, subdomain, or webpage;
- `BUSINESS_DATA`: based on business reviews and business information publicly shared on the following platforms: Google, Trustpilot, Tripadvisor;
- `DOMAIN_ANALYTICS`: helps identify all possible technologies used for building websites and offers Whois data;
- `OPENAI`: provides `search` and `fetch` tools compatible with ChatGPT connectors;

## Adding New Tools/Modules

### Module Structure

Each module corresponds to a specific DataForSEO API:
- `SERP` module → [SERP API](https://docs.dataforseo.com/v3/serp/overview)
- `KEYWORDS_DATA` module → [Keywords Data API](https://docs.dataforseo.com/v3/keywords_data/overview)
- `ONPAGE` module → [OnPage API](https://docs.dataforseo.com/v3/on_page/overview)
- `DATAFORSEO_LABS` module → [DataForSEO Labs API](https://docs.dataforseo.com/v3/dataforseo_labs/overview)
- `BACKLINKS`: module → [Backlinks API](https://docs.dataforseo.com/v3/backlinks/overview)
- `BUSINESS_DATA`: module → [Business Data API](https://docs.dataforseo.com/v3/business_data/overview)
- `DOMAIN_ANALYTICS`: module → [Domain Analytics API](https://docs.dataforseo.com/v3/domain_analytics/overview)

### Implementation Options

You can either:
1. Add a new tool to an existing module
2. Create a completely new module

### Adding a New Tool

Here's how to add a new tool to any new or pre-existing module:

```typescript
// src/modules/your-module/tools/your-tool.tool.ts
import { BaseTool } from '../../base.tool';
import { DataForSEOClient } from '../../../client/dataforseo.client';
import { z } from 'zod';

export class YourTool extends BaseTool {
  constructor(private client: DataForSEOClient) {
    super(client);
    // DataForSEO API returns extensive data with many fields, which can be overwhelming
    // for AI agents to process. We select only the most relevant fields to ensure
    // efficient and focused responses.
    this.fields = [
      'title',           // Example: Include the title field
      'description',     // Example: Include the description field
      'url',            // Example: Include the URL field
      // Add more fields as needed
    ];
  }

  getName() {
    return 'your-tool-name';
  }

  getDescription() {
    return 'Description of what your tool does';
  }

  getParams(): z.ZodRawShape {
    return {
      // Required parameters
      keyword: z.string().describe('The keyword to search for'),
      location: z.string().describe('Location in format "City,Region,Country" or just "Country"'),
      
      // Optional parameters
      fields: z.array(z.string()).optional().describe('Specific fields to return in the response. If not specified, all fields will be returned'),
      language: z.string().optional().describe('Language code (e.g., "en")'),
    };
  }

  async handle(params: any) {
    try {
      // Make the API call
      const response = await this.client.makeRequest({
        endpoint: '/v3/dataforseo_endpoint_path',
        method: 'POST',
        body: [{
          // Your request parameters
          keyword: params.keyword,
          location: params.location,
          language: params.language,
        }],
      });

      // Validate the response for errors
      this.validateResponse(response);

      //if the main data array is specified in tasks[0].result[:] field
      const result = this.handleDirectResult(response);
      //if main data array specified in tasks[0].result[0].items field
      const result = this.handleItemsResult(response);
      // Format and return the response
      return this.formatResponse(result);
    } catch (error) {
      // Handle and format any errors
      return this.formatErrorResponse(error);
    }
  }
}
```

### Creating a New Module

1. Create a new directory under `src/modules/` for your module:
```bash
mkdir -p src/modules/your-module-name
```

2. Create module files:
```typescript
// src/modules/your-module-name/your-module-name.module.ts
import { BaseModule } from '../base.module';
import { DataForSEOClient } from '../../client/dataforseo.client';
import { YourTool } from './tools/your-tool.tool';

export class YourModuleNameModule extends BaseModule {
  constructor(private client: DataForSEOClient) {
    super();
  }

  getTools() {
    return {
      'your-tool-name': new YourTool(this.client),
    };
  }
}
```

3. Register your module in `src/config/modules.config.ts`:
```typescript
export const AVAILABLE_MODULES = [
  'SERP',
  'KEYWORDS_DATA',
  'ONPAGE',
  'DATAFORSEO_LABS',
  'YOUR_MODULE_NAME',
  'OPENAI'  // Built-in module providing search and fetch for ChatGPT
] as const;
```

4. Initialize your module in `src/index.ts`:
```typescript
if (isModuleEnabled('YOUR_MODULE_NAME', enabledModules)) {
  modules.push(new YourModuleNameModule(dataForSEOClient));
}
```

## What endpoints/APIs do you want us to support next?

We're always looking to expand the capabilities of this MCP server. If you have specific DataForSEO endpoints or APIs you'd like to see supported, please:

1. Check the [DataForSEO API Documentation](https://docs.dataforseo.com/v3/) to see what's available
2. Open an issue in our GitHub repository with:
   - The API/endpoint you'd like to see supported;
   - A brief description of your use case;
   - Describe any specific features you'd like to see implemented.

Your feedback helps us prioritize which APIs to support next!

## Using with ChatGPT

The `OPENAI` module provides a `search` tool and a `fetch` tool that follow OpenAI's [remote MCP server requirements](https://modelcontextprotocol.io/introduction). Enable the module by including `OPENAI` in the `ENABLED_MODULES` environment variable or leave the variable unset to enable all modules.

The search tool accepts a `query` string and allows optional parameters to refine the request:

- `source` – `serp` for live search engine results (default) or `labs` to use DataForSEO Labs keyword ideas
- `search_engine` – one of `google`, `bing`, or `yahoo` (used when `source=serp`)
- `language_code` – language code such as `en`
- `location_name` – full location name (default `United States`)
- `depth` – number of results to fetch from SERP (when `source=serp`)
- `limit` – number of keyword ideas to return (when `source=labs`)

It returns a list of results with `id`, `title`, `text`, and `url`. Use the `fetch` tool with a returned `id` to retrieve the full record for citation in ChatGPT.

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/quickstart)
- [DataForSEO API Documentation](https://docs.dataforseo.com/)