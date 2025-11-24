/**
 * Role-based access control helpers
 */

/**
 * Check if user has required role
 */
exports.hasRole = (user, requiredRole) => {
  if (!user) return false;
  return user.role === requiredRole;
};

/**
 * Check if user is admin
 */
exports.isAdmin = (user) => {
  return exports.hasRole(user, 'admin');
};

/**
 * Check if user is authenticated
 */
exports.isAuthenticated = (user) => {
  return !!user;
};

/**
 * Get user role
 */
exports.getUserRole = (user) => {
  return user?.role || 'public';
};

/**
 * Role hierarchy (for future use)
 */
exports.ROLES = {
  PUBLIC: 'public',
  USER: 'user',
  ADMIN: 'admin',
};

/**
 * Check if role has permission
 */
exports.hasPermission = (userRole, requiredRole) => {
  const hierarchy = {
    public: 0,
    user: 1,
    admin: 2,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
};

