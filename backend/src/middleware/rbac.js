// Role hierarchy — higher number = more permissions
const ROLE_HIERARCHY = {
  ADMIN:           3,
  BILLING_MANAGER: 2,
  VIEWER:          1,
};

// Require minimum role level
// Usage: requireRole('ADMIN')           → only admins
//        requireRole('BILLING_MANAGER') → billing + admin
//        requireRole('VIEWER')          → everyone
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        error: 'No role attached to token. Please log in again.',
      });
    }

    const userLevel    = ROLE_HIERARCHY[userRole]    ?? 0;
    const neededLevel  = Math.min(
      ...allowedRoles.map(r => ROLE_HIERARCHY[r] ?? 99)
    );

    if (userLevel < neededLevel) {
      return res.status(403).json({
        error:    'Insufficient permissions',
        yourRole: userRole,
        required: allowedRoles,
      });
    }

    next();
  };
};

// Convenience: only the resource's own team can access it
// (Not used today, but available for future use)
const requireSameTeam = (getTeamFn) => {
  return (req, res, next) => {
    if (req.user?.role === 'ADMIN') return next(); // admins bypass
    const resourceTeam = getTeamFn(req);
    if (req.user?.team && req.user.team !== resourceTeam) {
      return res.status(403).json({ error: 'You can only access your own team data' });
    }
    next();
  };
};

module.exports = { requireRole, requireSameTeam };