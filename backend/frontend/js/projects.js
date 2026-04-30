const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (!token) window.location.href = 'index.html';

document.getElementById('userGreeting').textContent = `👤 ${user.name} (${user.role})`;
if (user.role !== 'admin') {
  document.getElementById('newProjectBtn').style.display = 'none';
}

let allUsers = [];

async function loadProjects() {
  try {
    const res = await fetch('/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = await res.json();
    const grid = document.getElementById('projectsGrid');

    if (!Array.isArray(projects) || projects.length === 0) {
      grid.innerHTML = `<p style="color:#999">No projects found. ${user.role === 'admin' ? 'Create one!' : 'Ask your admin.'}</p>`;
      return;
    }

    grid.innerHTML = projects.map(p => `
      <div class="card" style="cursor:pointer" onclick="openDetailModal(${p.id})">
        <div style="display:flex; justify-content:space-between; align-items:start">
          <h3 style="margin-bottom:0.4rem">📁 ${p.name}</h3>
          ${user.role === 'admin' ? `
            <button onclick="deleteProject(event, ${p.id})"
              style="width:auto; padding:0.3rem 0.7rem; background:#fee2e2;
              color:#dc2626; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem">
              🗑 Delete
            </button>` : ''}
        </div>
        <p style="color:#666; font-size:0.9rem; margin-bottom:0.8rem">
          ${p.description || 'No description'}
        </p>
        <p style="font-size:0.8rem; color:#999">
          👤 Created by: ${p.creator_name}<br/>
          📅 ${new Date(p.created_at).toLocaleDateString()}
        </p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading projects:', err);
  }
}

async function loadUsers() {
  try {
    const res = await fetch('/api/projects/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    allUsers = await res.json();
    const membersList = document.getElementById('membersList');
    const otherUsers = allUsers.filter(u => u.id !== user.id);

    membersList.innerHTML = otherUsers.length === 0
      ? '<p style="color:#999">No other users found.</p>'
      : otherUsers.map(u => `
          <label style="display:flex; align-items:center; gap:0.5rem; padding:0.4rem; cursor:pointer; border-radius:6px">
            <input type="checkbox" value="${u.id}" />
            ${u.name} <span style="color:#999; font-size:0.8rem">(${u.role})</span>
          </label>`).join('');
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

function openModal() {
  document.getElementById('projectModal').classList.add('active');
  loadUsers();
}

function closeModal() {
  document.getElementById('projectModal').classList.remove('active');
  document.getElementById('projectName').value = '';
  document.getElementById('projectDesc').value = '';
  document.getElementById('modalMessage').textContent = '';
}

async function createProject() {
  const name = document.getElementById('projectName').value.trim();
  const description = document.getElementById('projectDesc').value.trim();
  const msg = document.getElementById('modalMessage');

  if (!name) {
    msg.textContent = '⚠️ Project name is required!';
    msg.className = 'message error';
    return;
  }

  const memberIds = Array.from(
    document.querySelectorAll('#membersList input:checked')
  ).map(cb => parseInt(cb.value));

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, memberIds })
    });
    const data = await res.json();
    if (res.ok) {
      msg.textContent = '✅ Project created!';
      msg.className = 'message success';
      setTimeout(() => { closeModal(); loadProjects(); }, 1000);
    } else {
      msg.textContent = data.message;
      msg.className = 'message error';
    }
  } catch (err) {
    msg.textContent = 'Network error.';
    msg.className = 'message error';
  }
}

async function deleteProject(event, id) {
  event.stopPropagation();
  if (!confirm('Delete this project? All tasks will be deleted too.')) return;
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) loadProjects();
}

async function openDetailModal(id) {
  try {
    const res = await fetch(`/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const project = await res.json();

    document.getElementById('detailProjectName').textContent = `📁 ${project.name}`;
    document.getElementById('detailProjectDesc').textContent = project.description || 'No description.';
    document.getElementById('detailMembers').innerHTML = project.members.map(m => `
      <span style="display:inline-block; background:#e0e7ff; color:#3730a3;
        padding:0.3rem 0.8rem; border-radius:20px; font-size:0.85rem; margin:0.2rem">
        👤 ${m.name} (${m.role})
      </span>`).join('');

    const taskRes = await fetch(`/api/tasks/project/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const tasks = await taskRes.json();
    document.getElementById('detailTasks').innerHTML = tasks.length === 0
      ? '<p style="color:#999">No tasks yet.</p>'
      : tasks.map(t => `
          <div style="display:flex; justify-content:space-between; align-items:center;
            padding:0.6rem; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:0.5rem">
            <div>
              <strong>${t.title}</strong>
              <p style="font-size:0.8rem; color:#666">
                👤 ${t.assigned_to_name || 'Unassigned'}
                ${t.due_date ? `| 📅 ${t.due_date.split('T')[0]}` : ''}
              </p>
            </div>
            <span class="badge ${t.status}">${t.status.replace('_', ' ')}</span>
          </div>`).join('');

    document.getElementById('goToTasksBtn').href = `tasks.html?project=${id}`;
    document.getElementById('detailModal').classList.add('active');
  } catch (err) {
    console.error('Error:', err);
  }
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('active');
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

loadProjects();