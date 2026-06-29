SICP.DashboardModule = (function() {
  return {
    render: function(stats, db) {
      var pct = stats.scoreSNII;
      var nivelColor = pct >= 70 ? 'var(--ok)' : pct >= 40 ? 'var(--warn)' : 'var(--danger)';
      var recomendaciones = SICP.DashboardModule._getRecomendaciones(stats);

      return '<div class="card"><div class="card-header"><h2>Dashboard SNII 2026</h2></div></div>' +
        '<div class="grid grid-4 mb-16">' +
          '<div class="card kpi-card"><span class="kpi-label">Score SNII</span><span class="kpi-value" style="color:' + nivelColor + '">' + stats.scoreSNII + '%</span></div>' +
          '<div class="card kpi-card"><span class="kpi-label">Avance General</span><span class="kpi-value">' + stats.avanceGeneral + '%</span></div>' +
          '<div class="card kpi-card"><span class="kpi-label">Productos</span><span class="kpi-value">' + stats.totalProductos + '</span></div>' +
          '<div class="card kpi-card"><span class="kpi-label">Evidencias</span><span class="kpi-value">' + stats.evidenciasCompletas + '/' + stats.totalEvidencias + '</span></div>' +
        '</div>' +
        '<div class="grid grid-2 mb-16">' +
          '<div class="card"><h3 class="mb-8">Desempeño por componente</h3>' +
            '<div class="comp-bar"><div class="comp-label">C1: Producción</div><div class="progress-bar"><div class="progress-fill" style="width:' + Math.min(stats.componente1, 100) + '%;background:#2563eb"></div></div><span class="text-sm">' + Math.min(stats.componente1, 100) + '/100</span></div>' +
            '<div class="comp-bar"><div class="comp-label">C2: Comunidad HCTI</div><div class="progress-bar"><div class="progress-fill" style="width:' + Math.min(stats.componente2, 100) + '%;background:#d97706"></div></div><span class="text-sm">' + Math.min(stats.componente2, 100) + '/100</span></div>' +
            '<div class="comp-bar"><div class="comp-label">C3: Acceso universal</div><div class="progress-bar"><div class="progress-fill" style="width:' + Math.min(stats.componente3, 100) + '%;background:#16a34a"></div></div><span class="text-sm">' + Math.min(stats.componente3, 100) + '/100</span></div>' +
          '</div>' +
          '<div class="card"><h3 class="mb-8">Brechas detectadas</h3>' +
            (stats.brechas.length === 0 ? '<p style="color:var(--ok)">Sin brechas críticas</p>' :
              '<ul style="padding-left:16px;line-height:1.8">' + stats.brechas.map(function(b) { return '<li><strong>' + b.area + ':</strong> ' + b.actual + ' / ' + b.meta + '</li>'; }).join('') + '</ul>') +
          '</div>' +
        '</div>' +
        '<div class="card"><h3 class="mb-8">Recomendaciones</h3><ul style="padding-left:16px;line-height:1.8">' + recomendaciones.map(function(r) { return '<li>' + r + '</li>'; }).join('') + '</ul></div>';
    },

    _getRecomendaciones: function(stats) {
      var r = [];
      if (stats.componente1 < 40) r.push('Publica artículos indizados y registra proyectos de investigación.');
      if (stats.componente2 < 30) r.push('Dirige tesis, participa en comités editoriales y fortalece tu liderazgo.');
      if (stats.componente3 < 20) r.push('Deposita productos en acceso abierto y realiza actividades de divulgación.');
      if (stats.totalEvidencias === 0) r.push('Registra evidencias probatorias para respaldar tus productos.');
      if (r.length === 0) r.push('Mantén el ritmo. Prepara tu postulación en el Sistema Ápeiron.');
      return r;
    },

    afterRender: function() {}
  };
})();
