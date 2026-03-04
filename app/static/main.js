async function loadDiagnosis() {
  const res = await fetch('/api/diagnosis');
  const data = await res.json();
  const tbody = document.getElementById('diagnosis-body');

  tbody.innerHTML = data.stores.map(store => `
    <tr>
      <td>${store.name}</td>
      <td>${store.area}</td>
      <td>¥${store.monthly_sales.toLocaleString()}</td>
      <td>¥${store.monthly_target.toLocaleString()}</td>
      <td>${store.achievement_rate}%</td>
      <td>${(store.growth_rate * 100).toFixed(1)}%</td>
      <td>${store.customer_satisfaction}</td>
      <td class="status-${store.status}">${store.status}</td>
      <td>${store.action}</td>
    </tr>
  `).join('');
}

function appendLog(role, text) {
  const log = document.getElementById('chat-log');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = `${role === 'user' ? 'あなた' : 'AI'}: ${text}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  appendLog('user', message);
  input.value = '';

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  appendLog('bot', data.answer ?? '回答を取得できませんでした。');
}

document.getElementById('chat-send').addEventListener('click', sendChat);
document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChat();
});

appendLog('bot', 'こんにちは。店舗診断データをもとに回答します。');
loadDiagnosis();
