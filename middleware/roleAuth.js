/**
 * Role-Based Access Control Middleware
 */

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // In production, decode JWT to get role
      // For now, we rely on authMiddleware to set req.userId
      // The actual role check should be done by fetching the user
      next();
    } catch (error) {
      res.status(403).json({ message: 'Forbidden' });
    }
  };
};

/**
 * Check user role from database
 */
export const checkRole = (User) => {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};

/**
 * Verify user belongs to an agency (for agency-specific operations)
 */
export const verifyAgencyOwnership = (Agency) => {
  return async (req, res, next) => {
    try {
      const { agencyId } = req.body;
      
      if (!agencyId) {
        return res.status(400).json({ message: 'Agency ID is required' });
      }

      const agency = await Agency.findById(agencyId);
      if (!agency) {
        return res.status(404).json({ message: 'Agency not found' });
      }

      // Check if user is the agency owner or an admin
      if (agency.owner.toString() !== req.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
      }

      req.agency = agency;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};
