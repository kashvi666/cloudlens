const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const mockCostService = require('../services/mockCostService');

// All cost routes require authentication
router.use(authenticate);

// GET /api/costs/daily?days=30&team=backend&service=Compute
router.get('/daily', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const filters = {
      team: req.query.team,
      service: req.query.service,
      project: req.query.project,
      provider: req.query.provider,
    };
    const data = await mockCostService.getDailyCosts(days, filters);
    res.json({ data, filters, days });
  } catch (err) { next(err); }
});

// GET /api/costs/by-service?days=30
router.get('/by-service', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await mockCostService.getCostByService(days, { team: req.query.team });
    res.json({ data, days });
  } catch (err) { next(err); }
});

// GET /api/costs/by-team?days=30
router.get('/by-team', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await mockCostService.getCostByTeam(days);
    res.json({ data, days });
  } catch (err) { next(err); }
});

// GET /api/costs/summary?days=30
router.get('/summary', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await mockCostService.getSummary(days);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;