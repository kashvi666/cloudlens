const router = require('express').Router();
const authService = require('../services/authService');
const { authenticate } = require('../middleware/auth');

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const result = await authService.register({ email, password, name });

    res.status(201).json({
      message: 'Registration successful',
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login({ email, password });

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
// Protected: requires valid JWT
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
// Client-side logout (just clears token on frontend)
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;