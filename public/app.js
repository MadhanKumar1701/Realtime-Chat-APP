const socket = io();

document.getElementById('showLogin').addEventListener('click', () => {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
});

document.getElementById('showRegister').addEventListener('click', () => {
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    startChat();
  } else {
    alert(data.msg);
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (res.ok) {
    alert('Registered successfully! You can now login.');
  } else {
    alert(data.msg);
  }
});

function startChat() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('chatSection').classList.remove('hidden');
  document.getElementById('currentUser').innerText = localStorage.getItem('username');

  const room = 'global-room';
  const username = localStorage.getItem('username');

  socket.emit('joinRoom', { room, username });

  document.getElementById('messageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('messageInput').value.trim();
    if (message) {
      socket.emit('sendMessage', { user: username, text: message, time: new Date().toLocaleTimeString() });
      document.getElementById('messageInput').value = '';
    }
  });

  socket.on('receiveMessage', (data) => {
    const msgEl = document.createElement('div');
    msgEl.innerHTML = `
      <span class="font-bold text-black">${data.user}</span>
      <span class="text-xs text-gray-600">[${data.time}]</span>:
      <span class="text-black">${data.text}</span>
    `;
    msgEl.classList.add(
      'animate__animated', 'animate__fadeInUp',
      'bg-white', 'bg-opacity-80',
      'rounded', 'p-2', 'shadow'
    );
    document.getElementById('chatBox').appendChild(msgEl);
    document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;
  });

  socket.on('updateOnlineUsers', (users) => {
    const list = document.getElementById('onlineUsers');
    list.innerHTML = '';
    users.forEach(u => {
      const li = document.createElement('li');
      li.textContent = u;
      list.appendChild(li);
    });
  });
}

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.reload();
});

window.onload = () => {
  const token = localStorage.getItem('token');
  if (token) {
    startChat();
  }
};
