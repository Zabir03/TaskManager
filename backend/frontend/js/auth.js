const API = '/api';

function switchTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0) === (tab === 'login'));
  });
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('authMessage');

  if (!email || !password) {
    msg.textContent = 'Please fill all fields';
    msg.className = 'message error';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      msg.textContent = data.message;
      msg.className = 'message error';
    }
  } catch (err) {
    msg.textContent = 'Network error. Try again.';
    msg.className = 'message error';
  }
}

async function signup() {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const role = document.getElementById('signupRole').value;
  const msg = document.getElementById('authMessage');

  if (!name || !email || !password) {
    msg.textContent = 'Please fill all fields';
    msg.className = 'message error';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    msg.textContent = data.message;
    msg.className = res.ok ? 'message success' : 'message error';
    if (res.ok) setTimeout(() => switchTab('login'), 1500);
  } catch (err) {
    msg.textContent = 'Network error. Try again.';
    msg.className = 'message error';
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

if (localStorage.getItem('token') &&
  (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
  window.location.href = 'dashboard.html';
}