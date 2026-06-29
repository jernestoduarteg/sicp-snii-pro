SICP.app = (function() {
  var _db = SICP.db;
  var _currentSection = 'dashboard';
  var _navHistory = [];
  var _darkMode = false;

  function init() {
    _darkMode = localStorage.getItem('snii_dark') === 'true';
    if (_darkMode) document.body.classList.add('dark');
    SICP.auth.initAuth();
    SICP.keyboard.initKeyboardShortcuts(app);
    registerSW();
    renderLayout();
    renderSidebar();
    renderAuthUI();
    SICP.auth.onAuthChange(function(event, user) {
      renderAuthUI();
      if (event === 'ready') refresh();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') SICP.modal.closeModal();
    });
    setTimeout(verificarNotificaciones, 1500);
    var initial = window.location.hash.slice(1).split('?')[0] || 'dashboard';
    navegar(initial);
  }

  function renderLayout() {
    var header = document.getElementById('app-header');
    if (header) {
      header.innerHTML = '<div class="header-inner"><div class="header-left"><span class="logo">SICP-SNII <sup>Pro</sup></span><span class="logo-sub">SNII 2026 · SECIHTI</span></div>' +
        '<div class="header-right"><span class="badge" id="header-avance">Avance: 0%</span><span class="badge" id="header-metas">Metas: 0</span><span class="badge warn" id="header-riesgos">Riesgos: 0</span>' +
        '<span class="badge" id="sync-status" style="display:none">☁️</span>' +
        '<button class="btn-icon" onclick="SICP.app.toggleDarkMode()" title="Modo oscuro">🌓</button>' +
        '<button class="btn-icon" onclick="SICP.app.exportarDatos()" title="Exportar">⬇</button>' +
        '<button class="btn-icon" onclick="document.getElementById(\'importFile\').click()" title="Importar">⬆</button>' +
        '<input type="file" id="importFile" accept=".json" style="display:none" onchange="SICP.app.importarDatos(event)">' +
        '<button class="btn-icon" onclick="SICP.app.exportarPDF()" title="PDF">📕</button>' +
        '<button class="btn-icon" onclick="SICP.app.guardarReporte()" title="Reporte">📋</button>' +
        '<button class="btn-icon" id="sync-btn" onclick="SICP.app.mostrarAuthUI()" title="Iniciar sesión">🔑</button>' +
        '<div id="auth-ui" style="display:none"></div></div></div>';
    }
  }

  function renderSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    var sections = [
      { id: 'dashboard', icon: '📊', label: 'Dashboard' },
      { id: 'metas', icon: '🎯', label: 'Metas' },
      { id: 'productos', icon: '📄', label: 'Productos' },
      { id: 'evidencias', icon: '🔍', label: 'Evidencias' },
      { id: 'snii', icon: '🏆', label: 'Simulador SNII' },
      { id: 'plan', icon: '📅', label: 'Plan de Carrera' },
      { id: 'biblioteca', icon: '📚', label: 'Biblioteca 2026' },
      { id: 'ia', icon: '🤖', label: 'IA + Prompts' },
      { id: 'config', icon: '⚙️', label: 'Configuración' }
    ];
    sidebar.innerHTML = sections.map(function(s) {
      return '<button class="nav-btn' + (s.id === 'dashboard' ? ' active' : '') + '" data-section="' + s.id + '" onclick="SICP.app.navegar(\'' + s.id + '\')">' +
        '<span class="nav-icon">' + s.icon + '</span><span class="nav-label">' + s.label + '</span><span class="nav-badge" id="badge-' + s.id + '">0</span></button>';
    }).join('') + '<div style="flex:1"></div>' +
      '<button class="nav-btn" onclick="SICP.keyboard.showHelp ? SICP.keyboard.showHelp() : SICP.modal.showModal(\'Ayuda\',\'<p>Presiona ? para ver atajos</p>\')" title="Atajos de teclado">' +
      '<span class="nav-icon">⌨️</span><span class="nav-label">Atajos</span></button>';
  }

  function renderAuthUI() {
    var container = document.getElementById('auth-ui');
    if (!container) return;
    container.innerHTML = '<button class="btn-icon" onclick="SICP.AuthModule.show(SICP.app)" title="Cuenta">🔑</button>';
  }

  function refresh() {
    actualizarBadges();
    renderSection(_currentSection);
  }

  function navegar(section) {
    if (section !== _currentSection) _navHistory.push(_currentSection);
    _currentSection = section;
    renderSection(section);
    document.querySelectorAll('.nav-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.section === section);
    });
    var hash = '#' + section;
    if (window.location.hash !== hash) history.pushState(null, '', hash);
    actualizarBadges();
  }

  function navegarAtras() {
    if (_navHistory.length > 0) {
      var prev = _navHistory.pop();
      _currentSection = prev;
      renderSection(prev);
      document.querySelectorAll('.nav-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.section === prev);
      });
      var hash = '#' + prev;
      if (window.location.hash !== hash) history.pushState(null, '', hash);
      actualizarBadges();
    }
  }

  function renderSection(section) {
    document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
    var container = document.getElementById('section-' + section);
    if (!container) return;
    container.classList.add('active');
    var stats = _db.calcularStats();
    var html = '';
    switch (section) {
      case 'dashboard': html = SICP.DashboardModule.render(stats, _db); break;
      case 'metas': html = SICP.MetasModule.render(_db); break;
      case 'productos': html = SICP.ProductosModule.render(_db); break;
      case 'evidencias': html = SICP.EvidenciasModule.render(_db); break;
      case 'snii': html = SICP.SNIIModule.render(stats, _db); break;
      case 'plan': html = SICP.PlanModule.render(_db); break;
      case 'biblioteca': html = SICP.BibliotecaModule.render(); break;
      case 'ia': html = SICP.IAModule.render(); break;
      case 'config': html = renderConfig(); break;
    }
    var navHtml = '<div class="flex gap-8 mb-12" style="padding:4px 0">' +
      (_navHistory.length > 0 ? '<button class="btn btn-sm" onclick="SICP.app.navegarAtras()">← Atrás</button>' : '') +
      (section !== 'dashboard' ? '<button class="btn btn-sm" onclick="SICP.app.navegar(\'dashboard\')">🏠 Inicio</button>' : '') +
      '</div>';
    container.innerHTML = navHtml + html;
  }

  function actualizarBadges() {
    var stats = _db.calcularStats();
    var setBadge = function(id, val) { var el = document.getElementById('badge-' + id); if (el) el.textContent = val; };
    setBadge('dashboard', stats.avanceGeneral + '%');
    setBadge('metas', stats.totalMetas);
    setBadge('productos', stats.totalProductos);
    setBadge('evidencias', stats.totalEvidencias);
    setBadge('snii', stats.scoreSNII + '%');
    setBadge('plan', stats.totalMetas);
    setBadge('biblioteca', '2026');
    setBadge('ia', 'Prompts');
    setBadge('config', '');
    var headerAvance = document.getElementById('header-avance');
    var headerMetas = document.getElementById('header-metas');
    var headerRiesgos = document.getElementById('header-riesgos');
    if (headerAvance) headerAvance.textContent = 'Avance: ' + stats.avanceGeneral + '%';
    if (headerMetas) headerMetas.textContent = 'Metas: ' + stats.totalMetas;
    if (headerRiesgos) {
      var vencidas = stats.metasVencidas;
      headerRiesgos.textContent = 'Riesgos: ' + vencidas;
      headerRiesgos.className = 'badge' + (vencidas > 0 ? ' warn' : '');
    }
  }

  function verificarNotificaciones() {
    var metas = _db.getMetas();
    if (!metas || !metas.length) return;
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var vencidas = [], proximas = [];
    for (var i = 0; i < metas.length; i++) {
      var m = metas[i];
      if (!m.fechaLimite || m.estado === 'Completada') continue;
      var fLim = new Date(m.fechaLimite);
      fLim.setHours(0, 0, 0, 0);
      var diff = Math.ceil((fLim - hoy) / 86400000);
      if (diff < 0) vencidas.push({ meta: m, dias: -diff });
      else if (diff <= 7) proximas.push({ meta: m, dias: diff });
    }
    if (vencidas.length) {
      SICP.toast.showToast('🔴 ' + vencidas.length + ' meta(s) vencida(s)', 'warning', 5000);
    }
    if (proximas.length) {
      SICP.toast.showToast('🟡 ' + proximas.length + ' meta(s) vencen en los próximos 7 días', 'info', 5000);
    }
  }

  function renderConfig() {
    var perfil = _db.getProfile();
    var conf = _db.getConfig();
    return '<div class="card"><div class="card-header"><h2>⚙️ Configuración</h2></div><p class="text-muted mb-16">Personaliza tu perfil y ajusta ponderaciones.</p></div>' +
      '<div class="grid grid-2 mb-16"><div class="card"><h3 class="mb-8">👤 Perfil</h3>' +
      '<form id="config-form" onsubmit="SICP.app.guardarPerfil(event)">' +
      '<div class="form-row"><div class="form-group"><label>Nombre</label><input class="form-control" name="nombre" value="' + SICP.utils.escapeHtml(perfil.nombre || '') + '"></div>' +
      '<div class="form-group"><label>Institución</label><input class="form-control" name="institucion" value="' + SICP.utils.escapeHtml(perfil.institucion || '') + '"></div></div>' +
      '<div class="form-row"><div class="form-group"><label>Área SNII</label><select class="form-control" name="area">' + SICP.CONSTANTES.AREAS_SNII.map(function(a) { return '<option value="' + a + '"' + (perfil.area === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-group"><label>Nivel</label><select class="form-control" name="nivelActual">' + ['Candidato','Nivel I','Nivel II','Nivel III','No aplica'].map(function(n) { return '<option value="' + n + '"' + (perfil.nivelActual === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="form-group"><label>Perfil SNII 2026</label><select class="form-control" name="perfilInvestigacion">' + SICP.CONSTANTES.PERFILES_INVESTIGACION.map(function(p) { return '<option value="' + p.value + '"' + ((conf.perfilInvestigacion || 'Ciencia básica y de frontera') === p.value ? ' selected' : '') + '>' + p.icon + ' ' + p.value + '</option>'; }).join('') + '</select></div>' +
      '<div class="form-group"><label>Línea de investigación</label><textarea class="form-control" name="lineaInvestigacion">' + SICP.utils.escapeHtml(perfil.lineaInvestigacion || '') + '</textarea></div>' +
      '<div class="form-row"><div class="form-group"><label>ORCID</label><input class="form-control" name="orcid" value="' + SICP.utils.escapeHtml(perfil.orcid || '') + '"></div>' +
      '<div class="form-group"><label>Google Scholar</label><input class="form-control" name="scholar" value="' + SICP.utils.escapeHtml(perfil.scholar || '') + '"></div></div>' +
      '<div class="form-group"><label>Perfil Rizoma</label><input class="form-control" name="cvu" value="' + SICP.utils.escapeHtml(perfil.cvu || '') + '"></div>' +
      '<button type="submit" class="btn btn-primary">Guardar</button></form></div>' +
      '<div class="card"><h3 class="mb-8">⚖️ Ponderaciones</h3><form id="comp-form" onsubmit="SICP.app.guardarComponentes(event)">' +
      '<div class="form-row"><div class="form-group"><label>C1: Producción (%)</label><input class="form-control" type="number" name="ponderacionComponente1" value="' + (conf.ponderacionComponente1 || 40) + '"></div>' +
      '<div class="form-group"><label>C2: Comunidad HCTI (%)</label><input class="form-control" type="number" name="ponderacionComponente2" value="' + (conf.ponderacionComponente2 || 30) + '"></div></div>' +
      '<div class="form-row"><div class="form-group"><label>C3: Acceso universal (%)</label><input class="form-control" type="number" name="ponderacionComponente3" value="' + (conf.ponderacionComponente3 || 30) + '"></div></div>' +
      '<button type="submit" class="btn btn-primary">Guardar pesos</button></form>' +
      '<hr style="margin:16px 0"><h3 class="mb-8">Datos</h3>' +
      '<div class="flex gap-12"><button class="btn btn-accent" onclick="SICP.app.exportarDatos()">⬇ Exportar JSON</button>' +
      '<button class="btn" onclick="document.getElementById(\'importFile2\').click()">⬆ Importar</button>' +
      '<input type="file" id="importFile2" accept=".json" style="display:none" onchange="SICP.app.importarDatos(event)">' +
      '<button class="btn btn-ok" onclick="SICP.app.guardarReporte()">📋 Reporte</button>' +
      '<button class="btn btn-danger" onclick="SICP.app.restablecerDatos()">🔄 Restablecer</button></div></div></div>';
  }

  function guardarPerfil(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    _db.updateProfile({ nombre: fd.get('nombre'), institucion: fd.get('institucion'), area: fd.get('area'), nivelActual: fd.get('nivelActual'), lineaInvestigacion: fd.get('lineaInvestigacion'), orcid: fd.get('orcid'), scholar: fd.get('scholar'), cvu: fd.get('cvu') });
    _db.updateConfig({ perfilInvestigacion: fd.get('perfilInvestigacion') || 'Ciencia básica y de frontera' });
    SICP.toast.showToast('Perfil guardado', 'success');
    refresh();
  }

  function guardarComponentes(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var c1 = parseInt(fd.get('ponderacionComponente1')) || 40;
    var c2 = parseInt(fd.get('ponderacionComponente2')) || 30;
    var c3 = parseInt(fd.get('ponderacionComponente3')) || 30;
    if (c1 + c2 + c3 !== 100) { SICP.toast.showToast('Deben sumar 100%', 'warning'); return; }
    _db.updateConfig({ ponderacionComponente1: c1, ponderacionComponente2: c2, ponderacionComponente3: c3 });
    SICP.toast.showToast('Pesos guardados', 'success');
    refresh();
  }

  function exportarDatos() {
    var json = _db.exportJSON();
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sicp_snii_pro_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarDatos(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      try { _db.importJSON(e.target.result); SICP.toast.showToast('Datos importados', 'success'); location.reload(); }
      catch (err) { SICP.toast.showToast('Error: ' + err.message, 'error'); }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function guardarReporte() { SICP.exportService.generateReport(_db.calcularStats(), _db.get()); }
  function exportarPDF() { SICP.exportService.exportPDF(_db.calcularStats(), _db.get()); }

  function restablecerDatos() {
    SICP.toast.showConfirm('Restablecer datos', '¿Seguro? Se perderán tus datos.').then(function(ok) {
      if (ok) { localStorage.removeItem(SICP.CONFIG.STORAGE_KEY); SICP.toast.showToast('Datos restablecidos', 'info'); setTimeout(function() { location.reload(); }, 1000); }
    });
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(function(reg) {
        console.log('SW registrado', reg.scope);
      }).catch(function(err) {
        console.warn('SW falló', err);
      });
    }
  }

  function toggleDarkMode() {
    _darkMode = !_darkMode;
    document.body.classList.toggle('dark', _darkMode);
    localStorage.setItem('snii_dark', _darkMode);
    SICP.toast.showToast(_darkMode ? 'Modo oscuro' : 'Modo claro', 'info');
  }

  function actualizarSyncStatus() {
    var el = document.getElementById('sync-status');
    if (!el) return;
    var st = SICP.supabaseDB.getSyncStatus();
    var user = SICP.supabaseDB.getUser();
    if (user) {
      el.style.display = 'inline';
      el.className = 'badge ok';
      el.title = 'Sincronizado: ' + user.email;
      el.textContent = '☁️ ' + user.email;
    } else if (st === 'connected') {
      el.style.display = 'inline';
      el.className = 'badge';
      el.title = 'Supabase conectado';
      el.textContent = '☁️ Conectado';
    } else {
      el.style.display = 'none';
    }
    var btn = document.getElementById('sync-btn');
    if (btn) btn.textContent = user ? '🔓' : '🔑';
    if (btn) btn.title = user ? 'Cerrar sesión' : 'Iniciar sesión';
  }

  function mostrarAuthUI() {
    var user = SICP.supabaseDB.getUser();
    if (user) {
      SICP.supabaseDB.signOut().then(function() {
        actualizarSyncStatus();
        SICP.toast.showToast('Sesión cerrada', 'info');
      });
      return;
    }
    SICP.modal.showModal('Iniciar sesión en Supabase',
      '<p class="text-sm text-muted mb-16">Sincroniza tus datos en la nube. Crea una cuenta o inicia sesión.</p>' +
      '<form id="auth-form" onsubmit="SICP.app.iniciarSesion(event)">' +
      '<div class="form-group"><label>Correo</label><input class="form-control" type="email" name="email" required placeholder="tu@correo.com"></div>' +
      '<div class="form-group"><label>Contraseña</label><input class="form-control" type="password" name="password" required minlength="6" placeholder="mín. 6 caracteres"></div>' +
      '<div class="flex gap-8"><button type="submit" class="btn btn-primary" name="action" value="login">Iniciar sesión</button>' +
      '<button type="submit" class="btn btn-accent" name="action" value="signup" formaction="javascript:SICP.app.registrar(event)">Crear cuenta</button></div>' +
      '</form><div id="auth-result" class="mt-16"></div>');
  }

  function iniciarSesion(e) {
    e.preventDefault();
    var email = e.target.email.value;
    var pass = e.target.password.value;
    document.getElementById('auth-result').innerHTML = SICP.utils.spinner('Iniciando sesión...');
    SICP.supabaseDB.signIn(email, pass).then(function() {
      SICP.modal.closeModal();
      SICP.toast.showToast('Sesión iniciada', 'success');
      actualizarSyncStatus();
      return SICP.supabaseDB.syncPull();
    }).then(function(stats) {
      SICP.toast.showToast('Datos sincronizados: ' + stats.productos + ' productos, ' + stats.metas + ' metas', 'success');
      refresh();
    }).catch(function(err) {
      document.getElementById('auth-result').innerHTML = '<p style="color:var(--danger)">' + SICP.utils.escapeHtml(err.message) + '</p>';
    });
  }

  function registrar(e) {
    e.preventDefault();
    var email = document.getElementById('auth-form').email.value;
    var pass = document.getElementById('auth-form').password.value;
    document.getElementById('auth-result').innerHTML = SICP.utils.spinner('Creando cuenta...');
    SICP.supabaseDB.signUp(email, pass).then(function() {
      document.getElementById('auth-result').innerHTML = '<p style="color:var(--ok)">Cuenta creada. Revisa tu correo para confirmar.</p>';
    }).catch(function(err) {
      document.getElementById('auth-result').innerHTML = '<p style="color:var(--danger)">' + SICP.utils.escapeHtml(err.message) + '</p>';
    });
  }

  function sincronizar() {
    if (!SICP.supabaseDB.getUser()) { SICP.toast.showToast('Inicia sesión primero', 'warning'); return; }
    var st = document.getElementById('sync-status');
    if (st) st.textContent = '☁️ Sincronizando...';
    SICP.supabaseDB.syncPush().then(function() {
      return SICP.supabaseDB.syncPull();
    }).then(function(stats) {
      actualizarSyncStatus();
      SICP.toast.showToast('Sincronizado: ' + stats.productos + ' productos, ' + stats.metas + ' metas', 'success');
      refresh();
    }).catch(function(err) {
      actualizarSyncStatus();
      SICP.toast.showToast('Error: ' + err.message, 'error');
    });
  }

  var app = {
    _db: _db, _currentSection: _currentSection, _navHistory: _navHistory,
    init: init, refresh: refresh, navegar: navegar, navegarAtras: navegarAtras,
    exportarDatos: exportarDatos, importarDatos: importarDatos,
    guardarReporte: guardarReporte, exportarPDF: exportarPDF, restablecerDatos: restablecerDatos,
    guardarPerfil: guardarPerfil, guardarComponentes: guardarComponentes,
    toggleDarkMode: toggleDarkMode,
    mostrarAuthUI: mostrarAuthUI, iniciarSesion: iniciarSesion, registrar: registrar,
    sincronizar: sincronizar, actualizarSyncStatus: actualizarSyncStatus
  };

  window.SICP_APP = app;
  return app;
})();

document.addEventListener('DOMContentLoaded', function() { SICP.app.init(); });
