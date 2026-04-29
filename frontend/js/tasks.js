const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (!token) window.location.href = '/index.html';

document.getElementById('userGreeting').textContent = `👤 ${user.name} (${user.role})`;

let allTasks = [];
let selectedTaskId = null;

// ─── Init ─────────────────────────────────────────────────
async function init() {
  await loadProjectDropdowns();

  // Check if came from projects page with ?project=id
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('project');
  if (projectId) {
    document.getElementById('filterProject').value = projectId;
  }

  loadTasks();
}

// ─── Load Projects into Dropdowns ────────────────────────
async function loadProjectDropdowns() {
  const res = await fetch('/api/projects', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const projects = await res.json();

  const filterSelect = document.getElementById('filterProject');
  const taskProjectSelect = document.getElementById('taskProject');

  projects.forEach(p => {
    filterSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    taskProjectSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });
}

// ─── Load Tasks ───────────────────────────────────────────
async function loadTasks() {
  const projectId = document.getElementById('filterProject').value;

  let url = '/api/tasks/project/';
  if (!projectId) {
    // Load tasks from all projects
    const res = await fetch('/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = await res.json();

    allTasks = [];
    for (const p of projects) {
      const tRes = await fetch(`/api/tasks/project/${p.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tasks = await tRes.json();
      allTasks = [...allTasks, ...tasks.map(t => ({ ...t, projectName: p.name }))];
    }
  } else {
    const res = await fetch(`/api/tasks/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    allTasks = await res.json();
  }

  filterTasks();
}

// ─── Filter & Render Tasks ────────────────────────────────
function filterTasks() {
  const statusFilter = document.getElementById('filterStatus').value;
  const priorityFilter = document.getElementById('filterPriority').value;

  let filtered = allTasks;
  if (statusFilter) filtered = filtered.filter(t => t.status === statusFilter);
  if (priorityFilter) filtered = filtered.filter(t => t.priority === priorityFilter);

  renderKanban(filtered);
}

// ─── Render Kanban Board ──────────────────────────────────
function renderKanban(tasks) {
  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const done = tasks.filter(t => t.status === 'done');

  document.getElementById('todoCount').textContent = todo.length;
  document.getElementById('inProgressCount').textContent = inProgress.length;
  document.getElementById('doneCount').textContent = done.length;

  document.getElementById('todoList').innerHTML = renderTaskCards(todo);
  document.getElementById('inProgressList').innerHTML = renderTaskCards(inProgress);
  document.getElementById('doneList').innerHTML = renderTaskCards(done);
}

function renderTaskCards(tasks) {
  if (tasks.length === 0) {
    return `<p style="color:#999; font-size:0.9rem; text-align:center; padding:1rem">No tasks</p>`;
  }

  return tasks.map(t => `
    <div class="card" style="margin-bottom:0.8rem; padding:1rem">
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem">
        <strong style="font-size:0.95rem">${t.title}</strong>
        <span class="badge ${t.priority}">${t.priority}</span>
      </div>

      ${t.description ? `<p style="font-size:0.85rem; color:#666; margin-bottom:0.5rem">${t.description}</p>` : ''}

      <div style="font-size:0.8rem; color:#999; margin-bottom:0.8rem">
        <span>👤 ${t.assigned_to_name || 'Unassigned'}</span>
        ${t.due_date ? `<span style="margin-left:0.5rem">📅 ${t.due_date.split('T')[0]}</span>` : ''}
        ${t.projectName ? `<span style="margin-left:0.5rem">📁 ${t.projectName}</span>` : ''}
      </div>

      <div style="display:flex; gap:0.5rem; flex-wrap:wrap">
        <button onclick="openStatusModal(${t.id}, '${t.title}', '${t.status}')"
          style="width:auto; padding:0.3rem 0.8rem; font-size:0.8rem; background:#e0e7ff; color:#3730a3; border:none; border-radius:6px; cursor:pointer">
          🔄 Status
        </button>
        ${user.role === 'admin' ? `
          <button onclick="deleteTask(${t.id})"
            style="width:auto; padding:0.3rem 0.8rem; font-size:0.8rem; background:#fee2e2; color:#dc2626; border:none; border-radius:6px; cursor:pointer">
            🗑 Delete
          </button>` : ''}
      </div>
    </div>
  `).join('');
}

// ─── Load Project Members for Assignee Dropdown ───────────
async function loadProjectMembers() {
  const projectId = document.getElementById('taskProject').value;
  const assigneeSelect = document.getElementById('taskAssignee');
  assigneeSelect.innerHTML = '<option value="">Unassigned</option>';

  if (!projectId) return;

  const res = await fetch(`/api/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const project = await res.json();

  project.members.forEach(m => {
    assigneeSelect.innerHTML += `<option value="${m.id}">${m.name} (${m.role})</option>`;
  });
}

// ─── Create Task ──────────────────────────────────────────
async function createTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDesc').value.trim();
  const project_id = document.getElementById('taskProject').value;
  const assigned_to = document.getElementById('taskAssignee').value;
  const priority = document.getElementById('taskPriority').value;
  const due_date = document.getElementById('taskDueDate').value;
  const msg = document.getElementById('createTaskMsg');

  if (!title || !project_id) {
    msg.textContent = 'Title and Project are required!';
    msg.className = 'message error';
    return;
  }

  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, project_id, assigned_to, priority, due_date })
  });

  const data = await res.json();
  if (res.ok) {
    msg.textContent = '✅ Task created successfully!';
    msg.className = 'message success';
    setTimeout(() => {
      closeCreateModal();
      loadTasks();
    }, 1000);
  } else {
    msg.textContent = data.message;
    msg.className = 'message error';
  }
}

// ─── Update Task Status ───────────────────────────────────
function openStatusModal(id, title, currentStatus) {
  selectedTaskId = id;
  document.getElementById('statusTaskTitle').textContent = title;
  document.getElementById('newStatus').value = currentStatus;
  document.getElementById('updateStatusModal').classList.add('active');
}

async function updateStatus() {
  const status = document.getElementById('newStatus').value;

  const res = await fetch(`/api/tasks/${selectedTaskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (res.ok) {
    closeStatusModal();
    loadTasks();
  }
}

// ─── Delete Task ──────────────────────────────────────────
async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;

  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) loadTasks();
}

// ─── Modal Controls ───────────────────────────────────────
function openCreateModal() {
  document.getElementById('createTaskModal').classList.add('active');
}

function closeCreateModal() {
  document.getElementById('createTaskModal').classList.remove('active');
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskProject').value = '';
  document.getElementById('taskAssignee').innerHTML = '<option value="">Unassigned</option>';
  document.getElementById('taskDueDate').value = '';
  document.getElementById('createTaskMsg').textContent = '';
}

function closeStatusModal() {
  document.getElementById('updateStatusModal').classList.remove('active');
  selectedTaskId = null;
}

function logout() {
  localStorage.clear();
  window.location.href = '/index.html';
}

// ─── Start ────────────────────────────────────────────────
init();