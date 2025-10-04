const { authenticate, optionalAuth } = require('./authenticate');
const { requireRole, requirePermission, resourceOwner } = require('./authorize');

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  resourceOwner,
};
