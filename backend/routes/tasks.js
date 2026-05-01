const express = require('express');
const { body } = require('express-validator');
const {
  getProjectTasks, getTask, createTask, updateTask, deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/projectAccess');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

// Get all tasks for a project
router.get('/project/:projectId', requireProjectMember, getProjectTasks);

// Get a single task
router.get('/:taskId', getTask);

// Create a task (admin only)
router.post(
  '/project/:projectId',
  requireProjectMember,
  requireProjectAdmin,
  [body('title').notEmpty().withMessage('Task title is required')],
  validate,
  createTask
);

// Update a task (admin or assignee)
router.put('/:taskId', updateTask);

// Delete a task (admin only)
router.delete('/:taskId', deleteTask);

module.exports = router;
