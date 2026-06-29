SICP.keyboard = (function() {
  var shortcuts = [];

  function registerShortcut(key, ctrl, fn, description) {
    shortcuts.push({ key: key, ctrl: ctrl, fn: fn, description: description });
  }

  function initKeyboardShortcuts(app) {
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      for (var i = 0; i < shortcuts.length; i++) {
        var s = shortcuts[i];
        if (s.ctrl && !(e.ctrlKey || e.metaKey)) continue;
        if (!s.ctrl && (e.ctrlKey || e.metaKey)) continue;
        if (e.key.toLowerCase() === s.key.toLowerCase()) {
          e.preventDefault();
          s.fn(app);
          return;
        }
      }
    });
    registerShortcut('1', false, function(a) { a.navegar('dashboard'); }, 'Dashboard');
    registerShortcut('2', false, function(a) { a.navegar('metas'); }, 'Metas');
    registerShortcut('3', false, function(a) { a.navegar('productos'); }, 'Productos');
    registerShortcut('4', false, function(a) { a.navegar('evidencias'); }, 'Evidencias');
    registerShortcut('5', false, function(a) { a.navegar('snii'); }, 'Simulador SNII');
    registerShortcut('6', false, function(a) { a.navegar('plan'); }, 'Plan de Carrera');
    registerShortcut('7', false, function(a) { a.navegar('biblioteca'); }, 'Biblioteca');
    registerShortcut('8', false, function(a) { a.navegar('ia'); }, 'IA + Prompts');
    registerShortcut('9', false, function(a) { a.navegar('config'); }, 'Configuración');
    registerShortcut('n', true, function(a) { handleNewItem(a); }, 'Nuevo (según sección)');
    registerShortcut('s', true, function(a) { document.querySelector('#config-form button[type=submit]') && document.querySelector('#config-form button[type=submit]').click(); }, 'Guardar configuración');
    registerShortcut('e', true, function(a) { a.exportarDatos && a.exportarDatos(); }, 'Exportar datos');
    registerShortcut('d', true, function(a) { a.toggleDarkMode && a.toggleDarkMode(); }, 'Dark mode');
    registerShortcut('Escape', false, function(a) { SICP.modal.closeModal(); }, 'Cerrar modal');
    registerShortcut('b', true, function(a) { a.navegarAtras && a.navegarAtras(); }, 'Atrás');
    registerShortcut('f', true, function(a) { focusSearch(); }, 'Buscar');
    registerShortcut('p', true, function(a) { a.exportarPDF && a.exportarPDF(); }, 'Exportar PDF');
    registerShortcut('/', false, function(a) { showHelp(); }, 'Ayuda');
    return shortcuts;
  }

  function handleNewItem(app) {
    var section = app._currentSection;
    var btn = document.querySelector('#section-' + section + ' .btn-primary');
    if (btn) btn.click();
  }

  function focusSearch() {
    var search = document.querySelector('#prod-buscar, #meta-buscar, #evidencia-buscar, #bib-buscar');
    if (search) { search.focus(); search.select(); }
  }

  function showHelp() {
    if (SICP.modal) {
      var html = '<div style="max-height:400px;overflow-y:auto">' +
        '<p class="text-sm text-muted mb-16">Atajos de teclado disponibles:</p>' +
        '<table style="width:100%;font-size:.85rem">';
      shortcuts.slice().sort(function(a, b) {
        var ka = (a.ctrl ? 'Ctrl+' : '') + a.key;
        var kb = (b.ctrl ? 'Ctrl+' : '') + b.key;
        return ka.localeCompare(kb);
      }).forEach(function(s) {
        html += '<tr><td style="padding:4px 8px;font-weight:600;white-space:nowrap">' +
          (s.ctrl ? 'Ctrl+' : '') + (s.key.length === 1 ? s.key.toUpperCase() : s.key) +
          '</td><td style="padding:4px 8px">' + (s.description || '') + '</td></tr>';
      });
      html += '</table></div>';
      SICP.modal.showModal('⌨️ Atajos de teclado', html);
    }
  }

  function getShortcuts() {
    return shortcuts.slice().sort(function(a, b) { return a.key.localeCompare(b.key); });
  }

  return { initKeyboardShortcuts: initKeyboardShortcuts, registerShortcut: registerShortcut, getShortcuts: getShortcuts, showHelp: showHelp };
})();
