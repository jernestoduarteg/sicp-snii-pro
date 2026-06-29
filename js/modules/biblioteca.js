SICP.BibliotecaModule = (function() {
  var CHECK_KEY = 'snii_checklist_progress';
  var _filtro = '';
  var _catAbierta = null;

  function escape(s) { return SICP.utils.escapeHtml(s); }

  function getChecklistProgress() {
    try { return JSON.parse(localStorage.getItem(CHECK_KEY)) || {}; }
    catch(e) { return {}; }
  }

  function saveChecklistProgress(prog) {
    localStorage.setItem(CHECK_KEY, JSON.stringify(prog));
  }

  function toggleChecklistItem(catIdx, itemIdx) {
    var prog = getChecklistProgress();
    var key = catIdx + '-' + itemIdx;
    prog[key] = !prog[key];
    saveChecklistProgress(prog);
    if (window.SICP_APP) SICP_APP.refresh();
  }

  function getPersonalizedData(stats) {
    if (!stats) stats = SICP.db.calcularStats();
    var conf = SICP.db.getConfig ? SICP.db.getConfig() : {};
    var perfil = SICP.db.getProfile ? SICP.db.getProfile() : {};
    return {
      stats: stats,
      perfil: perfil,
      conf: conf,
      metas: SICP.db.getMetas(),
      productos: SICP.db.getProductos(),
      evidencias: SICP.db.getEvidencias()
    };
  }

  function getCategorias(stats) {
    var pd = getPersonalizedData(stats);
    var s = pd.stats;

    var categoriasBase = [
      {
        id: 'normativo',
        titulo: 'Marco normativo 2025-2026',
        icon: '📜',
        color: '#1e40af',
        breve: 'Reglamento SECIHTI, Lineamientos, Criterios, Anexos, Rizoma y Ápeiron.',
        nivel: 'esencial',
        items: [
          { titulo: 'Reglamento SNII (DOF 4 mar 2025)', tipo: 'lectura', desc: 'Estructura general y disposiciones del nuevo SNII bajo SECIHTI.' },
          { titulo: 'Lineamientos (DOF 6 feb 2026)', tipo: 'lectura', desc: 'Criterios operativos para la postulación y evaluación.' },
          { titulo: 'Criterios Específicos 2026', tipo: 'lectura', desc: 'Parámetros detallados por área, perfil y componente.' },
          { titulo: 'Anexos 1-4 (parámetros exactos)', tipo: 'lectura', desc: 'Tablas de puntuación, TRL, evidencias y ponderaciones.' },
          { titulo: 'Perfil Único de Rizoma', tipo: 'plataforma', desc: 'Sustituye al CVU. Registra toda tu producción académica.', url: 'https://rizoma.siicyt.gob.mx' },
          { titulo: 'Sistema Informático Ápeiron', tipo: 'plataforma', desc: 'Plataforma de postulación y seguimiento de solicitudes.', url: '#' }
        ],
        recomendacion: s ? (s.scoreSNII < 30 ? 'Prioriza conocer el marco normativo antes de registrar productos.' : 'Mantente al día con los lineamientos — se actualizan trimestralmente.') : ''
      },
      {
        id: 'produccion',
        titulo: 'C1: Producción de investigación',
        icon: '📄',
        color: '#2563eb',
        breve: 'Artículos, libros, capítulos. Corazón del Componente 1.',
        nivel: 'esencial',
        items: [
          { titulo: 'Artículos indizados (Scopus / WoS)', tipo: 'practica', desc: 'Se valora indexación, cuartil, autoría y continuidad temática.', contador: s ? s.articulos : 0, meta: pd.conf.metaArticulosAnual || 3 },
          { titulo: 'Libros con ISBN y dictamen', tipo: 'practica', desc: 'Arbitraje, comité editorial, ISBN y PDF. No confundir con capítulo.', contador: s ? s.libros : 0, meta: 2 },
          { titulo: 'Capítulos de libro arbitrados', tipo: 'practica', desc: 'Dictamen por pares, línea editorial definida.' },
          { titulo: 'Estructura IMRyD', tipo: 'tecnica', desc: 'Introducción, Métodos, Resultados y Discusión. Estándar internacional.' },
          { titulo: 'Indexación y cuartiles (JCR / SJR)', tipo: 'tecnica', desc: 'Verifica vigencia del cuartil en el año de publicación.' },
          { titulo: 'ORCID y Google Scholar actualizados', tipo: 'plataforma', desc: 'Visibilidad internacional de tu producción.' }
        ],
        recomendacion: s ? (s.componente1 < 40 ? 'Publica al menos ' + ((pd.conf.metaArticulosAnual || 3) - s.articulos) + ' artículo(s) más este año.' : 'Buen nivel C1. Asegura que cada artículo tenga su evidencia probatoria.') : ''
      },
      {
        id: 'innovacion',
        titulo: 'C1: Innovación y transferencia',
        icon: '💡',
        color: '#7c3aed',
        breve: 'Patentes, software, prototipos, transferencia tecnológica.',
        nivel: 'perfil',
        perfilRelevante: 'Desarrollo tecnológico e innovación',
        items: [
          { titulo: 'Clasificación TRL (Anexo 2)', tipo: 'tecnica', desc: 'Technology Readiness Level del 1 al 9. Identifica el TRL de tu desarrollo.', contador: s ? s.innovacion : 0, meta: pd.conf.metaInnovacionAnual || 1 },
          { titulo: 'Registro de propiedad intelectual', tipo: 'practica', desc: 'IMPI, derechos de autor, softwares. Documenta el número de registro.' },
          { titulo: 'Carta de implementación institucional', tipo: 'practica', desc: 'Documento oficial que acredite el uso real del desarrollo.' },
          { titulo: 'Validación con usuarios reales', tipo: 'practica', desc: 'Pruebas de campo, encuestas, datos de uso. Evidencia de adopción.' },
          { titulo: 'Publicación en repositorio abierto', tipo: 'practica', desc: 'Código, manual técnico, documentación en acceso abierto (C3).' }
        ],
        recomendacion: s ? (pd.perfil.perfilInvestigacion === 'Desarrollo tecnológico e innovación' && s.innovacion < 1 ? 'Tu perfil prioriza innovación. Registra al menos 1 desarrollo con TRL documentado.' : '') : ''
      },
      {
        id: 'liderazgo',
        titulo: 'C2: Fortalecimiento HCTI',
        icon: '🏛️',
        color: '#dc2626',
        breve: 'Comités, conferencias, proyectos interinstitucionales, premios.',
        nivel: 'importante',
        items: [
          { titulo: 'Conferencias magistrales', tipo: 'practica', desc: 'Imparte conferencias por invitación. Guarda constancia y programa.', contador: s ? s.congresos : 0, meta: 3 },
          { titulo: 'Comités académicos y editoriales', tipo: 'practica', desc: 'Participación en cuerpos colegiados, comités editoriales, revisión de pares.', contador: s ? s.liderazgo : 0, meta: pd.conf.metaLiderazgoAnual || 2 },
          { titulo: 'Proyectos interinstitucionales', tipo: 'practica', desc: 'Redes de colaboración con otras IES o centros de investigación.' },
          { titulo: 'Premios y distinciones', tipo: 'practica', desc: 'Cualquier reconocimiento a tu trayectoria o productos.' },
          { titulo: 'Estancias de investigación', tipo: 'practica', desc: 'Estancias nacionales e internacionales que fortalezcan redes.' }
        ],
        recomendacion: s ? (s.componente2 < 30 ? 'Fortalece tu liderazgo: busca comités, conferencias y proyectos colaborativos.' : 'Buen nivel C2. Documenta todas las constancias.') : ''
      },
      {
        id: 'formacion',
        titulo: 'C2: Formación de RRHH',
        icon: '🎓',
        color: '#d97706',
        breve: 'Tesis dirigidas, docencia, tutorías, codirección.',
        nivel: 'importante',
        items: [
          { titulo: 'Dirección de tesis tituladas', tipo: 'practica', desc: 'Tesis de licenciatura, maestría o doctorado. Acta de examen indispensable.', contador: s ? s.tesis : 0, meta: pd.conf.metaTesisAnual || 2 },
          { titulo: 'Docencia formal (licenciatura / posgrado)', tipo: 'practica', desc: 'Horas frente a grupo, programas de asignatura, constancias.', contador: s ? s.docencia : 0, meta: 2 },
          { titulo: 'Tutorías y codirección', tipo: 'practica', desc: 'Tutorías formales en programas de posgrado.' },
          { titulo: 'Jurado de examen profesional', tipo: 'practica', desc: 'Participación como sinodal en exámenes de grado.' },
          { titulo: 'Productos de docencia (material didáctico)', tipo: 'practica', desc: 'Antologías, guías, cuadernos de trabajo con ISBN.' }
        ],
        recomendacion: s ? (s.tesis < (pd.conf.metaTesisAnual || 2) ? 'Dirige ' + ((pd.conf.metaTesisAnual || 2) - s.tesis) + ' tesis más este año para fortalecer C2.' : '') : ''
      },
      {
        id: 'acceso',
        titulo: 'C3: Acceso universal al conocimiento',
        icon: '🌐',
        color: '#0f766e',
        breve: 'Divulgación, ciencia abierta, repositorios, materiales educativos.',
        nivel: 'importante',
        items: [
          { titulo: 'Depósito en repositorios abiertos', tipo: 'practica', desc: 'Versiones aceptadas en repositorios institucionales o temáticos.', contador: s ? s.divulgacion : 0, meta: 2 },
          { titulo: 'Divulgación científica documentada', tipo: 'practica', desc: 'Ferias, semanas de ciencia, talleres, entrevistas.' },
          { titulo: 'Materiales educativos abiertos', tipo: 'practica', desc: 'Videos, infografías, podcasts, cursos MOOC.' },
          { titulo: 'Métricas de alcance público', tipo: 'tecnica', desc: 'Descargas, visitas, citas en medios no académicos, altmetrics.' },
          { titulo: 'Redes sociales académicas', tipo: 'plataforma', desc: 'ResearchGate, Academia.edu, Google Scholar. Mide tu alcance.' }
        ],
        recomendacion: s ? (s.componente3 < 20 ? 'Todo producto debe estar en acceso abierto. Sube tus publicaciones a repositorios.' : 'Buen C3. Sigue divulgando y registra métricas de alcance.') : ''
      },
      {
        id: 'perfiles',
        titulo: 'Perfiles SNII 2026',
        icon: '🎯',
        color: '#0891b2',
        breve: '4 perfiles: ciencia básica, desarrollo tecnológico, problemas nacionales, interdisciplinaria.',
        nivel: 'esencial',
        items: [
          { titulo: 'Ciencia básica y de frontera', tipo: 'perfil', desc: 'Generación de conocimiento fundamental. Prioriza artículos Q1-Q2, libros arbitrados y redes internacionales.' },
          { titulo: 'Desarrollo tecnológico e innovación', tipo: 'perfil', desc: 'Tecnología, patentes, software, transferencia. Prioriza TRL, propiedad intelectual e implementación.' },
          { titulo: 'Atención a problemas nacionales', tipo: 'perfil', desc: 'Investigación aplicada a prioridades del país. Impacto social, vinculación comunitaria, informes.' },
          { titulo: 'Interdisciplinaria', tipo: 'perfil', desc: 'Integra múltiples disciplinas. Colaboración multi-área, marcos híbridos, metodologías mixtas.' }
        ],
        recomendacion: pd.perfil.perfilInvestigacion ? 'Tu perfil actual: ' + pd.perfil.perfilInvestigacion + '. Alinea tus productos y evidencias a este perfil.' : 'Selecciona tu perfil en Configuración para recibir recomendaciones personalizadas.'
      },
      {
        id: 'productividad',
        titulo: 'Productividad y flujo de trabajo',
        icon: '⚡',
        color: '#059669',
        breve: 'Herramientas digitales, organización, automatización.',
        nivel: 'optativo',
        items: [
          { titulo: 'Zotero / Mendeley (gestión bibliográfica)', tipo: 'herramienta', desc: 'Organiza referencias, genera citas, conecta con procesadores de texto.' },
          { titulo: 'Overleaf / LaTeX', tipo: 'herramienta', desc: 'Redacción científica colaborativa con formato profesional.' },
          { titulo: 'Notion / Obsidian (conocimiento conectado)', tipo: 'herramienta', desc: 'Base de conocimiento personal con grafos y vincuulación de ideas.' },
          { titulo: 'Perfil Único de Rizoma', tipo: 'plataforma', desc: 'Sustituye al CVU. Actualiza mensualmente tu producción.' },
          { titulo: 'Sistema Ápeiron', tipo: 'plataforma', desc: 'Plataforma de postulación. Familiarízate antes de la convocatoria.' }
        ],
        recomendacion: 'Actualiza ORCID, Scholar y Rizoma mensualmente. Una hora a la semana basta.'
      },
      {
        id: 'postulacion',
        titulo: 'Postulación SECIHTI',
        icon: '📋',
        color: '#be123c',
        breve: 'Proceso completo de postulación al SNII 2026.',
        nivel: 'esencial',
        items: [
          { titulo: 'Auditar evidencias probatorias', tipo: 'practica', desc: 'Cada producto necesita su evidencia. Revisa Anexo 4.' },
          { titulo: 'Cerrar brechas según Anexos 1-4', tipo: 'practica', desc: 'Identifica tus brechas en el Dashboard y trabaja en ellas.' },
          { titulo: 'Preparar narrativa académica', tipo: 'practica', desc: 'Redacta una síntesis convincente de tu trayectoria y aportaciones.' },
          { titulo: 'Calendario de postulación', tipo: 'practica', desc: 'La convocatoria suele abrir en el 2T. Prepárate con 6 meses de anticipación.' },
          { titulo: 'Carta de adscripción y aval institucional', tipo: 'documento', desc: 'Solicítala con al menos 2 meses de anticipación.' }
        ],
        recomendacion: s ? (s.scoreSNII < 50 ? 'Aún no estás listo para postular. Usa el Simulador SNII para proyectar tu score.' : 'Tu score SNII es competitivo. Prepara tu postulación en Ápeiron.') : ''
      },
      {
        id: 'fuentes',
        titulo: 'Fuentes oficiales y consulta',
        icon: '🔗',
        color: '#4f46e5',
        breve: 'Enlaces directos a documentos DOF, plataformas y recursos.',
        nivel: 'optativo',
        items: [
          { titulo: 'Reglamento SNII (DOF 4 mar 2025)', tipo: 'enlace', desc: 'Fundamento legal del SNII bajo SECIHTI.', url: 'https://www.dof.gob.mx' },
          { titulo: 'Lineamientos SNII (DOF 6 feb 2026)', tipo: 'enlace', desc: 'Lineamientos específicos de operación.', url: 'https://www.dof.gob.mx' },
          { titulo: 'Criterios Específicos 2026', tipo: 'enlace', desc: 'Parámetros detallados por área y perfil.' },
          { titulo: 'Portal SECIHTI', tipo: 'enlace', desc: 'Sitio oficial de la Secretaría.', url: 'https://www.secihti.gob.mx' },
          { titulo: 'Perfil Único de Rizoma', tipo: 'enlace', desc: 'Registro y actualización de producción.', url: '#' },
          { titulo: 'Sistema Ápeiron', tipo: 'enlace', desc: 'Postulación y seguimiento.', url: '#' }
        ],
        recomendacion: 'Mantén estos enlaces accesibles. Los Lineamientos se actualizan periódicamente.'
      }
    ];

    var perfilActual = pd.perfil.perfilInvestigacion || '';
    if (perfilActual) {
      categoriasBase = categoriasBase.map(function(cat) {
        if (cat.perfilRelevante && cat.perfilRelevante !== perfilActual) {
          cat.nivel = 'optativo';
        }
        return cat;
      });
    }

    return categoriasBase;
  }

  function renderCategoria(cat, catIdx, catAbierta, progress, stats) {
    var abierta = catAbierta === cat.id;
    var itemsOk = 0;
    var itemsTotal = 0;
    cat.items.forEach(function(item, itemIdx) {
      if (item.contador !== undefined && item.meta !== undefined) {
        itemsTotal++;
        if (item.contador >= item.meta) itemsOk++;
      }
    });
    var pct = itemsTotal > 0 ? Math.round(itemsOk / itemsTotal * 100) : -1;

    var nivelLabel = { esencial: '🔵 Esencial', importante: '🟠 Importante', optativo: '⚪ Optativo', perfil: '🎯 Por perfil' }[cat.nivel] || '';
    var badgeColor = { esencial: 'var(--accent)', importante: 'var(--warn)', optativo: 'var(--muted)', perfil: '#7c3aed' }[cat.nivel] || '';

    return '<div class="card knowledge-cat" style="border-left:4px solid ' + cat.color + '">' +
      '<div style="cursor:pointer" onclick="SICP.BibliotecaModule.toggleCategoria(\'' + cat.id + '\')">' +
        '<div class="flex-between">' +
          '<h3 style="display:flex;align-items:center;gap:8px"><span>' + cat.icon + '</span><span>' + cat.titulo + '</span></h3>' +
          '<div class="flex gap-8 items-center">' +
            '<span style="font-size:.7rem;padding:2px 8px;border-radius:99px;background:' + badgeColor + '20;color:' + badgeColor + ';font-weight:600">' + nivelLabel + '</span>' +
            (pct >= 0 ? '<span style="font-size:.78rem;font-weight:600;color:' + (pct >= 80 ? 'var(--ok)' : pct >= 50 ? 'var(--warn)' : 'var(--danger)') + '">' + itemsOk + '/' + itemsTotal + '</span>' : '') +
            '<span class="text-muted" style="font-size:1.1rem;transition:transform .2s' + (abierta ? ';transform:rotate(180deg)' : '') + '">▼</span>' +
          '</div>' +
        '</div>' +
        '<p class="text-sm text-muted mt-4">' + cat.breve + '</p>' +
        (pct >= 0 && pct < 100 ? '<div class="progress-bar mt-8" style="height:4px;max-width:200px"><div class="progress-fill" style="width:' + pct + '%;background:' + cat.color + '"></div></div>' : '') +
      '</div>' +
      (abierta ? renderContenidoCategoria(cat, catIdx, progress, stats) : '') +
      '</div>';
  }

  function renderContenidoCategoria(cat, catIdx, progress, stats) {
    var html = '<div class="mt-12" style="border-top:1px solid var(--line);padding-top:12px">';

    cat.items.forEach(function(item, itemIdx) {
      var key = catIdx + '-' + itemIdx;
      var checked = progress[key];
      var tipoIcon = { lectura: '📖', practica: '✍️', tecnica: '🔬', plataforma: '💻', perfil: '🎯', herramienta: '🛠️', documento: '📝', enlace: '🔗' }[item.tipo] || '📌';

      html += '<div class="knowledge-item" style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line)">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="SICP.BibliotecaModule.toggleChecklistItem(' + catIdx + ',' + itemIdx + ')" style="margin-top:3px;cursor:pointer">' +
        '<div style="flex:1">' +
          '<div class="flex gap-8 items-center"><span title="' + item.tipo + '">' + tipoIcon + '</span><strong style="' + (checked ? 'text-decoration:line-through;opacity:.5' : '') + '">' + item.titulo + '</strong></div>' +
          '<p class="text-sm text-muted mt-2">' + item.desc + '</p>';

      if (item.tipo === 'enlace' && item.url) {
        html += '<a href="' + item.url + '" target="_blank" class="text-sm" style="color:var(--accent);margin-top:4px;display:inline-block">→ Abrir enlace</a>';
      }

      if (item.contador !== undefined && item.meta !== undefined) {
        var metaPct = Math.min(Math.round(item.contador / item.meta * 100), 100);
        var colorMeta = metaPct >= 100 ? 'var(--ok)' : metaPct >= 50 ? 'var(--warn)' : 'var(--danger)';
        html += '<div class="flex gap-8 items-center mt-4"><span class="text-sm" style="font-weight:600;color:' + colorMeta + '">' + item.contador + ' / ' + item.meta + '</span>' +
          '<div class="progress-bar" style="height:4px;flex:1;max-width:120px"><div class="progress-fill" style="width:' + metaPct + '%;background:' + colorMeta + '"></div></div>' +
          '<span class="text-sm" style="color:' + colorMeta + '">' + (metaPct >= 100 ? '✅' : metaPct >= 50 ? '⚠️' : '❌') + '</span></div>';
        if (metaPct < 100) {
          var resto = item.meta - item.contador;
          html += '<p class="text-sm mt-2" style="color:var(--muted);font-style:italic">Te faltan ' + resto + ' para cumplir la meta.</p>';
        }
      }

      html += '</div></div>';
    });

    if (cat.recomendacion) {
      html += '<div class="mt-12 p-12" style="background:#f0fdf4;border-radius:8px;border-left:3px solid var(--ok)">' +
        '<span class="text-sm font-bold" style="color:var(--ok)">💡 Recomendación personalizada</span>' +
        '<p class="text-sm mt-4">' + cat.recomendacion + '</p></div>';
    }

    html += '</div>';
    return html;
  }

  function renderGeneralChecklist(stats) {
    if (!stats) return '';
    var s = stats;
    var items = [
      { label: 'Perfil de investigación definido', check: !!SICP.db.getProfile().perfilInvestigacion },
      { label: 'Área SNII seleccionada', check: !!SICP.db.getProfile().area },
      { label: 'ORCID registrado', check: !!SICP.db.getProfile().orcid },
      { label: 'Google Scholar activo', check: !!SICP.db.getProfile().scholar },
      { label: 'Al menos 1 meta registrada', check: s.totalMetas > 0 },
      { label: 'Al menos 3 productos registrados', check: s.totalProductos >= 3 },
      { label: 'Al menos 1 evidencia probatoria', check: s.totalEvidencias > 0 },
      { label: 'Avance general ≥ 50 %', check: s.avanceGeneral >= 50 },
      { label: 'Score SNII ≥ 40 (mínimo competitivo)', check: s.scoreSNII >= 40 },
      { label: 'Sin brechas críticas detectadas', check: s.brechas.length === 0 }
    ];
    var completados = items.filter(function(i) { return i.check; }).length;
    var total = items.length;
    var pct = Math.round(completados / total * 100);

    return '<div class="card"><h3 class="mb-8">📋 Checklist general SNII 2026</h3>' +
      '<div class="flex gap-8 items-center mb-8"><div class="progress-bar" style="flex:1;height:8px"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
      '<span style="font-weight:700;font-size:1.1rem">' + completados + '/' + total + '</span></div>' +
      '<div class="grid grid-2" style="font-size:.82rem">' +
      items.map(function(item) {
        return '<div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="color:' + (item.check ? 'var(--ok)' : 'var(--muted)') + '">' + (item.check ? '✅' : '⬜') + '</span>' + item.label + '</div>';
      }).join('') +
      '</div></div>';
  }

  return {
    toggleCategoria: function(id) {
      _catAbierta = (_catAbierta === id) ? null : id;
      if (window.SICP_APP) SICP_APP.refresh();
    },

    toggleChecklistItem: toggleChecklistItem,

    cambiarFiltro: function(val) {
      _filtro = val.toLowerCase();
      if (window.SICP_APP) SICP_APP.refresh();
    },

    render: function() {
      var stats = SICP.db.calcularStats();
      var categorias = getCategorias(stats);
      var progress = getChecklistProgress();
      var perfil = SICP.db.getProfile();

      var filtered = categorias;
      if (_filtro) {
        filtered = categorias.filter(function(c) {
          return c.titulo.toLowerCase().indexOf(_filtro) !== -1 ||
                 c.breve.toLowerCase().indexOf(_filtro) !== -1 ||
                 c.items.some(function(i) { return i.titulo.toLowerCase().indexOf(_filtro) !== -1; });
        });
      }

      var totalItems = 0, completados = 0;
      categorias.forEach(function(cat, ci) {
        cat.items.forEach(function(item, ii) {
          totalItems++;
          if (progress[ci + '-' + ii]) completados++;
        });
      });
      var progresoGeneral = totalItems > 0 ? Math.round(completados / totalItems * 100) : 0;

      var essentialsCount = categorias.filter(function(c) { return c.nivel === 'esencial' && c.items.some(function(item, idx) { return !progress[categorias.indexOf(c) + '-' + idx]; }); }).length;

      return '<div class="card"><div class="card-header"><h2>Biblioteca de Conocimiento SNII</h2></div>' +
        '<p class="text-muted mb-16">Domina cada criterio del SNII 2026. Marca los ítems que domines y sigue las recomendaciones personalizadas según tus datos.</p></div>' +

        '<div class="grid grid-3 mb-16">' +
          '<div class="card kpi-card"><span class="kpi-label">🧠 Progreso de conocimiento</span><span class="kpi-value" style="color:' + (progresoGeneral >= 80 ? 'var(--ok)' : progresoGeneral >= 40 ? 'var(--warn)' : 'var(--danger)') + '">' + completados + '/' + totalItems + '</span><span class="text-sm text-muted">ítems dominados</span></div>' +
          '<div class="card kpi-card"><span class="kpi-label">📊 Score SNII actual</span><span class="kpi-value" style="color:' + (stats.scoreSNII >= 70 ? 'var(--ok)' : stats.scoreSNII >= 40 ? 'var(--warn)' : 'var(--danger)') + '">' + stats.scoreSNII + '%</span><span class="text-sm text-muted">' + (stats.scoreSNII >= 70 ? 'Competitivo' : stats.scoreSNII >= 40 ? 'En desarrollo' : 'Requiere atención') + '</span></div>' +
          '<div class="card kpi-card"><span class="kpi-label">📌 Pendientes esenciales</span><span class="kpi-value" style="color:' + (essentialsCount === 0 ? 'var(--ok)' : 'var(--warn)') + '">' + essentialsCount + '</span><span class="text-sm text-muted">categorías con ítems sin marcar</span></div>' +
        '</div>' +

        '<div class="card mb-16"><div class="flex gap-8 items-center" style="padding:8px 0">' +
          '<span>🔍</span><input class="form-control" id="biblioteca-search" placeholder="Buscar en la biblioteca…" value="' + escape(_filtro) + '" oninput="SICP.BibliotecaModule.cambiarFiltro(this.value)" style="flex:1">' +
          '<span class="text-sm text-muted">' + filtered.length + ' categorías</span>' +
        '</div></div>' +

        '<div class="grid-2 grid mb-16">' + filtered.map(function(cat, i) { return renderCategoria(cat, i, _catAbierta, progress, stats); }).join('') + '</div>' +

        renderGeneralChecklist(stats) +

        '<div class="card mt-16"><h3 class="mb-8">🧭 Tu ruta de aprendizaje</h3>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
            (essentialsCount > 0 ?
              '<span class="pill pill-warn">Comienza por las categorías esenciales con pendientes (' + essentialsCount + ')</span>' :
              '<span class="pill pill-ok">✅ Dominaste todas las categorías esenciales</span>') +
            (stats.scoreSNII < 40 ? '<span class="pill pill-danger">Mejora tu score SNII (>40)</span>' : '<span class="pill pill-ok">Score SNII competitivo</span>') +
            (stats.brechas.length > 0 ? '<span class="pill pill-warn">Cierra ' + stats.brechas.length + ' brecha(s) detectadas</span>' : '<span class="pill pill-ok">Sin brechas críticas</span>') +
            (!perfil.perfilInvestigacion ? '<span class="pill pill-warn">Define tu perfil en Configuración</span>' : '<span class="pill pill-ok">Perfil definido: ' + perfil.perfilInvestigacion + '</span>') +
          '</div></div>';
    },

    afterRender: function() {
      if (_filtro) {
        var input = document.getElementById('biblioteca-search');
        if (input) {
          input.value = _filtro;
          var len = _filtro.length;
          input.setSelectionRange(len, len);
          input.focus();
        }
      }
    }
  };
})();
