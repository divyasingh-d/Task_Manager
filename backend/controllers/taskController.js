/**
 * Task Controller
 * Full CRUD for tasks within a project.
 * Admins can manage all tasks; members can only update their assigned tasks.
 */

const Task    = require('../models/Task');
const Project = require('../models/Project');

// ─── GET /api/tasks/project/:projectId ───────────────────────────────────────
const getProjectTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/tasks/:taskId ───────────────────────────────────────────────────
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify the requesting user is a member of the task's project
    const project = await Project.findById(task.project._id);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/tasks/project/:projectId ──────────────────────────────────────
// Only admins can create tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    // Validate that assignedTo is a project member
    if (assignedTo) {
      const isMember = req.project.members.some(
        (m) => m.user.toString() === assignedTo
      );
      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: req.params.projectId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      priority,
      dueDate: dueDate || null,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/tasks/:taskId ───────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Determine the user's role in the project
    const project = await Project.findById(task.project);
    const membership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const isAdmin = membership.role === 'admin';
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Only admins or the assigned user can update this task',
      });
    }

    // Members can only update status; admins can update everything
    if (!isAdmin) {
      // Only allow status updates for members
      task.status = req.body.status ?? task.status;
    } else {
      const { title, description, assignedTo, priority, dueDate, status } = req.body;
      if (title)       task.title       = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo  = assignedTo || null;
      if (priority)    task.priority    = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      if (status)      task.status      = status;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/tasks/:taskId ────────────────────────────────────────────────
// Only admins can delete tasks
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify admin in the task's project
    const project = await Project.findById(task.project);
    const membership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjectTasks, getTask, createTask, updateTask, deleteTask };
