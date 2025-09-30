<script>
// --- ТЕМА (СВЕТЛАЯ/ТЁМНАЯ) ---
function setTheme(theme) {
  if (theme === 'light') document.body.classList.add('light-theme');
  else document.body.classList.remove('light-theme');
  localStorage.setItem('panel-theme', theme);
}
function toggleTheme() {
  let theme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
  setTheme(theme);
}
(function initTheme() {
  const th = localStorage.getItem('panel-theme');
  if (th === 'light') setTheme('light');
})();

// --- ПРОФИЛЬ (ПРОФИЛЬ, ВЫХОД, ПРЕМИУМ) ---
function renderProfile(role='user') {
  let user = (role==='admin') ? users[0] : users[1];
  showModal(`
    <div style="text-align:center">
      <img class="avatar" src="${user.avatar}" alt="avatar" style="margin-bottom:10px;width:70px;height:70px;">
      <div style="font-size:1.19rem;color:#00ffe7;font-weight:600;">${user.name}</div>
      <div style="font-size:1.01rem;color:#0088ff;margin-bottom:6px;">${user.email}</div>
      <button class="neon-btn" onclick="toggleTheme()" style="margin-bottom:10px;">🌗 Переключить тему</button><br>
      <button class="neon-btn" onclick="buyPremium()" style="background:linear-gradient(90deg,#FFD700,#F0E68C);color:#222;">Купить Премиум</button>
      <button class="neon-btn" onclick="logout()" style="background:#ff3265;color:#fff;margin-left:12px;">Выйти</button>
    </div>
  `);
}
function buyPremium() {
  window.open('https://t.me/minorhik', '_blank');
}
function logout() {
  location.reload();
}
document.getElementById('adminProfileBtn').onclick = ()=>renderProfile('admin');
document.getElementById('userProfileBtn').onclick = ()=>renderProfile('user');

// --- ТЕХПОДДЕРЖКА ДЛЯ USER ---
let supportTickets = [
  // {id, user, text, answer, fromAdmin}
];
function renderUserSupport() {
  document.getElementById('userTabContent').innerHTML = `
    <div style="font-size:1.13rem;color:#00ffe7;margin-bottom:10px;">Техническая поддержка</div>
    <form id="supportForm" style="margin-bottom:14px;">
      <label>С чем вы столкнулись?</label><br>
      <textarea class="neon-input" id="supportMsg" style="min-height:50px;width:97%;" placeholder="Опишите проблему..."></textarea>
      <button class="neon-btn" style="margin-top:8px;">Отправить</button>
    </form>
    <div id="supportAnswer"></div>
    <div id="userSupportHistory" style="margin-top:14px;">
      ${supportTickets.filter(t=>t.user==='user').map(t=>`
        <div style="margin-bottom:10px;background:#181d31bb;padding:10px;border-radius:8px;">
          <b>Ваш вопрос:</b> ${t.text}<br>
          <b>Ответ:</b> ${t.answer ? t.answer : '<span style="color:#00ffe7;">Ожидает ответа...</span>'}
        </div>
      `).join("")}
    </div>
  `;
  document.getElementById('supportForm').onsubmit = function(e) {
    e.preventDefault();
    let txt = document.getElementById('supportMsg').value.trim();
    if (!txt) return;
    let autoAnswer = "Спасибо за обращение! Наши специалисты рассмотрят ваш вопрос в ближайшее время. Ознакомьтесь с FAQ для быстрого решения.";
    supportTickets.push({id:Date.now(),user:'user',text:txt,answer:autoAnswer,fromAdmin:false});
    document.getElementById('supportAnswer').innerHTML = `<div style="color:#69fefd;margin-top:9px;">${autoAnswer}</div>`;
    renderUserSupport();
    showToast("Ваше сообщение отправлено!","success");
  };
}

// --- ТЕХПОДДЕРЖКА ДЛЯ ADMIN ---
function renderAdminSupport() {
  document.getElementById('adminTabContent').innerHTML = `
    <div style="font-size:1.13rem;color:#00ffe7;margin-bottom:10px;">Тикеты пользователей (Тех. поддержка)</div>
    <table class="table-list">
      <tr><th>Пользователь</th><th>Вопрос</th><th>Ответ</th><th>Действия</th></tr>
      ${supportTickets.map((t,i)=>`
        <tr>
          <td>${t.user}</td>
          <td>${t.text}</td>
          <td>${t.answer ? t.answer : '<span style="color:#00ffe7;">Ожидает ответа...</span>'}</td>
          <td>${!t.answer || t.fromAdmin ? `<button class="neon-btn" onclick="adminReplySupport(${i})">Ответить</button>` : ''}</td>
        </tr>
      `).join("")}
    </table>
  `;
}
window.adminReplySupport = function(idx) {
  showModal(`
    <div style="text-align:center;">
      <div style="color:#00ffe7;margin-bottom:8px;">Ответить на тикет</div>
      <div style="font-size:1rem;margin-bottom:8px;">${supportTickets[idx].text}</div>
      <textarea class="neon-input" id="adminSupportAns" style="min-height:50px;width:97%;" placeholder="Ваш ответ..."></textarea>
      <button class="neon-btn" style="margin-top:8px;" onclick="saveAdminSupportAns(${idx})">Отправить</button>
    </div>
  `);
};
window.saveAdminSupportAns = function(idx) {
  let ans = document.getElementById('adminSupportAns').value.trim();
  if(ans) {
    supportTickets[idx].answer = ans;
    supportTickets[idx].fromAdmin = true;
    closeModal();
    renderAdminSupport();
    showToast("Ответ отправлен!","success");
  }
};

// --- Вкладки: добавляем “Профиль” и “Техподдержка” ---
// Admin
document.querySelector('#adminTabs').innerHTML += `
  <button class="panel-tab" data-tab="profile">Профиль</button>
  <button class="panel-tab" data-tab="support">Техподдержка</button>
`;
// User
document.querySelector('#userTabs').innerHTML += `
  <button class="panel-tab" data-tab="profile">Профиль</button>
  <button class="panel-tab" data-tab="support">Техподдержка</button>
`;

// --- Routing ---
const prevAdminTabTheme = renderAdminTab;
renderAdminTab = function(tab) {
  document.querySelectorAll('#adminTabs .panel-tab').forEach(t=>t.classList.remove('active'));
  let sel = document.querySelector(`#adminTabs .panel-tab[data-tab="${tab}"]`);
  if(sel) sel.classList.add('active');
  switch(tab) {
    case 'profile': renderProfile('admin'); break;
    case 'support': renderAdminSupport(); break;
    default: prevAdminTabTheme(tab);
  }
};
const prevUserTabTheme = renderUserTab;
renderUserTab = function(tab) {
  document.querySelectorAll('#userTabs .panel-tab').forEach(t=>t.classList.remove('active'));
  let sel = document.querySelector(`#userTabs .panel-tab[data-tab="${tab}"]`);
  if(sel) sel.classList.add('active');
  switch(tab) {
    case 'profile': renderProfile('user'); break;
    case 'support': renderUserSupport(); break;
    default: prevUserTabTheme(tab);
  }
};

// --- Стили для светлой темы ---
const lightThemeCSS = document.createElement('style');
lightThemeCSS.innerHTML = `
body.light-theme {
  background: #f8faff;
  color: #232323;
}
body.light-theme .panel-box,
body.light-theme .tab-content,
body.light-theme .table-list,
body.light-theme .notification-list,
body.light-theme .chat-box {
  background: #fff !important;
  color: #252525 !important;
  box-shadow: 0 0 16px #00ffe780;
}
body.light-theme .neon-title,
body.light-theme .neon-label,
body.light-theme .mini-card,
body.light-theme .notification-item,
body.light-theme .panel-tab,
body.light-theme .neon-btn {
  color: #0088ff !important;
  background: #e8fcff !important;
  text-shadow: none !important;
  box-shadow: none !important;
}
body.light-theme .neon-btn {
  background: linear-gradient(90deg, #00ffe7 0%, #0088ff 100%) !important;
  color: #fff !important;
}
body.light-theme .neon-btn:hover {
  background: linear-gradient(90deg, #0088ff 0%, #00ffe7 100%) !important;
  color: #00ffe7 !important;
}
body.light-theme .avatar { border: 2.5px solid #0088ff; }
body.light-theme .modal { background: #fff; color: #232323; }
body.light-theme .table-list th { background: #e0f7fa !important; color: #0088ff !important; }
`;
document.head.appendChild(lightThemeCSS);
</script>