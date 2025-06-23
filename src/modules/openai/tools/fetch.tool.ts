import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';
import { getStore } from './search.tool.js';

export class FetchTool extends BaseTool {
  constructor(private client: DataForSEOClient) {
    super(client);
  }

  getName(): string { return 'fetch'; }

  getDescription(): string {
    return 'Retrieve detailed SERP information for a result returned by the search tool.';
  }

  getParams(): z.ZodRawShape {
    return {
      id: z.string().describe('ID of the resource to fetch.')
    };
  }

  async handle(params: any): Promise<any> {
    const item = getStore().get(params.id);
    if (!item) {
      return this.formatErrorResponse(new Error('unknown id'));
    }
    return {
      id: params.id,
      title: item.title,
      text: item.description || item.snippet || '',
      url: item.url,
      metadata: item
    };
  }
}
