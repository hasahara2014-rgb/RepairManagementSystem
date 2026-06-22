/* ============================================================
   RMS Enterprise v3.0 — sidebar.js
   ✅ renderPageShell() สร้าง sidebar + topbar + page content
   ✅ Sidebar structure ตรงกับ style.css (v3 design)
   ✅ ใช้ Auth จาก app.js
   ✅ Mark active page อัตโนมัติ
   ✅ Mobile toggle support
   ============================================================ */
'use strict';

/* ── NAV STRUCTURE ───────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: 'เมนูหลัก',
    items: [
      { href:'dashboard.html', icon:'fa-tachometer-alt', label:'Dashboard' },
      { href:'executive.html', icon:'fa-chart-line',     label:'Executive' },
    ]
  },
  {
    label: 'งานซ่อม',
    items: [
      { href:'jobs.html',      icon:'fa-briefcase',      label:'รายการงานซ่อม' },
      { href:'jobs.html?action=new', icon:'fa-plus-circle', label:'สร้างงานใหม่' },
      { href:'approvals.html', icon:'fa-stamp',          label:'อนุมัติงาน',   managerOnly: true },
    ]
  },
  {
    label: 'คลัง',
    items: [
      { href:'parts.html',     icon:'fa-cogs',           label:'คลังอะไหล่' },
      { href:'store.html',     icon:'fa-warehouse',      label:'Store' },
      { href:'pm.html',        icon:'fa-calendar-check', label:'Preventive PM' },
    ]
  },
  {
    label: 'บริหาร',
    items: [
      { href:'vendors.html',   icon:'fa-handshake',      label:'Vendor',       adminOnly: true },
      { href:'reports.html',   icon:'fa-chart-bar',      label:'รายงาน' },
      { href:'analytics.html', icon:'fa-brain',          label:'AI Analytics' },
    ]
  },
  {
    label: 'ระบบ',
    adminOnly: true,
    items: [
      { href:'users.html',     icon:'fa-users',          label:'ผู้ใช้งาน',    adminOnly: true },
      { href:'master.html',    icon:'fa-database',       label:'Master Data',  adminOnly: true },
      { href:'settings.html',  icon:'fa-cog',            label:'ตั้งค่า',       adminOnly: true },
    ]
  },
];

/* ── BUILD SIDEBAR HTML ─────────────────────────────────── */
function _buildSidebar() {
  const cur     = location.pathname.split('/').pop() || 'dashboard.html';
  const u       = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
  const isAdmin = u && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
  const isMgr   = u && ['ADMIN','SUPER_ADMIN','MANAGER'].includes(u.role);
  const initials = u ? (u.name || u.username || 'U').substring(0,2).toUpperCase() : 'U';

  let sectionsHTML = '';
  NAV_SECTIONS.forEach(function(sec) {
    if (sec.adminOnly && !isAdmin) return;
    sectionsHTML += '<div class="sidebar-section">' + sec.label + '</div>';
    sec.items.forEach(function(item) {
      if (item.adminOnly && !isAdmin) return;
      if (item.managerOnly && !isMgr) return;
      const href    = item.href;
      const active  = (cur === href || (cur === 'jobs.html' && href === 'jobs.html')) ? 'active' : '';
      sectionsHTML +=
        '<div class="nav-item-rms">' +
          '<a class="nav-link-rms ' + active + '" href="' + href + '">' +
            '<span class="nav-icon"><i class="fas ' + item.icon + '"></i></span>' +
            item.label +
          '</a>' +
        '</div>';
    });
  });

  return (
    '<div id="sidebarOverlay" class="sidebar-overlay"></div>' +
    '<nav class="sidebar" id="rmsSidebar">' +
      '<div class="sidebar-brand">' +
        '<div class="brand-icon"><i class="fas fa-tools"></i></div>' +
        '<div>' +
          '<div class="brand-name">RMS Enterprise</div>' +
          '<div class="brand-ver">v3.0 · CMMS</div>' +
        '</div>' +
      '</div>' +
      sectionsHTML +
      '<div class="sidebar-footer">' +
        '<div class="user-card" id="rmsUserCard">' +
          '<div class="user-avatar">' + initials + '</div>' +
          '<div>' +
            '<div class="user-name">' + (u ? (u.name || u.username || 'User') : 'User') + '</div>' +
            '<div class="user-role">' + (u ? (u.role || 'USER') : 'USER') + '</div>' +
          '</div>' +
        '</div>' +
        '<button id="rmsLogoutBtn" style="width:100%;margin-top:8px;padding:8px;background:rgba(220,38,38,.1);color:#dc2626;border:none;border-radius:8px;font-weight:600;font-size:.8rem;cursor:pointer;font-family:inherit;transition:background .15s" onmouseover="this.style.background=\'rgba(220,38,38,.18)\'" onmouseout="this.style.background=\'rgba(220,38,38,.1)\'">' +
          '<i class="fas fa-sign-out-alt" style="margin-right:7px"></i>ออกจากระบบ' +
        '</button>' +
      '</div>' +
    '</nav>'
  );
}

/* ── BUILD TOPBAR HTML ─────────────────────────────────── */
function _buildTopbar(title, actions) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
  return (
    '<div class="topbar" id="rmsTopbar">' +
      '<button class="topbar-toggle" id="rmsSidebarToggle"><i class="fas fa-bars"></i></button>' +
      '<div class="page-title">' + title + '</div>' +
      '<div class="topbar-date d-none d-md-block" style="font-size:.75rem;color:#94a3b8;flex-shrink:0">' + dateStr + '</div>' +
      (actions ? '<div class="topbar-actions">' + actions + '</div>' : '') +
      '<div class="topbar-actions">' +
        '<button class="topbar-btn" onclick="window.location.reload()" title="รีเฟรช"><i class="fas fa-sync-alt"></i></button>' +
      '</div>' +
    '</div>'
  );
}

/* ── MAIN: renderPageShell ─────────────────────────────── */
function renderPageShell(title, content, actions) {
  const wrapper = document.getElementById('app');
  if (!wrapper) { console.error('renderPageShell: #app not found'); return; }

  wrapper.innerHTML =
    _buildSidebar() +
    '<div class="main-content" id="rmsMain">' +
      _buildTopbar(title, actions || '') +
      '<div class="page-body">' + (content || '') + '</div>' +
    '</div>';

  // Toast container
  if (!document.getElementById('_rmsTC')) {
    const tc = document.createElement('div');
    tc.id = '_rmsTC';
    tc.style.cssText = 'position:fixed;bottom:22px;right:22px;z-index:99999;display:flex;flex-direction:column;gap:7px;pointer-events:none;';
    document.body.appendChild(tc);
  }

  // Mobile sidebar toggle
  const sidebar  = document.getElementById('rmsSidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const toggle   = document.getElementById('rmsSidebarToggle');

  function openSidebar()  { sidebar && sidebar.classList.add('open');    overlay && overlay.classList.add('show'); }
  function closeSidebar() { sidebar && sidebar.classList.remove('open'); overlay && overlay.classList.remove('show'); }

  if (toggle)  toggle.addEventListener('click', function() { sidebar && sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Logout
  const logoutBtn = document.getElementById('rmsLogoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', function() {
    if (typeof Auth !== 'undefined') Auth.logout();
    else window.location.href = 'login.html';
  });
}
