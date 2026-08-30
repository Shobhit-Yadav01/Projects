import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { runExpansionAgent } from './server/agent/expansion-agent.js';
import { BIGQUERY_TABLE_SCHEMAS, RAW_CANDIDATE_LOCATIONS_DATABASE } from './server/data/benchmark-data.js';
import { bigQueryMCP } from './server/mcp/bigquery-mcp-adapter.js';
import { normalizeWeights, scoreAndRankCandidates } from './server/scoring/scoring-engine.js';
import { ScoringWeights } from './server/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'coffee-shop-expansion-intelligence',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Get BigQuery & MCP Connection Status
  app.get('/api/expansion/mcp-status', (req, res) => {
    const status = bigQueryMCP.getConnectionStatus();
    res.json(status);
  });

  // Get Available BigQuery Schemas & Datasets
  app.get('/api/expansion/datasets', (req, res) => {
    res.json({
      schemas: BIGQUERY_TABLE_SCHEMAS,
      status: bigQueryMCP.getConnectionStatus()
    });
  });

  // Test BigQuery MCP Endpoint
  app.post('/api/expansion/test-mcp', async (req, res) => {
    const { mcpServerUrl, projectId, dataset, storesTable, bikeRoutesTable, candidateZonesTable } = req.body;
    try {
      if (mcpServerUrl || projectId) {
        bigQueryMCP.updateConfig({
          mcpServerUrl,
          projectId,
          dataset,
          storesTable,
          bikeRoutesTable,
          candidateZonesTable
        });
      }

      const status = bigQueryMCP.getConnectionStatus();
      const discovery = await bigQueryMCP.listDatasets();

      res.json({
        success: true,
        message: status.message,
        mode: status.mode,
        datasetsFound: discovery.content,
        status
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: `Failed to connect to BigQuery MCP / Cloud project: ${err.message || err}`
      });
    }
  });

  // Update BigQuery MCP Runtime Configuration
  app.post('/api/expansion/update-mcp-config', async (req, res) => {
    try {
      const { projectId, dataset, mcpServerUrl, storesTable, bikeRoutesTable, candidateZonesTable } = req.body;
      bigQueryMCP.updateConfig({
        projectId,
        dataset,
        mcpServerUrl,
        storesTable,
        bikeRoutesTable,
        candidateZonesTable
      });
      const status = bigQueryMCP.getConnectionStatus();
      res.json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to update config' });
    }
  });

  // Main Expansion Agent Analysis Endpoint
  app.post('/api/expansion/analyze', async (req, res) => {
    try {
      const { question, weights, areaFilter } = req.body;
      const userQuestion = question || 'Where should we open our next coffee shop?';
      const result = await runExpansionAgent(userQuestion, weights, areaFilter);
      res.json(result);
    } catch (err: any) {
      console.error('[Expansion Agent Error]:', err);
      res.status(500).json({
        error: err.message || 'Failed to complete expansion analysis.',
        message: 'An error occurred during BigQuery MCP retrieval or Gemini reasoning.'
      });
    }
  });

  // Fast Re-Scoring Endpoint when user tweaks weights
  app.post('/api/expansion/rescore', (req, res) => {
    try {
      const { weights } = req.body as { weights: Partial<ScoringWeights> };
      const normalized = normalizeWeights(weights);
      const ranked = scoreAndRankCandidates(RAW_CANDIDATE_LOCATIONS_DATABASE, normalized);
      res.setHeader('Content-Type', 'application/json');
      res.json({
        weights: normalized,
        candidates: ranked,
        topCandidate: ranked[0]
      });
    } catch (err: any) {
      res.status(500).setHeader('Content-Type', 'application/json').json({ error: err.message || 'Failed to re-score candidates.' });
    }
  });

  // Catch-all for API routes so unhandled /api requests return JSON 404 instead of HTML SPA
  app.all('/api/*', (req, res) => {
    res.status(404).setHeader('Content-Type', 'application/json').json({
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  });

  // --- Vite / Static Assets Handling ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Coffee Expansion Intelligence Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
