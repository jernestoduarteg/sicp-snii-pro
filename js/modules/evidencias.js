SICP.EvidenciasModule = (function() {
  function escape(s) { return SICP.utils.escapeHtml(s); }
  function dotClass(estado) { return { Completa: 'completa', Incompleta: 'incompleta', Pendiente: 'faltante' }[estado] || 'faltante'; }

  return {
    render: function(db) {
      var evidencias = db.getEvidencias();
      var productos = db.getProductos();
      var total = evidencias.length;
      var completas = evidencias.filter(function(e) { return e.estado === 'Completa'; }).length;
      var pendientes = evidencias.filter(function(e) { return e.estado === 'Pendiente' || e.estado === 'Incompleta'; }).length;

      return '<div class="card"><div class="card-header"><h2>Evidencias probatorias</h2><button class="btn btn-primary" onclick="SICP.EvidenciasModule.nuevaEvidencia()">+ Nueva evidencia</button></div>' +
        '<p class="text-muted mb-16">Las evidencias probatorias son el respaldo documental de cada producto. El Anexo 3 detalla los requisitos.</p>' +
        '<div class="grid grid-4 mb-16">' +
          '<div class="card kpi-card" style="padding:12px"><span class="kpi-label">Total</span><span class="kpi-value">' + total + '</span></div>' +
          '<div class="card kpi-card" style="padding:12px"><span class="kpi-label">Completas</span><span class="kpi-value" style="color:var(--ok)">' + completas + '</span></div>' +
          '<div class="card kpi-card" style="padding:12px"><span class="kpi-label">Pendientes</span><span class="kpi-value" style="color:var(--warn)">' + pendientes + '</span></div>' +
          '<div class="card kpi-card" style="padding:12px"><span class="kpi-label">Avance</span><span class="kpi-value">' + (total > 0 ? Math.round(completas / total * 100) : 0) + '%</span></div>' +
        '</div></div>' +
        '<div class="card"><div class="filters-bar"><select class="form-control" id="evidencia-filtro" onchange="SICP.EvidenciasModule.renderizar()"><option value="todas">Todas</option><option value="completa">Completas</option><option value="pendiente">Pendientes</option></select></div>' +
        '<div id="evidencias-container">' + SICP.EvidenciasModule._renderLista(evidencias, productos) + '</div></div>';
    },

    _renderLista: function(evidencias, productos) {
      if (evidencias.length === 0) return '<div class="empty-state"><div class="icon">🔍</div><p><strong>Sin evidencias registradas</strong></p><p class="text-sm">Agrega evidencias probatorias para respaldar tus productos académicos.</p></div>';
      return '<div class="table-wrap"><table><tr><th>Evidencia</th><th>Producto</th><th>Estado</th><th>Archivo</th><th>Acciones</th></tr>' +
        evidencias.map(function(e) {
          var prod = productos.find(function(p) { return p.id === e.producto_id || p.id === e.productoId; });
          return '<tr>' +
            '<td><strong>' + escape(e.nombre) + '</strong><br><span class="text-sm text-muted">' + escape(e.detalle || '') + '</span></td>' +
            '<td class="text-sm">' + (prod ? escape(prod.titulo) : '—') + '</td>' +
            '<td><div class="evidencia-status"><span class="evidencia-dot ' + dotClass(e.estado) + '"></span><span>' + (e.estado || 'Pendiente') + '</span></div></td>' +
            '<td>' + (e.url ? (e.url.startsWith('data:') ? '<span class="pill pill-ok">Archivo local</span>' : '<a href="' + escape(e.url) + '" target="_blank" class="text-sm">Ver</a>') : '—') + '</td>' +
            '<td><button class="btn btn-sm" onclick="SICP.EvidenciasModule.editarEvidencia(\'' + e.id + '\')">✏️</button> <button class="btn btn-sm btn-danger" onclick="SICP.EvidenciasModule.eliminarEvidencia(\'' + e.id + '\')">🗑️</button></td>' +
            '</tr>';
        }).join('') + '</table></div>';
    },

    renderizar: function() {
      var filtro = document.getElementById('evidencia-filtro');
      filtro = filtro ? filtro.value : 'todas';
      var container = document.getElementById('evidencias-container');
      if (!container) return;
      var evidencias = SICP.db.getEvidencias();
      var productos = SICP.db.getProductos();
      if (filtro === 'completa') evidencias = evidencias.filter(function(e) { return e.estado === 'Completa'; });
      if (filtro === 'pendiente') evidencias = evidencias.filter(function(e) { return e.estado !== 'Completa'; });
      container.innerHTML = SICP.EvidenciasModule._renderLista(evidencias, productos);
    },

    nuevaEvidencia: function() {
      var productos = SICP.db.getProductos();
      SICP.modal.showModal('Nueva evidencia', '<form id="evidencia-form" onsubmit="SICP.EvidenciasModule.guardarEvidencia(event)">' +
        '<div class="form-group"><label>Nombre</label><input class="form-control" name="nombre" required placeholder="PDF del artículo, carta de aceptación"></div>' +
        '<div class="form-group"><label>Producto</label><select class="form-control" name="productoId"><option value="">Sin producto</option>' + productos.map(function(p) { return '<option value="' + p.id + '">' + escape(p.titulo) + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-group"><label>Archivo</label><input class="form-control" type="file" name="archivo" accept=".pdf,.doc,.docx,.jpg,.png,.zip"></div>' +
        '<div class="form-group"><label>O URL</label><input class="form-control" name="url" placeholder="https://..."></div>' +
        '<div class="form-group"><label>Detalle</label><textarea class="form-control" name="detalle" rows="2"></textarea></div>' +
        '<div class="form-group"><label>Estado</label><select class="form-control" name="estado">' + SICP.CONSTANTES.ESTADOS_EVIDENCIA.map(function(e) { return '<option value="' + e + '">' + e + '</option>'; }).join('') + '</select></div>' +
        '<button type="submit" class="btn btn-primary">Guardar</button></form>');
    },

    guardarEvidencia: function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var archivo = fd.get('archivo');
      var ev = { productoId: fd.get('productoId') || null, nombre: fd.get('nombre'), estado: fd.get('estado') || 'Pendiente', url: fd.get('url') || '', detalle: fd.get('detalle') };
      if (archivo && archivo.size > 0) {
        SICP.db.uploadFile(archivo).then(function(url) {
          ev.url = url;
          SICP.db.addEvidencia(ev);
          SICP.modal.closeModal();
          SICP.toast.showToast('Evidencia registrada', 'success');
          if (window.SICP_APP) SICP_APP.refresh();
        });
      } else {
        SICP.db.addEvidencia(ev);
        SICP.modal.closeModal();
        SICP.toast.showToast('Evidencia registrada', 'success');
        if (window.SICP_APP) SICP_APP.refresh();
      }
    },

    editarEvidencia: function(id) {
      var evidencias = SICP.db.getEvidencias();
      var e = evidencias.find(function(x) { return x.id === id; });
      if (!e) return;
      window.__evidenciaEditId = id;
      SICP.modal.showModal('Editar evidencia', '<form id="evidencia-form" onsubmit="SICP.EvidenciasModule.actualizarEvidencia(event)">' +
        '<div class="form-group"><label>Nombre</label><input class="form-control" name="nombre" value="' + escape(e.nombre) + '" required></div>' +
        '<div class="form-group"><label>Estado</label><select class="form-control" name="estado">' + SICP.CONSTANTES.ESTADOS_EVIDENCIA.map(function(s) { return '<option value="' + s + '"' + (e.estado === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-group"><label>URL</label><input class="form-control" name="url" value="' + escape(e.url || '') + '"></div>' +
        '<div class="form-group"><label>Detalle</label><textarea class="form-control" name="detalle" rows="2">' + escape(e.detalle || '') + '</textarea></div>' +
        '<button type="submit" class="btn btn-primary">Actualizar</button></form>');
    },

    actualizarEvidencia: function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var cambios = {};
      fd.forEach(function(v, k) { cambios[k] = v; });
      SICP.db.updateEvidencia(window.__evidenciaEditId, cambios);
      SICP.modal.closeModal();
      SICP.toast.showToast('Evidencia actualizada', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    },

    eliminarEvidencia: function(id) {
      SICP.toast.showConfirm('Eliminar evidencia', '¿Seguro?').then(function(ok) {
        if (ok) { SICP.db.deleteEvidencia(id); SICP.toast.showToast('Evidencia eliminada', 'info'); if (window.SICP_APP) SICP_APP.refresh(); }
      });
    },

    afterRender: function() {}
  };
})();
