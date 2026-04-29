const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (!token) window.location.href = 'index.html';

document.getElementById('userGreeting').textContent = `👤 ${user.name} (${user.role})`;

async function loadDashboard() {
  const res = await fetch('/api/tasks/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();

  const statsMap = {};
  data.stats.forEach(s => statsMap[s.status] = s.count);

  document.getElementById('totalProjects').textContent = data.projectCount;
  document.getElementById('doneTasks').textContent = statsMap['done'] || 0;
  document.getElementById('inProgressTasks').textContent = statsMap['in_progress'] || 0;
  document.getElementById('overdueTasks').textContent = data.overdue.length;

  const overdueList = document.getElementById('overdueList');
  overdueList.innerHTML = data.overdue.length === 0
    ? '<p style="color:green">✅ No overdue tasks!</p>'
    : data.overdue.map(t => `
        <div class="task-item">
          <div>
            <strong>${t.title}</strong>
            <p style="font-size:0.85rem;color:#666">Project: ${t.project_name} | Due: ${t.due_date?.split('T')[0]}</p>
          </div>
          <span class="badge high">Overdue</span>
        </div>`).join('');
}

loadDashboard();