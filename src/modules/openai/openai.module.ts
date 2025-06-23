import { BaseModule, ToolDefinition } from '../base.module.js';
import { DataForSEOClient } from '../../client/dataforseo.client.js';
import { SearchTool } from './tools/search.tool.js';
import { FetchTool } from './tools/fetch.tool.js';

export class OpenAIToolsModule extends BaseModule {
  constructor(private client: DataForSEOClient) {
    super(client);
  }

  getTools(): Record<string, ToolDefinition> {
    const tools = [
      new SearchTool(this.client),
      new FetchTool(this.client),
    ];

    return tools.reduce((acc, tool) => ({
      ...acc,
      [tool.getName()]: {
        description: tool.getDescription(),
        params: tool.getParams(),
        handler: (params: any) => tool.handle(params),
      },
    }), {});
  }
}
