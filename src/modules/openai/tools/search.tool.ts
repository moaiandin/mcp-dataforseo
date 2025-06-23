import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';
import { randomUUID } from 'node:crypto';

const store = new Map<string, any>();
export function getStore() { return store; }

export class SearchTool extends BaseTool {
  constructor(private client: DataForSEOClient) {
    super(client);
  }

  getName(): string { return 'search'; }

  getDescription(): string {
    return 'Search DataForSEO. Use `source=serp` for live search engine results or `source=labs` for keyword ideas from DataForSEO Labs.';
  }

  getParams(): z.ZodRawShape {
    return {
      query: z.string().describe('Search keyword'),
      source: z.enum(['serp', 'labs']).default('serp').describe('Data source: serp for live search engine results or labs for DataForSEO Labs keyword ideas'),
      search_engine: z.enum(['google', 'bing', 'yahoo']).default('google').describe('Search engine name (for source=serp)'),
      language_code: z.string().default('en').describe("Language code (e.g., 'en')"),
      location_name: z.string().default('United States').describe('Full location name'),
      depth: z.number().min(10).max(700).default(10).describe('Number of results to fetch from SERP (source=serp)'),
      limit: z.number().min(1).max(1000).default(10).describe('Number of keyword ideas to return (source=labs)')
    };
  }

  async handle(params: any): Promise<any> {
    try {
      let items: any[] = [];
      if (params.source === 'labs') {
        const response: any = await this.client.makeRequest('/v3/dataforseo_labs/google/keyword_ideas/live', 'POST', [{
          keywords: [params.query],
          location_name: params.location_name,
          language_code: params.language_code,
          limit: params.limit,
        }], true);
        items = response?.tasks?.[0]?.result?.[0]?.items || [];
        const results = items.map((item: any) => {
          const id = randomUUID();
          store.set(id, item);
          return {
            id,
            title: item.keyword || item.keyword_data?.keyword,
            text: `search volume: ${item.keyword_info?.search_volume ?? ''}`,
            url: null
          };
        });
        return { results };
      } else {
        const response: any = await this.client.makeRequest(`/v3/serp/${params.search_engine}/organic/live/advanced`, 'POST', [{
          keyword: params.query,
          location_name: params.location_name,
          language_code: params.language_code,
          depth: params.depth,
        }], true);
        items = response?.tasks?.[0]?.result?.[0]?.items || [];
        const results = items.map((item: any) => {
          const id = randomUUID();
          store.set(id, item);
          return {
            id,
            title: item.title,
            text: item.description || item.snippet || '',
            url: item.url
          };
        });
        return { results };
      }
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}
