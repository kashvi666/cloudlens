const ROLE_HIERARCHY = {
  ADMIN: 3,
  BILLING_MANAGER: 2,
  VIEWER: 1,
};

// Usage: router.get('/admin', authenticate, requireRole('ADMIN'), handler)
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ error: 'No role found on token' });
    }

    const hasPermission = allowedRoles.some(
      (role) => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[role]
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: `Access denied. Required: ${allowedRoles.join(' or ')}. Your role: ${userRole}`,
      });
    }

    next();
  };
};

module.exports = { requireRole };