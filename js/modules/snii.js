SICP.SNIIModule = (function() {
  var _escenario = {};
  var _snapshots = [];

  function init() {
    try { _snapshots = JSON.parse(localStorage.getItem('snii_snapshots')) || []; } catch(e) { _snapshots = []; }
  }
  init();

  function escape(s) { return SICP.utils.escapeHtml(s); }

  function getNivelFromScore(pct) {
    var niveles = SICP.CONSTANTES.NIVELES_SNII;
    for (var i = niveles.length - 1; i >= 0; i--) {
      if (pct >= niveles[i].rango[0]) return niveles[i];
    }
    return niveles[0];
  }

  function getSiguienteNivel(pct) {
    var niveles = SICP.CONSTANTES.NIVELES_SNII;
    for (var i = 0; i < niveles.length; i++) {
      if (pct < niveles[i].rango[0]) return niveles[i];
    }
    return null;
  }

  function calcularEscenario(base, cambios) {
    var s = {
      articulos: (base.articulos || 0) + (cambios.articulos || 0),
      libros: (base.libros || 0) + (cambios.libros || 0),
      congresos: (base.congresos || 0) + (cambios.congresos || 0),
      proyectos: (base.proyectos || 0) + (cambios.proyectos || 0),
      innovacion: (base.innovacion || 0) + (cambios.innovacion || 0),
      tesis: (base.tesis || 0) + (cambios.tesis || 0),
      liderazgo: (base.liderazgo || 0) + (cambios.liderazgo || 0),
      docencia: (base.docencia || 0) + (cambios.docencia || 0),
      divulgacion: (base.divulgacion || 0) + (cambios.divulgacion || 0)
    };
    return s;
  }

  function getScoreEscenario(esc, conf) {
    var c1 = Math.min(
      (esc.articulos * (conf.ponderacionArticulos || 12)) +
      (esc.libros * (conf.ponderacionLibros || 7)) +
      (esc.congresos * (conf.ponderacionCongresos || 3)) +
      (esc.proyectos * (conf.ponderacionProyectos || 8)) +
      (esc.innovacion * (conf.ponderacionInnovacion || 7)), 100);
    var c2 = Math.min(
      (esc.tesis * (conf.ponderacionTesis || 6)) +
      (esc.liderazgo * (conf.ponderacionLiderazgo || 5)) +
      (esc.docencia * (conf.ponderacionDocencia || 3)), 100);
    var c3 = Math.min(
      (esc.divulgacion * (conf.ponderacionDivulgacion || 3)), 100);
    var p1 = (conf.ponderacionComponente1 || 40) / 100;
    var p2 = (conf.ponderacionComponente2 || 30) / 100;
    var p3 = (conf.ponderacionComponente3 || 30) / 100;
    return { c1: c1, c2: c2, c3: c3, total: Math.round(c1 * p1 + c2 * p2 + c3 * p3) };
  }

  function guardarSnapshot(stats, conf) {
    var snap = {
      fecha: new Date().toISOString(),
      score: stats.scoreSNII,
      c1: stats.componente1, c2: stats.componente2, c3: stats.componente3,
      articulos: stats.articulos, libros: stats.libros, tesis: stats.tesis,
      innovacion: stats.innovacion, liderazgo: stats.liderazgo, divulgacion: stats.divulgacion,
      totalProductos: stats.totalProductos
    };
    _snapshots.push(snap);
    if (_snapshots.length > 20) _snapshots.shift();
    localStorage.setItem('snii_snapshots', JSON.stringify(_snapshots));
  }

  function getEvidenciasPorProducto() {
    try {
      var pros = SICP.db.getProductos();
      var evs = SICP.db.getEvidencias();
      var map = {};
      pros.forEach(function(p) {
        map[p.id] = { producto: p, evidencias: [] };
      });
      evs.forEach(function(e) {
        var pid = e.productoId || e.producto_id;
        if (map[pid]) map[pid].evidencias.push(e);
      });
      return map;
    } catch(e) { return {}; }
  }

  function cambiarEscenario(tipo, delta) {
    if (!_escenario[tipo]) _escenario[tipo] = 0;
    _escenario[tipo] = Math.max(0, (_escenario[tipo] || 0) + delta);
    if (window.SICP_APP) SICP_APP.refresh();
  }

  function limpiarEscenario() {
    _escenario = {};
    if (window.SICP_APP) SICP_APP.refresh();
  }

  function tomarSnapshot() {
    try {
      var stats = SICP.db.calcularStats();
      var conf = SICP.db.getConfig();
      guardarSnapshot(stats, conf);
      SICP.toast.showToast('Diagnóstico guardado', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    } catch(e) { SICP.toast.showToast('Error al guardar', 'error'); }
  }

  function borrarSnapshots() {
    _snapshots = [];
    localStorage.removeItem('snii_snapshots');
    if (window.SICP_APP) SICP_APP.refresh();
  }

  function exportarSimulacion(stats, conf) {
    var txt = '=== DIAGNÓSTICO SNII 2026 ===\n' +
      'Fecha: ' + new Date().toLocaleDateString() + '\n' +
      'Perfil: ' + (conf.perfilInvestigacion || 'No definido') + '\n' +
      'Score SNII: ' + stats.scoreSNII + '%\n' +
      'C1 (Producción): ' + stats.componente1 + '/100\n' +
      'C2 (Comunidad HCTI): ' + stats.componente2 + '/100\n' +
      'C3 (Acceso universal): ' + stats.componente3 + '/100\n' +
      'Brechas: ' + (stats.brechas.length > 0 ? stats.brechas.map(function(b){ return b.area + ': ' + b.actual + '/' + b.meta; }).join(', ') : 'Ninguna') + '\n' +
      'Nivel actual: ' + getNivelFromScore(stats.scoreSNII).id + '\n';
    if (Object.keys(_escenario).some(function(k){ return _escenario[k]; })) {
      var esc = calcularEscenario(stats, _escenario);
      var res = getScoreEscenario(esc, conf);
      txt += '\n--- Escenario simulado ---\n' +
        'Score proyectado: ' + res.total + '%\n' +
        'C1: ' + res.c1 + '/100 | C2: ' + res.c2 + '/100 | C3: ' + res.c3 + '/100\n' +
        'Cambios: ' + Object.keys(_escenario).filter(function(k){ return _escenario[k]; }).map(function(k){ return k + ': +' + _escenario[k]; }).join(', ') + '\n';
    }
    SICP.utils.copyText(txt); SICP.toast.showToast('Copiado al portapapeles', 'success');
  }

  function renderReferenciaNiveles() {
    return '<table><tr><th>Nivel</th><th>Rango</th><th>Características</th></tr>' +
      SICP.CONSTANTES.NIVELES_SNII.map(function(n) {
        return '<tr><td><strong>' + n.id + '</strong></td><td>' + n.rango[0] + '% – ' + n.rango[1] + '%</td><td>' + n.desc + '</td></tr>';
      }).join('') + '</table>';
  }

  function renderSnapshots() {
    if (_snapshots.length === 0) return '<p class="text-muted text-sm">Aún no has guardado diagnósticos. Usa "Guardar diagnóstico" para trackear tu progreso.</p>';
    var html = '<div style="max-height:250px;overflow-y:auto">' +
      '<table><tr><th>Fecha</th><th>Score</th><th>C1</th><th>C2</th><th>C3</th><th>Arts</th><th>Tesis</th></tr>';
    var sorted = _snapshots.slice().reverse();
    sorted.forEach(function(s) {
      var d = new Date(s.fecha);
      html += '<tr><td class="text-sm">' + d.toLocaleDateString() + '</td>' +
        '<td><strong>' + s.score + '%</strong></td>' +
        '<td>' + s.c1 + '</td><td>' + s.c2 + '</td><td>' + s.c3 + '</td>' +
        '<td>' + s.articulos + '</td><td>' + s.tesis + '</td></tr>';
    });
    html += '</table></div>' +
      '<button class="btn btn-sm btn-danger mt-8" onclick="SICP.SNIIModule.borrarSnapshots()">🗑️ Borrar historial</button>';
    return html;
  }

  function renderEscenario(stats, conf) {
    var esc = calcularEscenario(stats, _escenario);
    var res = getScoreEscenario(esc, conf);
    var campos = [
      { key: 'articulos', label: 'Artículos', actual: stats.articulos },
      { key: 'libros', label: 'Libros', actual: stats.libros },
      { key: 'tesis', label: 'Tesis', actual: stats.tesis },
      { key: 'innovacion', label: 'Innovación', actual: stats.innovacion },
      { key: 'liderazgo', label: 'Liderazgo', actual: stats.liderazgo },
      { key: 'divulgacion', label: 'Divulgación', actual: stats.divulgacion }
    ];
    var hasCambios = Object.keys(_escenario).some(function(k){ return _escenario[k]; });

    var html = '<div class="grid grid-2" style="margin-bottom:12px">' +
      campos.map(function(c) {
        var delta = _escenario[c.key] || 0;
        var total = c.actual + delta;
        return '<div class="flex-between items-center" style="padding:4px 0"><span class="text-sm">' + c.label + '</span>' +
          '<div class="flex gap-8 items-center"><button class="btn-sm" onclick="SICP.SNIIModule.cambiarEscenario(\'' + c.key + '\',-1)">−</button>' +
          '<span style="min-width:40px;text-align:center;font-weight:600">' + c.actual + '</span>' +
          '<button class="btn-sm" onclick="SICP.SNIIModule.cambiarEscenario(\'' + c.key + '\',1)">+</button>' +
          (delta ? '<span style="color:var(--accent);font-weight:600" title="Ajuste">+' + delta + '</span>' : '') +
          (delta ? '<span style="font-weight:600">→ ' + total + '</span>' : '') +
          '</div></div>';
      }).join('') + '</div>';

    if (hasCambios) {
      var diff = res.total - stats.scoreSNII;
      var signo = diff >= 0 ? '+' : '';
      html += '<div style="background:linear-gradient(135deg,#eff6ff,#f0fdfa);border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-top:8px">' +
        '<div class="flex-between items-center"><span class="font-bold">Score proyectado:</span><span style="font-size:1.4rem;font-weight:800;color:' + (diff >= 0 ? 'var(--ok)' : 'var(--danger)') + '">' + res.total + '% (' + signo + diff + ')</span></div>' +
        '<div class="flex gap-8 mt-4" style="font-size:.82rem"><span>C1: ' + res.c1 + '</span><span>C2: ' + res.c2 + '</span><span>C3: ' + res.c3 + '</span></div>' +
        '<div class="mt-8 text-sm" style="color:var(--muted)">Nivel resultante: <strong>' + getNivelFromScore(res.total).id + '</strong></div>' +
        '</div>';
    }

    return html;
  }

  return {
    cambiarEscenario: cambiarEscenario,
    limpiarEscenario: limpiarEscenario,
    tomarSnapshot: tomarSnapshot,
    borrarSnapshots: borrarSnapshots,
    exportarSimulacion: exportarSimulacion,

    render: function(stats, db) {
      var conf = db.get().config || {};
      var perfil = conf.perfilInvestigacion || 'Ciencia básica y de frontera';
      var pct = stats.scoreSNII;
      var nivelColor = pct >= 70 ? 'verde' : pct >= 40 ? 'amarillo' : 'rojo';
      var nivelTexto = pct >= 70 ? 'Perfil competitivo para SNII (SECIHTI)' : pct >= 40 ? 'Perfil en consolidación' : 'Perfil inicial, requiere fortalecerse';

      var nivelActual = getNivelFromScore(pct);
      var siguienteNivel = getSiguienteNivel(pct);

      var evMap = getEvidenciasPorProducto();
      var totalConEvidencia = 0;
      var totalProductosArr = Object.keys(evMap);
      totalProductosArr.forEach(function(pid) {
        if (evMap[pid].evidencias.length > 0) totalConEvidencia++;
      });
      var pctEvidencia = totalProductosArr.length > 0 ? Math.round(totalConEvidencia / totalProductosArr.length * 100) : 0;

      return '<div class="card"><div class="card-header"><h2>Simulador SNII 2026 — Diagnóstico Estratégico</h2></div>' +
        '<p class="text-muted mb-16">Modelo de 3 componentes de los Criterios Específicos 2026 (SECIHTI). No sustituye la evaluación oficial.</p>' +
        '<div class="sim-result ' + nivelColor + '"><div class="pct">' + pct + '%</div>' +
        '<h3>' + nivelTexto + '</h3>' +
        '<p class="text-sm">' + nivelActual.id + ' · <strong>Siguiente meta:</strong> ' + (siguienteNivel ? siguienteNivel.id + ' (' + siguienteNivel.rango[0] + '%)' : 'Nivel máximo alcanzado') + '</p>' +
        '</div>' +

        '<div class="progress-bar" style="height:16px;margin:12px 0"><div class="progress-fill" style="width:' + pct + '%;background:' + (pct >= 70 ? 'var(--ok)' : pct >= 40 ? 'var(--warn)' : 'var(--danger)') + '"></div></div>' +
        '<div class="flex-between"><span class="text-muted text-sm">0%</span><span class="text-muted text-sm">40% — Consolidación</span><span class="text-muted text-sm">70% — Competitivo</span><span class="text-muted text-sm">100%</span></div>' +
        '<div class="flex gap-8 mt-8"><button class="btn btn-sm btn-accent" onclick="SICP.SNIIModule.tomarSnapshot()">💾 Guardar diagnóstico</button>' +
        '<button class="btn btn-sm" onclick="SICP.SNIIModule.exportarSimulacion(SICP.db.calcularStats(),SICP.db.getConfig())">📋 Exportar</button></div></div>' +

        '<div class="mb-16" style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px">' +
          '<div class="flex gap-12 items-center" style="flex-wrap:wrap">' +
            '<span style="font-weight:600;font-size:.88rem">Perfil:</span><span class="pill pill-ok" style="font-size:.85rem;padding:6px 14px">' + perfil + '</span>' +
            '<span style="font-size:.82rem;color:var(--muted)">Pesos: C1=' + (conf.ponderacionComponente1 || 40) + '% · C2=' + (conf.ponderacionComponente2 || 30) + '% · C3=' + (conf.ponderacionComponente3 || 30) + '%</span>' +
          '</div>' +
          '<div class="flex gap-16 mt-8" style="font-size:.82rem">' +
            '<span>📄 Productos: <strong>' + stats.totalProductos + '</strong></span>' +
            '<span>🔍 Evidencias: <strong>' + stats.evidenciasCompletas + '/' + stats.totalEvidencias + '</strong></span>' +
            '<span>🔗 Con evidencia: <strong style="color:' + (pctEvidencia >= 80 ? 'var(--ok)' : pctEvidencia >= 50 ? 'var(--warn)' : 'var(--danger)') + '">' + totalConEvidencia + '/' + totalProductosArr.length + ' (' + pctEvidencia + '%)</strong></span>' +
          '</div></div>' +

        '<div class="grid grid-2 mb-16">' +
          '<div class="card"><h3 class="mb-8">📊 Desempeño por componente</h3>' +
          '<div class="table-wrap"><table><tr><th>Componente</th><th>Puntaje</th><th>Peso</th><th>Contribución</th></tr>' +
            (function(){ var cols = [
              { label: 'C1: Producción', val: Math.min(stats.componente1, 100), peso: conf.ponderacionComponente1 || 40 },
              { label: 'C2: Comunidad HCTI', val: Math.min(stats.componente2, 100), peso: conf.ponderacionComponente2 || 30 },
              { label: 'C3: Acceso universal', val: Math.min(stats.componente3, 100), peso: conf.ponderacionComponente3 || 30 }
            ]; return cols.map(function(c) {
              var contrib = Math.round(c.val * (c.peso / 100));
              var barColor = c.val >= 70 ? 'var(--ok)' : c.val >= 40 ? 'var(--warn)' : 'var(--danger)';
              return '<tr><td><strong>' + c.label + '</strong></td><td>' + c.val + '/100</td><td>' + c.peso + '%</td>' +
                '<td><div class="flex gap-8 items-center"><div class="progress-bar" style="flex:1;height:6px"><div class="progress-fill" style="width:' + c.val + '%;background:' + barColor + '"></div></div><span class="text-sm">' + contrib + ' pts</span></div></td></tr>';
            }).join('');
            })() +
          '</table></div>' +
          '<div class="mt-12" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px"><strong style="color:#78350f">📌 Recomendación:</strong><p class="text-sm mt-4" style="color:#78350f">' +
            (function(){ var items = []; if (stats.componente1 < 40) items.push('C1: Publica artículos indizados y registra proyectos.'); if (stats.componente2 < 30) items.push('C2: Dirige tesis, participa en comités.'); if (stats.componente3 < 20) items.push('C3: Deposita productos en acceso abierto.'); if (perfil === 'Desarrollo tecnológico e innovación' && stats.innovacion < 2) items.push('Prioriza patentes, software y transferencia.'); if (items.length === 0) items.push('Mantén el ritmo. Prepara tu postulación en Ápeiron.'); return items.join(' '); })() +
          '</p></div></div>' +

          '<div class="card"><h3 class="mb-8">🔬 Simulador de escenarios</h3>' +
            '<p class="text-sm text-muted mb-8">¿Qué pasaría si agregas más productos? Ajusta los controles y ve el impacto en tu score.</p>' +
            renderEscenario(stats, conf) +
            (Object.keys(_escenario).some(function(k){ return _escenario[k]; }) ? '<button class="btn btn-sm mt-8" onclick="SICP.SNIIModule.limpiarEscenario()">🔄 Limpiar simulación</button>' : '') +
          '</div>' +
        '</div>' +

        '<div class="grid grid-2 mb-16">' +
          '<div class="card"><h3 class="mb-8">🎯 Brechas detectadas</h3>' +
            (stats.brechas.length === 0 ? '<div style="background:#ecfdf3;border:1px solid #86efac;border-radius:8px;padding:12px"><strong style="color:#067647">Sin brechas críticas. Bien.</strong></div>' :
              '<ul style="padding-left:16px;line-height:1.8">' + stats.brechas.map(function(b) { return '<li><strong>' + b.area + ':</strong> ' + b.actual + ' / ' + b.meta + ' <span class="pill pill-warn">-' + (b.meta - b.actual) + '</span></li>'; }).join('') + '</ul>') +
            '<div class="mt-8"><h4 class="text-sm mb-4">Acciones prioritarias</h4><ol style="padding-left:18px;line-height:1.8;font-size:.85rem">' +
              (function(){ var a = []; if (stats.articulos < 3) a.push('Pipeline de artículos: borrador, enviado, revisión.'); if (stats.tesis < 2) a.push('Identificar estudiantes para dirigir tesis.'); if (stats.liderazgo < 2) a.push('Postular a comités editoriales.'); if (stats.divulgacion < 2) a.push('Depositar en repositorio abierto.'); a.push('Mantener Perfil Rizoma, ORCID y Google Scholar.'); return a.slice(0,6).map(function(x,i){ return '<li>' + x + '</li>'; }).join(''); })() +
            '</ol></div></div>' +

          '<div class="card"><h3 class="mb-8">📦 Productos por componente</h3>' +
            '<table><tr><th>Componente</th><th>Tipos</th><th>Total</th></tr>' +
            '<tr><td><strong>C1: Producción</strong></td><td class="text-sm">Artículos, Libros, Congresos, Proyectos, Innovación</td><td><strong>' + (stats.articulos + stats.libros + stats.congresos + stats.proyectos + stats.innovacion) + '</strong></td></tr>' +
            '<tr><td><strong>C2: Comunidad HCTI</strong></td><td class="text-sm">Tesis, Liderazgo, Docencia</td><td><strong>' + (stats.tesis + stats.liderazgo + stats.docencia) + '</strong></td></tr>' +
            '<tr><td><strong>C3: Acceso universal</strong></td><td class="text-sm">Divulgación, Acceso abierto</td><td><strong>' + stats.divulgacion + '</strong></td></tr>' +
            '<tr style="border-top:2px solid var(--line)"><td><strong>Total</strong></td><td></td><td><strong>' + stats.totalProductos + '</strong></td></tr>' +
            '</table>' +

            '<div class="mt-12"><h4 class="text-sm mb-4">🔗 Evidencias probatorias</h4>' +
              '<div class="flex gap-8 items-center"><div class="progress-bar" style="flex:1;height:6px"><div class="progress-fill" style="width:' + pctEvidencia + '%;background:' + (pctEvidencia >= 80 ? 'var(--ok)' : pctEvidencia >= 50 ? 'var(--warn)' : 'var(--danger)') + '"></div></div>' +
              '<span style="font-weight:600;font-size:.85rem;color:' + (pctEvidencia >= 80 ? 'var(--ok)' : pctEvidencia >= 50 ? 'var(--warn)' : 'var(--danger)') + '">' + pctEvidencia + '%</span></div>' +
              '<p class="text-sm text-muted mt-4">' + totalConEvidencia + ' de ' + totalProductosArr.length + ' productos tienen al menos 1 evidencia.' +
              (pctEvidencia < 80 ? ' <span style="color:var(--warn)">Registra evidencias para fortalecer tu postulación.</span>' : '') +
            '</div></div>' +
          '</div>' +
        '</div>' +

        '<div class="grid grid-2 mb-16">' +
          '<div class="card"><h3 class="mb-8">📈 Historial de diagnósticos</h3>' + renderSnapshots() + '</div>' +
          '<div class="card"><h3 class="mb-8">🏅 Niveles de referencia</h3>' + renderReferenciaNiveles() + '</div>' +
        '</div>' +

        '<div class="card"><h3>📖 Referencia: Componentes de evaluación SNII 2026</h3>' +
          '<div class="grid grid-3 mt-8">' +
            '<div style="background:#eff6ff;padding:12px;border-radius:8px;border:1px solid #bfdbfe"><h4 style="color:#1d4ed8">C1: Producción</h4><p class="text-sm">Investigación científica, humanística y tecnológica. Artículos, libros, patentes, proyectos.</p></div>' +
            '<div style="background:#fef2f2;padding:12px;border-radius:8px;border:1px solid #fecaca"><h4 style="color:#b91c1c">C2: Comunidad HCTI</h4><p class="text-sm">Fortalecimiento de la comunidad. Tesis, liderazgo, docencia, comités.</p></div>' +
            '<div style="background:#f0fdf4;padding:12px;border-radius:8px;border:1px solid #bbf7d0"><h4 style="color:#15803d">C3: Acceso universal</h4><p class="text-sm">Divulgación, ciencia abierta, repositorios, métricas de alcance.</p></div>' +
          '</div></div>';
    },

    afterRender: function() {}
  };
})();
