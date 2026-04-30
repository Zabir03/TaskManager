const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (!token) window.location.href = 'index.html';

document.getElementById('userGreeting').textContent = `👤 ${user.name} (${user.role})`;

async function loadDashboard() {
  try {
    const res = await fetch('/api/tasks/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    const statsMap = {};
    data.stats.forEach(s => statsMap[s.status] = parseInt(s.count));

    document.getElementById('totalProjects').textContent = data.projectCount;
    document.getElementById('doneTasks').textContent = statsMap['done'] || 0;
    document.getElementById('inProgressTasks').textContent = statsMap['in_progress'] || 0;
    document.getElementById('overdueTasks').textContent = data.overdue.length;

    const overdueList = document.getElementById('overdueList');
    overdueList.innerHTML = data.overdue.length === 0
      ? '<p style="color:green; padding:1rem; background:white; border-radius:8px">✅ No overdue tasks!</p>'
      : data.overdue.map(t => `
          <div class="task-item" style="background:white; border-radius:8px; padding:1rem;
            margin-bottom:0.8rem; display:flex; justify-content:space-between;
            align-items:center; border-left:4px solid #ef4444;">
            <div>
              <strong>${t.title}</strong>
              <p style="font-size:0.85rem; color:#666">
                📁 ${t.project_name} | 📅 ${t.due_date?.split('T')[0]}
              </p>
            </div>
            <span class="badge high">Overdue</span>
          </div>`).join('');
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

loadDashboard();