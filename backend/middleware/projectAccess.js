/**
 * Project Middleware
 * Checks if the authenticated user is a member or admin of a project.
 * Attaches the project and the user's role to the request object.
 */

const Project = require('../models/Project');

/**
 * requireProjectMember
 * Ensures the user is at least a member of the project.
 * Reads :projectId from route params.
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Find the user's membership entry
    const membership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a member of this project' });
    }

    // Attach project and role for downstream use
    req.project   = project;
    req.userRole  = membership.role;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * requireProjectAdmin
 * Ensures the user has admin role in the project.
 * Must be used AFTER requireProjectMember.
 */
const requireProjectAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { requireProjectMember, requireProjectAdmin };
