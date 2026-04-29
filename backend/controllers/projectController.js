const db = require('../config/db');

exports.createProject = async (req, res) => {
  const { name, description, memberIds } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required' });

  try {
    const [result] = await db.query(
      'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      [name, description, req.user.id]
    );
    const projectId = result.insertId;

    // Add creator as member
    await db.query('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
      [projectId, req.user.id]);

    // Add other members
    if (memberIds && memberIds.length > 0) {
      const values = memberIds.map(uid => [projectId, uid]);
      await db.query('INSERT IGNORE INTO project_members (project_id, user_id) VALUES ?', [values]);
    }

    res.status(201).json({ message: 'Project created', projectId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `SELECT p.*, u.name as creator_name FROM projects p
               JOIN users u ON p.created_by = u.id ORDER BY p.created_at DESC`;
      params = [];
    } else {
      query = `SELECT p.*, u.name as creator_name FROM projects p
               JOIN users u ON p.created_by = u.id
               JOIN project_members pm ON p.id = pm.project_id
               WHERE pm.user_id = ? ORDER BY p.created_at DESC`;
      params = [req.user.id];
    }
    const [projects] = await db.query(query, params);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const [projects] = await db.query(
      'SELECT p.*, u.name as creator_name FROM projects p JOIN users u ON p.created_by = u.id WHERE p.id = ?',
      [id]
    );
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found' });

    const [members] = await db.query(
      `SELECT u.id, u.name, u.email, u.role FROM users u
       JOIN project_members pm ON u.id = pm.user_id WHERE pm.project_id = ?`, [id]
    );

    res.json({ ...projects[0], members });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};