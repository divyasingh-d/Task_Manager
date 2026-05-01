/**
 * Dashboard Controller
 * Aggregates statistics for the logged-in user across all their projects.
 */

const Task    = require('../models/Task');
const Project = require('../models/Project');

// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all projects the user belongs to
    const projects = await Project.find({ 'members.user': userId }).select('_id name color');
    const projectIds = projects.map((p) => p._id);

    // Base query: tasks in the user's projects
    const baseTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('project', 'name color');

    const now = new Date();

    // ── Aggregate counts ──────────────────────────────────────────────────────

    const totalTasks = baseTasks.length;

    const tasksByStatus = {
      todo:       baseTasks.filter((t) => t.status === 'todo').length,
      inprogress: baseTasks.filter((t) => t.status === 'inprogress').length,
      done:       baseTasks.filter((t) => t.status === 'done').length,
    };

    // Overdue = past due date AND not done
    const overdueTasks = baseTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    );

    // Tasks per user: group by assignedTo
    const tasksPerUserMap = {};
    baseTasks.forEach((t) => {
      if (t.assignedTo) {
        const key = t.assignedTo._id.toString();
        if (!tasksPerUserMap[key]) {
          tasksPerUserMap[key] = { user: t.assignedTo, count: 0 };
        }
        tasksPerUserMap[key].count += 1;
      }
    });
    const tasksPerUser = Object.values(tasksPerUserMap)
      .sort((a, b) => b.count - a.count);

    // Recent tasks (last 5 updated)
    const recentTasks = [...baseTasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    // Tasks by project
    const tasksByProject = projects.map((p) => ({
      project: { _id: p._id, name: p.name, color: p.color },
      count: baseTasks.filter((t) => t.project._id.toString() === p._id.toString()).length,
    }));

    res.json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalTasks,
        tasksByStatus,
        overdueTasks: overdueTasks.slice(0, 5), // Return top 5 overdue
        overdueCount: overdueTasks.length,
        tasksPerUser,
        recentTasks,
        tasksByProject,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
