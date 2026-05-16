const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole }  = require('../middleware/rbac');
const svc              = require('../services/mockCostService');

router.use(authenticate); // all cost routes need login

// Viewers can read all cost data
router.get('/filter-options', async (req, res, next) => {
  try { res.json(await svc.getFilterOptions()); }
  catch (err) { next(err); }
});

router.get('/summary', async (req, res, next) => {
  try { res.json(await svc.getSummary(req.query)); }
  catch (err) { next(err); }
});

router.get('/daily', async (req, res, next) => {
  try { res.json({ data: await svc.getDailyCosts(req.query), filters: req.query }); }
  catch (err) { next(err); }
});

router.get('/by-service', async (req, res, next) => {
  try { res.json({ data: await svc.getCostByService(req.query) }); }
  catch (err) { next(err); }
});

router.get('/by-team', async (req, res, next) => {
  try { res.json({ data: await svc.getCostByTeam(req.query) }); }
  catch (err) { next(err); }
});

router.get('/by-project', async (req, res, next) => {
  try { res.json({ data: await svc.getCostByProject(req.query) }); }
  catch (err) { next(err); }
});

router.get('/records', async (req, res, next) => {
  try { res.json(await svc.getRawRecords(req.query)); }
  catch (err) { next(err); }
});

// ── Write operations — Billing Manager + Admin only ───────────
// (Export or budget config would go here in future days)
router.post('/export', requireRole('BILLING_MANAGER'), async (req, res) => {
  res.json({ message: 'Export feature — coming Day 15', role: req.user.role });
});

module.exports = router;



