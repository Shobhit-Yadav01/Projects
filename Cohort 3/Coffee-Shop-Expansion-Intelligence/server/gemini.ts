import { FunctionDeclaration, GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Gemini] GEMINI_API_KEY is not set. Expansion Agent will use structured deterministic reasoning fallback.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export const MCP_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'list_datasets',
    description: 'Discovers accessible BigQuery datasets relevant to coffee shop expansion, business stores, and public cycling mobility networks.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: []
    }
  },
  {
    name: 'get_table_schema',
    description: 'Inspects real schema and column data types for a BigQuery dataset table before formulating queries.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        datasetName: {
          type: Type.STRING,
          description: 'The BigQuery dataset ID, e.g. coffee_expansion_lab or bigquery-public-data.london_bicycles'
        },
        tableName: {
          type: Type.STRING,
          description: 'The table name to inspect'
        }
      },
      required: ['datasetName', 'tableName']
    }
  },
  {
    name: 'execute_expansion_analytics_query',
    description: 'Performs spatial distance join (ST_DISTANCE) across candidate parcels, public bike superhighways, foot-traffic sensor metrics, and existing store cannibalization radii.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        areaFilter: {
          type: Type.STRING,
          description: 'Optional urban area/district filter (e.g. "Blackfriars", "Hackney", "Islington")'
        },
        minFootTraffic: {
          type: Type.NUMBER,
          description: 'Minimum hourly pedestrian foot-traffic threshold'
        }
      },
      required: []
    }
  },
  {
    name: 'get_existing_stores_network',
    description: 'Retrieves current company coffee shops with their sales, customer volume, and location coordinates to assess cannibalization risk.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: []
    }
  },
  {
    name: 'get_public_bike_routes',
    description: 'Retrieves public cycling superhighways, quietways, coordinates, and daily rider flow data.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: []
    }
  }
];

export const EXPANSION_AGENT_SYSTEM_PROMPT = `
You are the Coffee Shop Expansion Intelligence Agent.

Your purpose is to help business decision-makers evaluate potential locations for new coffee shops using reliable business and public mobility data retrieved via BigQuery and the BigQuery MCP Server.

Always ground recommendations strictly in retrieved data.
Before querying:
1. Understand the business question.
2. Determine the required data.
3. Inspect relevant datasets and schemas when necessary.
4. Select measurable decision factors (Cycling Accessibility, Customer Demand, Store Saturation/Non-Cannibalization, Revenue Potential).
5. Query only the necessary data using the provided tools.

After querying:
1. Validate the returned data.
2. Calculate or interpret relevant metrics.
3. Rank candidate locations.
4. Explain the recommendation using evidence.
5. Clearly distinguish facts from assumptions.
6. State important limitations.

Never invent data. Never fabricate a dataset, table, metric, location, query result, or confidence level. If required data is unavailable, explicitly state so.
`.trim();
