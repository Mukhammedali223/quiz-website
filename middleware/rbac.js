/**
 * RBAC (Role-Based Access Control) Middleware
 * Checks if user has required role(s) to access route
 */

/**
 * Require specific role(s)
 * @param {...string} roles - Allowed roles
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

/**
 * Check if user is admin
 */
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required.'
        });
    }

    next();
};

/**
 * Check if user owns the resource or is admin
 * @param {Function} getOwnerId - Function to extract owner ID from request
 */
export const isOwnerOrAdmin = (getOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required.'
            });
        }

        try {
            const ownerId = await getOwnerId(req);

            if (!ownerId) {
                return res.status(404).json({
                    success: false,
                    error: 'Resource not found.'
                });
            }

            const isOwner = ownerId.toString() === req.user._id.toString();
            const isAdmin = req.user.role === 'admin';

            if (!isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You do not own this resource.'
                });
            }

            req.isAdmin = isAdmin;
            req.isOwner = isOwner;
            next();
        } catch (error) {
            next(error);
        }
    };
};
