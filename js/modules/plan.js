SICP.PlanModule = (function() {
  var _startYear = new Date().getFullYear();
  var _calMonth = new Date().getMonth();
  var _calYear = new Date().getFullYear();

  var PLAN_TEXTS = [
    'Ordenar y producir — Actualiza Perfil Único de Rizoma, publica 2 artículos, inicia tesis, abre repositorios, registra en Ápeiron.',
    'Consolidar los 3 componentes — C1: artículos, libros. C2: tesis tituladas, liderazgo. C3: divulgación, repositorios.',
    'Liderazgo e impacto — Proyecto interinstitucional, comité editorial, magistrales, transferencia.',
    'Postulación SECIHTI — Auditar evidencias probatorias, cerrar brechas según Anexos 1-4, preparar narrativa.'
  ];

  var WEEKLY_ROUTINE = [
    { dia: 'Lunes', actividad: 'Lectura y matriz bibliográfica', resultado: '5 referencias procesadas' },
    { dia: 'Martes', actividad: 'Redacción científica', resultado: '500-800 palabras' },
    { dia: 'Miércoles', actividad: 'Datos, análisis o metodología', resultado: 'Tabla, figura o apartado' },
    { dia: 'Jueves', actividad: 'Gestión de evidencias y Perfil Rizoma', resultado: 'Carpeta actualizada' },
    { dia: 'Viernes', actividad: 'Vinculación, redes, convocatorias', resultado: '1 oportunidad activada' },
    { dia: 'Sábado', actividad: 'Formación continua (curso, seminario, lectura)', resultado: 'Avance en habilidades' },
    { dia: 'Domingo', actividad: 'Descanso activo (revisión ligera, organización pendientes)', resultado: 'Plan de la semana siguiente' }
  ];

  var CLAVE_TIPS = [
    'Consistencia > intensidad. Distribuye 10-15 horas semanales.',
    'Usa la matriz de Eisenhower: divide tus metas en urgente/importante.',
    'Cada producto debe tener al menos 1 evidencia probatoria vinculada.',
    'Revisa los Lineamientos SECIHTI cada trimestre (se actualizan).',
    'Mantén actualizado tu Perfil Único de Rizoma mensualmente.',
    'Toda publicación debe estar en acceso abierto para sumar C3.'
  ];

  function escape(s) { return SICP.utils.escapeHtml(s); }

  function cambiarAnio(delta) {
    _startYear += delta;
    if (_startYear < 2020) _startYear = 2020;
    if (_startYear > 2050) _startYear = 2050;
    if (window.SICP_APP) SICP_APP.refresh();
  }

  function cambiarMes(delta) {
    _calMonth += delta;
    if (_calMonth < 0) { _calMonth = 11; _calYear--; }
    if (_calMonth > 11) { _calMonth = 0; _calYear++; }
    if (window.SICP_APP) SICP_APP.refresh();
  }

  function cambiarAnioCal(delta) {
    _calYear += delta;
    if (window.SICP_APP) SICP_APP.refresh();
  }

  function renderCalendario(metas) {
    var primerDia = new Date(_calYear, _calMonth, 1);
    var ultimoDia = new Date(_calYear, _calMonth + 1, 0);
    var diasEnMes = ultimoDia.getDate();
    var diaSemanaInicio = primerDia.getDay();
    var eventos = {};

    metas.filter(function(m) { return m.fechaLimite; }).forEach(function(m) {
      var d = new Date(m.fechaLimite);
      if (d.getFullYear() === _calYear && d.getMonth() === _calMonth) {
        var dia = d.getDate();
        if (!eventos[dia]) eventos[dia] = [];
        eventos[dia].push(m.titulo);
      }
    });

    var maxYear = new Date().getFullYear() + 10;
    var anios = [];
    for (var y = _calYear - 5; y <= maxYear; y++) anios.push(y);

    var diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    var celdas = diasSemana.map(function(d) { return '<div class="cal-header">' + d + '</div>'; }).join('');
    for (var i = 0; i < diaSemanaInicio; i++) celdas += '<div class="cal-day"></div>';
    var hoy = new Date();
    for (var d = 1; d <= diasEnMes; d++) {
      var esHoy = d === hoy.getDate() && _calMonth === hoy.getMonth() && _calYear === hoy.getFullYear();
      var tieneEvento = eventos[d] && eventos[d].length > 0;
      celdas += '<div class="cal-day' + (esHoy ? ' today' : '') + (tieneEvento ? ' has-event' : '') + '"' + (tieneEvento ? ' title="' + escape(eventos[d].join('; ')) + '"' : '') + '>' + d + (tieneEvento ? '<div class="event-dot"></div>' : '') + '</div>';
    }

    var eventosCount = 0;
    metas.filter(function(m) { return m.fechaLimite && new Date(m.fechaLimite) >= new Date(_calYear, _calMonth, 1) && new Date(m.fechaLimite) <= new Date(_calYear, _calMonth + 1, 0); }).forEach(function() { eventosCount++; });

    return '<div class="flex-between mb-8">' +
      '<div class="flex gap-8 items-center">' +
        '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarMes(-1)" title="Mes anterior">◀</button>' +
        '<select class="form-control" style="width:auto" onchange="SICP.PlanModule.irAMes(this.value)">' +
          SICP.CONSTANTES.MESES.map(function(m, i) { return '<option value="' + i + '"' + (i === _calMonth ? ' selected' : '') + '>' + m + '</option>'; }).join('') +
        '</select>' +
        '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarMes(1)" title="Mes siguiente">▶</button>' +
      '</div>' +
      '<div class="flex gap-8 items-center">' +
        '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarAnioCal(-1)" title="Año anterior">◀</button>' +
        '<select class="form-control" style="width:auto" onchange="SICP.PlanModule.irAAnioCal(this.value)">' +
          anios.map(function(a) { return '<option value="' + a + '"' + (a === _calYear ? ' selected' : '') + '>' + a + '</option>'; }).join('') +
        '</select>' +
        '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarAnioCal(1)" title="Año siguiente">▶</button>' +
      '</div>' +
      '<span class="text-muted text-sm">' + eventosCount + ' eventos este mes</span>' +
    '</div><div class="cal-grid">' + celdas + '</div><p class="text-muted text-sm mt-8">Los puntos azules indican metas con fecha límite este mes.</p>';
  }

  return {
    cambiarAnio: cambiarAnio,
    cambiarMes: cambiarMes,
    cambiarAnioCal: cambiarAnioCal,
    irAMes: function(m) { _calMonth = parseInt(m); if (window.SICP_APP) SICP_APP.refresh(); },
    irAAnioCal: function(a) { _calYear = parseInt(a); if (window.SICP_APP) SICP_APP.refresh(); },

    render: function(db) {
      var metas = db.getMetas();
      var porAnio = {};
      metas.forEach(function(m) {
        if (m.fechaLimite) {
          var anio = new Date(m.fechaLimite).getFullYear();
          if (!porAnio[anio]) porAnio[anio] = [];
          porAnio[anio].push(m);
        } else {
          if (!porAnio['Sin fecha']) porAnio['Sin fecha'] = [];
          porAnio['Sin fecha'].push(m);
        }
      });

      var timelineHtml = '<div style="position:relative;padding-left:20px"><div style="position:absolute;left:8px;top:8px;bottom:8px;width:3px;background:#dbeafe;border-radius:99px"></div>';

      for (var i = 0; i < 4; i++) {
        var a = _startYear + i;
        var texto = PLAN_TEXTS[i];
        timelineHtml += '<div style="position:relative;margin-bottom:16px;padding:14px;background:var(--surface);border:1px solid var(--line);border-radius:12px"><div style="position:absolute;left:-18px;top:18px;width:12px;height:12px;background:' + (i === 0 ? 'var(--accent)' : 'var(--brand2)') + ';border-radius:50%;border:3px solid #e0f2fe"></div>' +
          '<div class="flex gap-8 items-center"><h4 style="color:' + (i === 0 ? 'var(--accent)' : 'var(--ink)') + '">' + a + '</h4>' +
          '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarAnio(' + (i === 0 ? '-1' : '0') + ')" title="Año base -1" ' + (i !== 0 ? 'style="display:none"' : '') + '>−</button>' +
          '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarAnio(' + (i === 0 ? '1' : '0') + ')" title="Año base +1" ' + (i !== 0 ? 'style="display:none"' : '') + '>+</button>' +
          '</div><p class="text-sm text-muted">' + texto + '</p>';
        if (porAnio[a]) {
          timelineHtml += '<div class="flex gap-8 mt-8" style="flex-wrap:wrap">' + porAnio[a].map(function(m) {
            var pillClass = m.estado === 'Completada' ? 'pill-ok' : m.estado === 'En proceso' ? 'pill-warn' : 'pill-info';
            return '<span class="pill ' + pillClass + '" title="' + escape(m.titulo) + '">' + escape(m.titulo.length > 30 ? m.titulo.slice(0, 30) + '...' : m.titulo) + ' (' + (m.avance || 0) + '%)</span>';
          }).join('') + '</div>';
        }
        timelineHtml += '</div>';
      }
      timelineHtml += '</div>';

      var headerLabel = '🗓️ Ruta recomendada ' + _startYear + '–' + (_startYear + 3) +
        ' <div class="flex gap-8 items-center" style="display:inline-flex;vertical-align:middle;margin-left:12px">' +
        '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarAnio(-4)" title="Atrasar 4 años">⏪</button>' +
        '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarAnio(-1)" title="Año anterior">◀</button>' +
        '<span class="text-sm font-bold">' + _startYear + '</span>' +
        '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarAnio(1)" title="Año siguiente">▶</button>' +
        '<button class="btn btn-sm" onclick="SICP.PlanModule.cambiarAnio(4)" title="Adelantar 4 años">⏩</button>' +
        '</div>';

      var routineRows = WEEKLY_ROUTINE.map(function(r) {
        return '<tr><td><strong>' + r.dia + '</strong></td><td>' + r.actividad + '</td><td>' + r.resultado + '</td></tr>';
      }).join('');

      var claveHtml = CLAVE_TIPS.map(function(tip, i) {
        return '<li style="margin-bottom:6px">' + (i + 1) + '. ' + tip + '</li>';
      }).join('');

      return '<div class="card"><div class="card-header"><h2>Plan de Carrera Científica</h2></div><p class="text-muted mb-16">Visualiza y planifica tu ruta hacia el SNII.</p></div>' +
        '<div class="card"><h3 class="mb-8">' + headerLabel + '</h3>' + timelineHtml + '</div>' +
        '<div class="grid grid-2 mb-16"><div class="card"><h3 class="mb-8">✅ Rutina semanal sugerida</h3>' +
          '<table style="font-size:.82rem"><tr><th>Día</th><th>Actividad</th><th>Resultado</th></tr>' +
          routineRows +
          '</table><div class="mt-16" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px"><strong style="color:#78350f">📌 Clave:</strong><ol class="text-sm mt-4" style="color:#78350f;padding-left:18px">' + claveHtml + '</ol></div></div>' +
          '<div class="card"><h3 class="mb-8">📅 Calendario de metas</h3>' + renderCalendario(metas) + '</div></div>';
    },

    afterRender: function() {}
  };
})();
