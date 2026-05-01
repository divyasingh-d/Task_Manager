const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, getProject, createProject, updateProject, deleteProject,
  addMember, removeMember, updateMemberRole,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/projectAccess');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All project routes require authentication
router.use(protect);

// ── Project CRUD ──────────────────────────────────────────────────────────────
router.get('/', getProjects);

router.post(
  '/',
  [body('name').notEmpty().withMessage('Project name is required')],
  validate,
  createProject
);

router.get('/:projectId', requireProjectMember, getProject);

router.put(
  '/:projectId',
  requireProjectMember,
  requireProjectAdmin,
  updateProject
);

router.delete(
  '/:projectId',
  requireProjectMember,
  requireProjectAdmin,
  deleteProject
);

// ── Member Management (admin only) ────────────────────────────────────────────
router.post(
  '/:projectId/members',
  requireProjectMember,
  requireProjectAdmin,
  [body('email').isEmail().withMessage('Valid email required')],
  validate,
  addMember
);

router.delete(
  '/:projectId/members/:userId',
  requireProjectMember,
  requireProjectAdmin,
  removeMember
);

router.put(
  '/:projectId/members/:userId/role',
  requireProjectMember,
  requireProjectAdmin,
  [body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member')],
  validate,
  updateMemberRole
);

module.exports = router;
