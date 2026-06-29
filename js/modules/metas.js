SICP.MetasModule = (function() {
  function escape(s) { return SICP.utils.escapeHtml(s); }

  return {
    render: function(db) {
      var metas = db.getMetas();
      return '<div class="card"><div class="card-header"><h2>Metas estratégicas</h2><button class="btn btn-primary" onclick="SICP.MetasModule.nuevaMeta()">+ Nueva meta</button></div></div>' +
        '<div class="card">' +
          '<div class="filters-bar"><select class="form-control" id="meta-filtro" onchange="SICP.MetasModule.renderizar()"><option value="todas">Todas</option><option value="completada">Completadas</option><option value="proceso">En proceso</option><option value="pendiente">Pendientes</option></select></div>' +
          '<div id="metas-container">' + SICP.MetasModule._renderLista(metas) + '</div>' +
        '</div>';
    },

    _renderLista: function(metas) {
      if (metas.length === 0) return '<div class="empty-state"><div class="icon">🎯</div><p><strong>Sin metas registradas</strong></p><p class="text-sm">Agrega metas estratégicas para planificar tu carrera científica.</p></div>';
      return '<div class="table-wrap"><table><tr><th>Meta</th><th>Prioridad</th><th>Estado</th><th>Avance</th><th>Acciones</th></tr>' +
        metas.map(function(m) {
          var prioridadClass = { Crítica: 'danger', Alta: 'warn', Media: 'info', Baja: '' }[m.prioridad] || '';
          var estadoClass = { Completada: 'ok', 'En proceso': 'warn', 'No iniciada': 'info' }[m.estado] || '';
          return '<tr>' +
            '<td><strong>' + escape(m.titulo) + '</strong><br><span class="text-sm text-muted">' + escape(m.descripcion || m.categoria || '') + '</span></td>' +
            '<td><span class="pill pill-' + prioridadClass + '">' + escape(m.prioridad || 'Media') + '</span></td>' +
            '<td><span class="pill pill-' + estadoClass + '">' + escape(m.estado || 'No iniciada') + '</span></td>' +
            '<td><div class="progress-bar" style="width:60px;height:6px"><div class="progress-fill" style="width:' + (m.avance || 0) + '%"></div></div><span class="text-sm">' + (m.avance || 0) + '%</span></td>' +
            '<td><button class="btn btn-sm" onclick="SICP.MetasModule.editarMeta(\'' + m.id + '\')">✏️</button> <button class="btn btn-sm btn-danger" onclick="SICP.MetasModule.eliminarMeta(\'' + m.id + '\')">🗑️</button></td>' +
            '</tr>';
        }).join('') + '</table></div>';
    },

    renderizar: function() {
      var filtro = document.getElementById('meta-filtro');
      filtro = filtro ? filtro.value : 'todas';
      var container = document.getElementById('metas-container');
      if (!container) return;
      var metas = SICP.db.getMetas();
      if (filtro === 'completada') metas = metas.filter(function(m) { return m.estado === 'Completada'; });
      if (filtro === 'proceso') metas = metas.filter(function(m) { return m.estado === 'En proceso'; });
      if (filtro === 'pendiente') metas = metas.filter(function(m) { return m.estado !== 'Completada'; });
      container.innerHTML = SICP.MetasModule._renderLista(metas);
    },

    nuevaMeta: function() {
      SICP.modal.showModal('Nueva meta', '<form id="meta-form" onsubmit="SICP.MetasModule.guardarMeta(event)">' +
        '<div class="form-group"><label>Título</label><input class="form-control" name="titulo" required placeholder="Ej: Publicar 3 artículos Q1"></div>' +
        '<div class="form-group"><label>Descripción</label><textarea class="form-control" name="descripcion" rows="2"></textarea></div>' +
        '<div class="form-group"><label>Categoría</label><select class="form-control" name="categoria">' + SICP.CONSTANTES.CATEGORIAS_META.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-row"><div class="form-group"><label>Prioridad</label><select class="form-control" name="prioridad">' + SICP.CONSTANTES.PRIORIDADES.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-group"><label>Estado</label><select class="form-control" name="estado">' + SICP.CONSTANTES.ESTADOS_META.map(function(e) { return '<option value="' + e + '">' + e + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Fecha inicio</label><input class="form-control" type="date" name="fechaInicio"></div>' +
        '<div class="form-group"><label>Fecha límite</label><input class="form-control" type="date" name="fechaLimite"></div></div>' +
        '<div class="form-group"><label>Avance (%)</label><input class="form-control" type="number" name="avance" min="0" max="100" value="0"></div>' +
        '<button type="submit" class="btn btn-primary">Guardar meta</button></form>');
    },

    guardarMeta: function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var meta = {};
      fd.forEach(function(v, k) { meta[k] = v; });
      meta.avance = parseInt(meta.avance) || 0;
      SICP.db.addMeta(meta);
      SICP.modal.closeModal();
      SICP.toast.showToast('Meta registrada', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    },

    editarMeta: function(id) {
      var metas = SICP.db.getMetas();
      var m = metas.find(function(x) { return x.id === id; });
      if (!m) return;
      window.__metaEditId = id;
      SICP.modal.showModal('Editar meta', '<form id="meta-form" onsubmit="SICP.MetasModule.actualizarMeta(event)">' +
        '<div class="form-group"><label>Título</label><input class="form-control" name="titulo" value="' + escape(m.titulo) + '" required></div>' +
        '<div class="form-group"><label>Estado</label><select class="form-control" name="estado">' + SICP.CONSTANTES.ESTADOS_META.map(function(e) { return '<option value="' + e + '"' + (m.estado === e ? ' selected' : '') + '>' + e + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-group"><label>Avance (%)</label><input class="form-control" type="number" name="avance" min="0" max="100" value="' + (m.avance || 0) + '"></div>' +
        '<div class="form-group"><label>Notas</label><textarea class="form-control" name="notas" rows="2">' + escape(m.notas || '') + '</textarea></div>' +
        '<button type="submit" class="btn btn-primary">Actualizar</button></form>');
    },

    actualizarMeta: function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var cambios = {};
      fd.forEach(function(v, k) { cambios[k] = v; });
      cambios.avance = parseInt(cambios.avance) || 0;
      SICP.db.updateMeta(window.__metaEditId, cambios);
      SICP.modal.closeModal();
      SICP.toast.showToast('Meta actualizada', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    },

    eliminarMeta: function(id) {
      SICP.toast.showConfirm('Eliminar meta', '¿Seguro?').then(function(ok) {
        if (ok) { SICP.db.deleteMeta(id); SICP.toast.showToast('Meta eliminada', 'info'); if (window.SICP_APP) SICP_APP.refresh(); }
      });
    },

    afterRender: function() {}
  };
})();
