const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole }  = require('../middleware/rbac');
const { PrismaClient } = require('@prisma/client');
const bcrypt           = require('bcryptjs');

const prisma = new PrismaClient();

router.use(authenticate);

// ── GET /api/users — Admin only ───────────────────────────────
router.get('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, name: true,
        role: true, isActive: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: users, count: users.length });
  } catch (err) { next(err); }
});

// ── GET /api/users/:id — Admin only ──────────────────────────
router.get('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.params.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// ── PATCH /api/users/:id/role — Admin only ────────────────────
router.patch('/:id/role', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const VALID_ROLES = ['ADMIN', 'VIEWER', 'BILLING_MANAGER'];

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be: ${VALID_ROLES.join(', ')}` });
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user.id && role !== 'ADMIN') {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data:  { role },
      select: { id: true, email: true, name: true, role: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action:       'ROLE_CHANGED',
        entity:       'User',
        entityId:     req.params.id,
        metadata:     { newRole: role, changedBy: req.user.email },
        performedById: req.user.id,
      },
    });

    res.json({ message: `Role updated to ${role}`, user: updated });
  } catch (err) { next(err); }
});

// ── PATCH /api/users/:id/deactivate — Admin only ─────────────
router.patch('/:id/deactivate', requireRole('ADMIN'), async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot deactivate yourself' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data:  { isActive: false },
      select: { id: true, email: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        action:       'USER_DEACTIVATED',
        entity:       'User',
        entityId:     req.params.id,
        metadata:     { deactivatedBy: req.user.email },
        performedById: req.user.id,
      },
    });

    res.json({ message: 'User deactivated', user: updated });
  } catch (err) { next(err); }
});

// ── GET /api/users/audit-logs — Admin only ────────────────────
router.get('/logs/audit', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        performedBy: { select: { name: true, email: true } },
      },
    });
    res.json({ data: logs });
  } catch (err) { next(err); }
});

module.exports = router;