const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole }  = require('../middleware/rbac');
const svc              = require('../services/resourceService');

router.use(authenticate);

// ── GET /api/resources/filter-options ────────────────────────
router.get('/filter-options', async (req, res, next) => {
  try {
    res.json(await svc.getResourceFilterOptions());
  } catch (err) { next(err); }
});

// ── GET /api/resources/summary ────────────────────────────────
router.get('/summary', async (req, res, next) => {
  try {
    res.json(await svc.getResourceSummary());
  } catch (err) { next(err); }
});

// ── GET /api/resources/heatmap ────────────────────────────────
// ?team=backend  &project=cloudlens-prod
router.get('/heatmap', async (req, res, next) => {
  try {
    res.json(await svc.getHeatmapData(req.query));
  } catch (err) { next(err); }
});

// ── GET /api/resources ────────────────────────────────────────
// ?team=backend  &type=Virtual Machine  &status=IDLE
router.get('/', async (req, res, next) => {
  try {
    const resources = await svc.getResources(req.query);
    res.json({ data: resources, count: resources.length });
  } catch (err) { next(err); }
});

// ── GET /api/resources/:id ────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    res.json(await svc.getResourceById(req.params.id));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// ── POST /api/resources/:id/scale-down ───────────────────────
// Admin + Billing Manager only
router.post(
  '/:id/scale-down',
  requireRole('BILLING_MANAGER'),
  async (req, res, next) => {
    try {
      res.json(await svc.scaleDownResource(req.params.id));
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
);

module.exports = router;