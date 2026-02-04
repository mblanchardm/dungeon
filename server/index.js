/**
 * Campaign API: create campaign, join by code, get party.
 * In-memory storage; no auth (code is the secret).
 */
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = path.join(__dirname, '..', '.cursor', 'debug.log');

function agentLog(payload) {
  const line = JSON.stringify({ ...payload, timestamp: Date.now(), sessionId: 'debug-session' }) + '\n';
  try { fs.appendFileSync(LOG_PATH, line); } catch (_) {}
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use((req, res, next) => {
  // #region agent log
  agentLog({ location: 'server/index.js:before json', message: 'incoming request', data: { method: req.method, path: req.path, contentType: req.headers['content-type'] }, hypothesisId: 'H0' });
  // #endregion
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use((err, req, res, next) => {
  // #region agent log
  agentLog({ location: 'server/index.js:express error middleware', message: 'express error', data: { errMessage: err?.message, errName: err?.name }, hypothesisId: 'H5' });
  // #endregion
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

const campaignsById = new Map();
const campaignIdByCode = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateCampaignId() {
  return `camp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// POST /api/campaigns – create campaign
app.post('/api/campaigns', (req, res) => {
  // #region agent log
  agentLog({ location: 'server/index.js:POST /api/campaigns entry', message: 'create campaign hit', data: { bodyKeys: req.body ? Object.keys(req.body) : [], hasBody: !!req.body }, hypothesisId: 'H1' });
  // #endregion
  try {
    const name = (req.body?.name && String(req.body.name).trim()) || 'My Campaign';
    // #region agent log
    agentLog({ location: 'server/index.js:after name', message: 'name extracted', data: { name }, hypothesisId: 'H2' });
    // #endregion
    let code = generateCode();
    while (campaignIdByCode.has(code)) code = generateCode();
    const campaignId = generateCampaignId();
    const campaign = { id: campaignId, code, name, party: [] };
    campaignsById.set(campaignId, campaign);
    campaignIdByCode.set(code, campaignId);
    // #region agent log
    agentLog({ location: 'server/index.js:before send', message: 'sending 201', data: { campaignId, code }, hypothesisId: 'H3' });
    // #endregion
    res.status(201).json({ campaignId, code });
  } catch (err) {
    // #region agent log
    agentLog({ location: 'server/index.js:create campaign catch', message: 'create campaign error', data: { errMessage: err?.message, errName: err?.name, errStack: err?.stack?.slice(0, 500) }, hypothesisId: 'H4' });
    // #endregion
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

// GET /api/campaigns/by-code/:code – get campaign by code
app.get('/api/campaigns/by-code/:code', (req, res) => {
  const code = (req.params.code || '').toUpperCase().trim();
  const campaignId = campaignIdByCode.get(code);
  if (!campaignId) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  const campaign = campaignsById.get(campaignId);
  if (!campaign) {
    campaignIdByCode.delete(code);
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json({ campaignId: campaign.id, name: campaign.name });
});

// POST /api/campaigns/:campaignId/join – join campaign
app.post('/api/campaigns/:campaignId/join', (req, res) => {
  const campaignId = req.params.campaignId;
  const { code, playerName, character } = req.body || {};
  const campaign = campaignsById.get(campaignId);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  const codeNorm = (code || '').toUpperCase().trim();
  if (codeNorm !== campaign.code) {
    return res.status(400).json({ error: 'Invalid code' });
  }
  if (!character || typeof character !== 'object') {
    return res.status(400).json({ error: 'Character is required' });
  }
  campaign.party.push({
    playerName: playerName && String(playerName).trim() ? String(playerName).trim() : undefined,
    character: { ...character },
  });
  res.status(200).json({ ok: true });
});

// GET /api/campaigns/:campaignId/party – get party
app.get('/api/campaigns/:campaignId/party', (req, res) => {
  const campaign = campaignsById.get(req.params.campaignId);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json({ party: campaign.party });
});

app.listen(PORT, () => {
  console.log(`Campaign API at http://localhost:${PORT}`);
});
