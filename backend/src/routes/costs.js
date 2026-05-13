const router = require('express').Router();
const { authenticate }  = require('../middleware/auth');
const { requireRole }   = require('../middleware/rbac');
const svc               = require('../services/mockCostService');

// Every cost route needs a valid JWT
router.use(authenticate);

// ── GET /api/costs/filter-options ─────────────────────────────
// Returns distinct teams, services, projects for dropdown menus
router.get('/filter-options', async (req, res, next) => {
  try {
    const data = await svc.getFilterOptions();
    res.json(data);
  } catch (err) { next(err); }
});

// ── GET /api/costs/summary ────────────────────────────────────
// ?days=30  &team=backend  &service=Compute  &project=xyz
// &from=2025-01-01  &to=2025-01-31
router.get('/summary', async (req, res, next) => {
  try {
    const data = await svc.getSummary(req.query);
    res.json(data);
  } catch (err) { next(err); }
});

// ── GET /api/costs/daily ──────────────────────────────────────
// Returns array of { date, total, breakdown:{service->cost} }
router.get('/daily', async (req, res, next) => {
  try {
    const data = await svc.getDailyCosts(req.query);
    res.json({ data, filters: req.query });
  } catch (err) { next(err); }
});

// ── GET /api/costs/by-service ─────────────────────────────────
router.get('/by-service', async (req, res, next) => {
  try {
    const data = await svc.getCostByService(req.query);
    res.json({ data });
  } catch (err) { next(err); }
});

// ── GET /api/costs/by-team ────────────────────────────────────
router.get('/by-team', async (req, res, next) => {
  try {
    const data = await svc.getCostByTeam(req.query);
    res.json({ data });
  } catch (err) { next(err); }
});

// ── GET /api/costs/by-project ─────────────────────────────────
router.get('/by-project', async (req, res, next) => {
  try {
    const data = await svc.getCostByProject(req.query);
    res.json({ data });
  } catch (err) { next(err); }
});

// ── GET /api/costs/records ────────────────────────────────────
// Paginated raw records for the data table
// ?page=1  &limit=20  &team=backend  &service=Compute
router.get('/records', async (req, res, next) => {
  try {
    const data = await svc.getRawRecords(req.query);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;