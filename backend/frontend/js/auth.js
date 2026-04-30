const API = '/api';

function switchTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0) === (tab === 'login'));
  });
  document.getElementById('authMessage').textContent = '';
}

async function login() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('authMessage');

  if (!email || !password) {
    msg.textContent = '⚠️ Please fill all fields';
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
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  const role = document.getElementById('signupRole').value;
  const msg = document.getElementById('authMessage');

  // Validation
  if (!name) {
    msg.textContent = '⚠️ Full name is required';
    msg.className = 'message error';
    return;
  }
  if (!email) {
    msg.textContent = '⚠️ Email is required';
    msg.className = 'message error';
    return;
  }
  if (!password || password.length < 6) {
    msg.textContent = '⚠️ Password must be at least 6 characters';
    msg.className = 'message error';
    return;
  }

  // Show loading state
  msg.textContent = 'Creating account...';
  msg.className = 'message';

  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    console.log('Signup response:', data);

    if (res.ok) {
      msg.textContent = '✅ Account created! Switching to login...';
      msg.className = 'message success';

      // Clear signup form
      document.getElementById('signupName').value = '';
      document.getElementById('signupEmail').value = '';
      document.getElementById('signupPassword').value = '';

      // Switch to login after 1.5 seconds
      setTimeout(() => switchTab('login'), 1500);
    } else {
      msg.textContent = data.message || 'Signup failed';
      msg.className = 'message error';
    }
  } catch (err) {
    console.error('Signup error:', err);
    msg.textContent = 'Network error. Try again.';
    msg.className = 'message error';
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Redirect if already logged in
if (localStorage.getItem('token') &&
  (window.location.pathname.endsWith('index.html') ||
   window.location.pathname === '/' ||
   window.location.pathname === '')) {
  window.location.href = 'dashboard.html';
}