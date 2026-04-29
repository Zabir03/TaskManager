const db = require('../config/db');

exports.createTask = async (req, res) => {
  const { title, description, project_id, assigned_to, due_date, priority } = req.body;
  if (!title || !project_id)
    return res.status(400).json({ message: 'Title and project are required' });

  try {
    const [result] = await db.query(
      `INSERT INTO tasks (title, description, project_id, assigned_to, created_by, due_date, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, project_id, assigned_to || null, req.user.id, due_date || null, priority || 'medium']
    );
    res.status(201).json({ message: 'Task created', taskId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const [tasks] = await db.query(
      `SELECT t.*, u.name as assigned_to_name FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = ? ORDER BY t.created_at DESC`,
      [req.params.projectId]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['todo', 'in_progress', 'done'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: 'Invalid status' });

  try {
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    let userId = req.user.id;
    let isAdmin = req.user.role === 'admin';

    const taskQuery = isAdmin
      ? `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`
      : `SELECT status, COUNT(*) as count FROM tasks WHERE assigned_to = ? GROUP BY status`;

    const overdueQuery = isAdmin
      ? `SELECT t.*, p.name as project_name, u.name as assigned_to_name
         FROM tasks t JOIN projects p ON t.project_id = p.id
         LEFT JOIN users u ON t.assigned_to = u.id
         WHERE t.due_date < CURDATE() AND t.status != 'done'`
      : `SELECT t.*, p.name as project_name FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE t.assigned_to = ? AND t.due_date < CURDATE() AND t.status != 'done'`;

    const [stats] = await db.query(taskQuery, isAdmin ? [] : [userId]);
    const [overdue] = await db.query(overdueQuery, isAdmin ? [] : [userId]);

    const [projectCount] = await db.query(
      isAdmin ? 'SELECT COUNT(*) as count FROM projects'
               : 'SELECT COUNT(*) as count FROM project_members WHERE user_id = ?',
      isAdmin ? [] : [userId]
    );

    res.json({ stats, overdue, projectCount: projectCount[0].count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};