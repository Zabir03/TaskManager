async function login() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('authMessage');

  if (!email || !password) {
    msg.textContent = 'Please fill all fields';
    msg.className = 'message error';
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log('Login response:', data);

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