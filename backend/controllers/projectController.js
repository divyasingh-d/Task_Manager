/**
 * Project Controller
 * CRUD operations for projects + member management.
 */

const Project = require('../models/Project');
const User    = require('../models/User');
const Task    = require('../models/Task');

// ─── GET /api/projects ────────────────────────────────────────────────────────
// Returns all projects where the logged-in user is a member
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects/:projectId ────────────────────────────────────────────
const getProject = async (req, res) => {
  // req.project is set by requireProjectMember middleware
  await req.project.populate('members.user', 'name email');
  await req.project.populate('createdBy', 'name email');
  res.json({ success: true, data: req.project });
};

// ─── POST /api/projects ───────────────────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      createdBy: req.user._id,
      // Creator is automatically added as admin
      members: [{ user: req.user._id, role: 'admin' }],
    });

    await project.populate('members.user', 'name email');
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/projects/:projectId ────────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const project = req.project;

    if (name)        project.name        = name;
    if (description !== undefined) project.description = description;
    if (color)       project.color       = color;

    await project.save();
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/projects/:projectId ─────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  try {
    // Cascade-delete all tasks in the project
    await Task.deleteMany({ project: req.project._id });
    await req.project.deleteOne();

    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects/:projectId/members ────────────────────────────────────
// Admin adds a member by email
const addMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const project = req.project;
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    project.members.push({ user: userToAdd._id, role });
    await project.save();
    await project.populate('members.user', 'name email');

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/projects/:projectId/members/:userId ─────────────────────────
// Admin removes a member (cannot remove themselves if only admin)
const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project;

    // Prevent removing the only admin
    const admins = project.members.filter((m) => m.role === 'admin');
    if (
      admins.length === 1 &&
      admins[0].user.toString() === userId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the only admin from the project',
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== userId
    );
    await project.save();

    // Unassign tasks that belonged to this removed user
    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { assignedTo: null }
    );

    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/projects/:projectId/members/:userId/role ───────────────────────
const updateMemberRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const project = req.project;

    const member = project.members.find((m) => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    member.role = role;
    await project.save();
    await project.populate('members.user', 'name email');

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
};
