// Server-side RBAC. Frontend route-hiding is cosmetic only — every private
// operation is re-checked here, because that's the only check that matters.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action' });
    }
    next();
  };
}

module.exports = { requireRole };
