SICP.ProductosModule = (function() {
  function escape(s) { return SICP.utils.escapeHtml(s); }

  return {
    render: function(db) {
      var productos = db.getProductos();
      return '<div class="card"><div class="card-header"><h2>Productos académicos</h2><button class="btn btn-primary" onclick="SICP.ProductosModule.nuevoProducto()">+ Nuevo producto</button></div></div>' +
        '<div class="card">' +
          '<div class="filters-bar">' +
            '<input class="form-control" id="prod-buscar" placeholder="Buscar..." style="max-width:200px" oninput="SICP.ProductosModule.renderizar()">' +
            '<select class="form-control" id="prod-filtro" onchange="SICP.ProductosModule.renderizar()"><option value="todas">Todos</option><option value="C1">C1: Producción</option><option value="C2">C2: Comunidad HCTI</option><option value="C3">C3: Acceso universal</option></select>' +
            '<select class="form-control" id="import-select" style="width:auto;max-width:200px" onchange="SICP.ProductosModule._onImportSelect(this)">' +
              '<option value="">📥 Importar...</option>' +
              '<option value="doi">🔗 DOI</option>' +
              '<option value="isbn">📖 ISBN</option>' +
              '<option value="titulo">🔍 Por título</option>' +
              '<option value="orcid">🆔 ORCID</option>' +
              '<option value="masiva">📋 Masiva (texto)</option>' +
              '<option value="csv">📄 Desde CSV</option>' +
            '</select>' +
            '<button class="btn btn-sm" onclick="SICP.ProductosModule.exportarCSV()" title="Exportar como CSV">📤 CSV</button>' +
          '</div>' +
          '<div id="productos-container">' + SICP.ProductosModule._renderLista(productos) + '</div>' +
        '</div>';
    },

    _renderLista: function(productos) {
      if (productos.length === 0) return '<div class="empty-state"><div class="icon">📄</div><p><strong>Sin productos registrados</strong></p><p class="text-sm">Agrega tus publicaciones, tesis dirigidas, proyectos y más.</p></div>';
      return '<div class="table-wrap"><table><tr><th>Producto</th><th>Tipo</th><th>Componente</th><th>Año</th><th>Acciones</th></tr>' +
        productos.map(function(p) {
          var comp = SICP.getComponenteDeProducto(p.tipo);
          var compColor = { C1: '#2563eb', C2: '#d97706', C3: '#16a34a' }[comp] || '#6b7280';
          return '<tr>' +
            '<td><strong>' + escape(p.titulo) + '</strong><br><span class="text-sm text-muted">' + (p.autores ? escape(p.autores) : '') + '</span></td>' +
            '<td><span class="text-sm">' + escape(p.tipo) + '</span></td>' +
            '<td><span class="pill" style="background:' + compColor + '20;color:' + compColor + ';border:1px solid ' + compColor + '40">' + comp + '</span></td>' +
            '<td>' + (p.anno || '-') + '</td>' +
            '<td><button class="btn btn-sm" onclick="SICP.ProductosModule.editarProducto(\'' + p.id + '\')">✏️</button> <button class="btn btn-sm btn-danger" onclick="SICP.ProductosModule.eliminarProducto(\'' + p.id + '\')">🗑️</button></td>' +
            '</tr>';
        }).join('') + '</table></div>';
    },

    renderizar: function() {
      var filtro = document.getElementById('prod-filtro');
      filtro = filtro ? filtro.value : 'todas';
      var busqueda = document.getElementById('prod-buscar');
      busqueda = busqueda ? busqueda.value.toLowerCase() : '';
      var container = document.getElementById('productos-container');
      if (!container) return;
      var productos = SICP.db.getProductos();
      if (filtro !== 'todas') productos = productos.filter(function(p) { return SICP.getComponenteDeProducto(p.tipo) === filtro; });
      if (busqueda) productos = productos.filter(function(p) { return (p.titulo || '').toLowerCase().includes(busqueda) || (p.autores || '').toLowerCase().includes(busqueda); });
      container.innerHTML = SICP.ProductosModule._renderLista(productos);
    },

    nuevoProducto: function() {
      SICP.modal.showModal('Nuevo producto', '<form id="prod-form" onsubmit="SICP.ProductosModule.guardarProducto(event)">' +
        '<div class="form-group"><label>Título</label><input class="form-control" name="titulo" required placeholder="Título del producto"></div>' +
        '<div class="form-row"><div class="form-group"><label>Tipo</label><select class="form-control" name="tipo">' + SICP.CONSTANTES.TIPOS_PRODUCTO.map(function(t) { return '<option value="' + t.value + '">' + t.label + '</option>'; }).join('') + '</select></div>' +
        '<div class="form-group"><label>Año</label><input class="form-control" type="number" name="anno" min="2000" max="2030" value="' + new Date().getFullYear() + '"></div></div>' +
        '<div class="form-group"><label>Autores</label><input class="form-control" name="autores" placeholder="Apellido1, Nombre1; Apellido2, Nombre2"></div>' +
        '<div class="form-group"><label>DOI</label><input class="form-control" name="doi" placeholder="10.1234/abcde"></div>' +
        '<div class="form-group"><label>Revista / Editorial</label><input class="form-control" name="revista_editorial" placeholder="Nombre de la revista o editorial"></div>' +
        '<button type="submit" class="btn btn-primary">Guardar</button></form>');
    },

    guardarProducto: function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var p = {};
      fd.forEach(function(v, k) { p[k] = v; });
      p.anno = parseInt(p.anno) || null;
      SICP.db.addProducto(p);
      SICP.modal.closeModal();
      SICP.toast.showToast('Producto registrado', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    },

    editarProducto: function(id) {
      var productos = SICP.db.getProductos();
      var p = productos.find(function(x) { return x.id === id; });
      if (!p) return;
      window.__prodEditId = id;
      SICP.modal.showModal('Editar producto', '<form id="prod-form" onsubmit="SICP.ProductosModule.actualizarProducto(event)">' +
        '<div class="form-group"><label>Título</label><input class="form-control" name="titulo" value="' + escape(p.titulo) + '" required></div>' +
        '<div class="form-group"><label>DOI</label><input class="form-control" name="doi" value="' + escape(p.doi || '') + '"></div>' +
        '<div class="form-group"><label>Estado</label><input class="form-control" name="estado_producto" value="' + escape(p.estado_producto || 'Publicado') + '"></div>' +
        '<button type="submit" class="btn btn-primary">Actualizar</button></form>');
    },

    actualizarProducto: function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var cambios = {};
      fd.forEach(function(v, k) { cambios[k] = v; });
      SICP.db.updateProducto(window.__prodEditId, cambios);
      SICP.modal.closeModal();
      SICP.toast.showToast('Producto actualizado', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    },

    eliminarProducto: function(id) {
      SICP.toast.showConfirm('Eliminar producto', '¿Seguro?').then(function(ok) {
        if (ok) { SICP.db.deleteProducto(id); SICP.toast.showToast('Producto eliminado', 'info'); if (window.SICP_APP) SICP_APP.refresh(); }
      });
    },

    _onImportSelect: function(sel) {
      var val = sel.value;
      sel.value = '';
      if (val === 'doi') SICP.ProductosModule.importarDOI();
      else if (val === 'isbn') SICP.ProductosModule.importarISBN();
      else if (val === 'titulo') SICP.ProductosModule.importarTitulo();
      else if (val === 'orcid') SICP.ProductosModule.importarORCID();
      else if (val === 'masiva') SICP.ProductosModule.importarMasiva();
      else if (val === 'csv') SICP.ProductosModule.importarCSV();
    },

    importarDOI: function() {
      SICP.modal.showModal('Importar por DOI', '<p class="text-sm text-muted">Ingresa el DOI de un artículo para obtener sus metadatos automáticamente.</p><div class="form-group"><label>DOI</label><input class="form-control" id="doi-input" placeholder="10.1234/abcde"></div>' +
        '<button class="btn btn-accent" onclick="SICP.ProductosModule.buscarDOI()">Buscar</button><div id="doi-result" class="mt-16"></div>');
    },

    buscarDOI: function() {
      var doi = document.getElementById('doi-input').value.trim();
      if (!doi) return;
      document.getElementById('doi-result').innerHTML = SICP.utils.spinner('Buscando DOI...');
      SICP.crossref.buscarPorDOI(doi).then(function(data) {
        window.__doiData = data;
        document.getElementById('doi-result').innerHTML =
          '<div class="card" style="padding:12px"><p><strong>' + escape(data.titulo) + '</strong></p>' +
          '<p class="text-sm">' + escape(data.autores) + ' (' + data.anno + ') ' + escape(data.revista) + '</p>' +
          '<button class="btn btn-sm btn-primary" onclick="SICP.ProductosModule.guardarDesdeDOIActual()">Importar este producto</button></div>';
      }).catch(function(err) {
        document.getElementById('doi-result').innerHTML = '<p style="color:var(--danger)">Error: ' + err.message + '</p>';
      });
    },

    guardarDesdeDOIActual: function() {
      var data = window.__doiData;
      if (!data) return;
      SICP.db.addProducto({ titulo: data.titulo, tipo: 'Artículo', anno: data.anno || null, autores: data.autores || '', revista_editorial: data.revista || '', doi: data.doi || '', estado_producto: 'Publicado' });
      SICP.modal.closeModal();
      SICP.toast.showToast('Producto importado desde DOI', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    },

    importarISBN: function() {
      SICP.modal.showModal('Importar por ISBN', '<p class="text-sm text-muted">Ingresa el ISBN de un libro o capítulo para obtener los metadatos (OpenLibrary).</p><div class="form-group"><label>ISBN</label><input class="form-control" id="isbn-input" placeholder="9781234567890"></div>' +
        '<button class="btn btn-accent" onclick="SICP.ProductosModule.buscarISBN()">Buscar</button><div id="isbn-result" class="mt-16"></div>');
    },

    buscarISBN: function() {
      var isbn = document.getElementById('isbn-input').value.trim();
      if (!isbn) return;
      document.getElementById('isbn-result').innerHTML = SICP.utils.spinner('Buscando en OpenLibrary...');
      fetch('https://openlibrary.org/isbn/' + encodeURIComponent(isbn) + '.json')
        .then(function(r) { if (!r.ok) throw new Error('ISBN no encontrado'); return r.json(); })
        .then(function(data) {
          window.__isbnData = { isbn: isbn, titulo: data.title || 'Sin título', anno: data.publish_date ? parseInt(data.publish_date.match(/\d{4}/)) : null, editorial: data.publishers ? data.publishers.join(', ') : '', autores: '' };
          if (data.authors && data.authors.length) {
            var keys = data.authors.map(function(a) { return a.key; }).slice(0, 3);
            return Promise.all(keys.map(function(k) {
              return fetch('https://openlibrary.org' + k + '.json').then(function(r) { return r.json(); }).then(function(a) { return a.name || ''; });
            })).then(function(names) {
              window.__isbnData.autores = names.join(', ');
              document.getElementById('isbn-result').innerHTML =
                '<div class="card" style="padding:12px"><p><strong>' + escape(window.__isbnData.titulo) + '</strong></p>' +
                '<p class="text-sm">' + escape(window.__isbnData.autores) + (window.__isbnData.anno ? ' (' + window.__isbnData.anno + ')' : '') + ' ' + escape(window.__isbnData.editorial) + '</p>' +
                '<button class="btn btn-sm btn-primary" onclick="SICP.ProductosModule.guardarDesdeISBNActual(false)">Importar como libro</button>' +
                '<button class="btn btn-sm" style="margin-left:8px" onclick="SICP.ProductosModule.guardarDesdeISBNActual(true)">Importar como capítulo</button></div>';
            });
          }
          document.getElementById('isbn-result').innerHTML =
            '<div class="card" style="padding:12px"><p><strong>' + escape(window.__isbnData.titulo) + '</strong></p>' +
            '<p class="text-sm">' + (window.__isbnData.anno ? ' (' + window.__isbnData.anno + ')' : '') + ' ' + escape(window.__isbnData.editorial) + '</p>' +
            '<button class="btn btn-sm btn-primary" onclick="SICP.ProductosModule.guardarDesdeISBNActual(false)">Importar como libro</button></div>';
        })
        .catch(function(err) {
          document.getElementById('isbn-result').innerHTML = '<p style="color:var(--danger)">Error: ' + err.message + '</p>';
        });
    },

    guardarDesdeISBNActual: function(comoCapitulo) {
      var d = window.__isbnData;
      if (!d) return;
      SICP.db.addProducto({ titulo: comoCapitulo ? d.titulo + ' (capítulo)' : d.titulo, tipo: comoCapitulo ? 'Capítulo' : 'Libro', anno: d.anno || null, autores: d.autores || '', revista_editorial: d.editorial || '', doi: d.isbn || '', estado_producto: 'Publicado' });
      SICP.modal.closeModal();
      SICP.toast.showToast(comoCapitulo ? 'Capítulo importado desde ISBN' : 'Libro importado desde ISBN', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    },

    importarTitulo: function() {
      SICP.modal.showModal('Buscar por título', '<p class="text-sm text-muted">Busca artículos por título en Crossref.</p><div class="form-group"><label>Título</label><input class="form-control" id="titulo-input" placeholder="Palabras del título"></div>' +
        '<button class="btn btn-accent" onclick="SICP.ProductosModule.buscarTitulo()">Buscar</button><div id="titulo-result" class="mt-16"></div>');
    },

    buscarTitulo: function() {
      var q = document.getElementById('titulo-input').value.trim();
      if (!q) return;
      document.getElementById('titulo-result').innerHTML = SICP.utils.spinner('Buscando por título...');
      SICP.crossref.buscarPorTitulo(q).then(function(items) {
        if (!items.length) { document.getElementById('titulo-result').innerHTML = '<p style="color:var(--danger)">Sin resultados</p>'; return; }
        window.__tituloResults = items;
        document.getElementById('titulo-result').innerHTML =
          '<div style="max-height:300px;overflow-y:auto">' +
          items.map(function(data, i) {
            return '<div class="card" style="padding:8px;margin-bottom:6px"><p><strong>' + escape(data.titulo) + '</strong></p>' +
              '<p class="text-sm">' + escape(data.autores) + ' (' + data.anno + ') ' + escape(data.revista) + '</p>' +
              '<button class="btn btn-sm btn-primary" onclick="SICP.ProductosModule.guardarDesdeTituloIndex(' + i + ')">Importar</button></div>';
          }).join('') + '</div>';
      }).catch(function(err) {
        document.getElementById('titulo-result').innerHTML = '<p style="color:var(--danger)">Error: ' + err.message + '</p>';
      });
    },

    guardarDesdeTituloIndex: function(i) {
      var items = window.__tituloResults;
      if (!items || !items[i]) return;
      var data = items[i];
      SICP.db.addProducto({ titulo: data.titulo, tipo: 'Artículo', anno: data.anno || null, autores: data.autores || '', revista_editorial: data.revista || '', doi: data.doi || '', estado_producto: 'Publicado' });
      SICP.modal.closeModal();
      SICP.toast.showToast('Producto importado por título', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    },

    importarORCID: function() {
      var perfil = SICP.db.getProfile();
      var orcidActual = perfil ? perfil.orcid : '';
      SICP.modal.showModal('Importar desde ORCID', '<p class="text-sm text-muted">Ingresa un ORCID para obtener todas las publicaciones registradas.</p><div class="form-group"><label>ORCID</label><input class="form-control" id="orcid-input" placeholder="0000-0002-1825-0097" value="' + escape(orcidActual || '') + '"></div>' +
        '<button class="btn btn-accent" onclick="SICP.ProductosModule.buscarORCID()">Buscar</button><div id="orcid-result" class="mt-16"></div>');
    },

    buscarORCID: function() {
      var orcid = document.getElementById('orcid-input').value.trim();
      if (!orcid) return;
      document.getElementById('orcid-result').innerHTML = SICP.utils.spinner('Buscando en ORCID...');
      SICP.orcid.buscar(orcid).then(function(works) {
        if (!works.length) { document.getElementById('orcid-result').innerHTML = '<p style="color:var(--danger)">Sin resultados</p>'; return; }
        document.getElementById('orcid-result').innerHTML =
          '<p class="text-sm text-muted">Se encontraron ' + works.length + ' trabajos. Selecciona los que deseas importar:</p>' +
          '<div style="max-height:300px;overflow-y:auto">' +
          works.map(function(w, i) {
            return '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">' +
              '<input type="checkbox" id="orcid-chk-' + i + '" checked>' +
              '<span><strong>' + escape(w.titulo) + '</strong><br><span class="text-sm text-muted">' + escape(w.tipo || '') + (w.doi ? ' · DOI: ' + escape(w.doi) : '') + '</span></span></label>';
          }).join('') + '</div>' +
          '<button class="btn btn-primary mt-16" onclick="SICP.ProductosModule.guardarDesdeORCID(' + works.length + ')">Importar seleccionados (' + works.length + ')</button>';
        window.__orcidWorks = works;
      }).catch(function(err) {
        document.getElementById('orcid-result').innerHTML = '<p style="color:var(--danger)">Error: ' + err.message + '</p>';
      });
    },

    guardarDesdeORCID: function(total) {
      var works = window.__orcidWorks || [];
      var count = 0;
      for (var i = 0; i < works.length; i++) {
        var chk = document.getElementById('orcid-chk-' + i);
        if (chk && chk.checked) {
          var w = works[i];
          var tipo = SICP.ProductosModule._tipoDesdeORCID(w.tipo);
          SICP.db.addProducto({ titulo: w.titulo, tipo: tipo, anno: null, autores: '', doi: w.doi || '', estado_producto: 'Publicado' });
          count++;
        }
      }
      SICP.modal.closeModal();
      SICP.toast.showToast(count + ' productos importados desde ORCID', 'success');
      if (window.SICP_APP) SICP_APP.refresh();
    },

    _tipoDesdeORCID: function(orcidType) {
      var map = { 'journal-article': 'Artículo', 'book': 'Libro', 'book-chapter': 'Capítulo', 'conference-paper': 'Congreso', 'dissertation': 'Tesis', 'patent': 'Patente', 'software': 'Software', 'report': 'Consultoría', 'other': 'Otro' };
      return map[orcidType] || 'Artículo';
    },

    importarMasiva: function() {
      SICP.modal.showModal('Importación masiva', '<p class="text-sm text-muted">Pega una lista de títulos, DOIs o ISBNs (uno por línea). Se importarán automáticamente.</p><div class="form-group"><label>Contenido</label><textarea class="form-control" id="masiva-input" rows="8" placeholder="10.1234/abcde&#10;9781234567890&#10;Título de un artículo"></textarea></div>' +
        '<button class="btn btn-accent" onclick="SICP.ProductosModule.procesarMasiva()">Procesar</button><div id="masiva-result" class="mt-16"></div>');
    },

    procesarMasiva: function() {
      var texto = document.getElementById('masiva-input').value;
      var lineas = texto.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });
      if (!lineas.length) return;
      document.getElementById('masiva-result').innerHTML = SICP.utils.spinner('Procesando ' + lineas.length + ' líneas...');
      var importados = 0, errores = 0;
      var results = [];
      var p = Promise.resolve();
      lineas.forEach(function(linea) {
        p = p.then(function() {
          if (/^10\.\d{4,}/.test(linea)) {
            return SICP.crossref.buscarPorDOI(linea).then(function(data) {
              SICP.db.addProducto({ titulo: data.titulo, tipo: 'Artículo', anno: data.anno, autores: data.autores, revista_editorial: data.revista, doi: linea, estado_producto: 'Publicado' });
              importados++;
              results.push('✅ ' + data.titulo);
            }).catch(function() {
              errores++;
              results.push('❌ DOI: ' + linea);
            });
          } else if (/^978/.test(linea) && linea.length >= 10) {
            return fetch('https://openlibrary.org/isbn/' + encodeURIComponent(linea) + '.json').then(function(r) { return r.json(); }).then(function(data) {
              SICP.db.addProducto({ titulo: data.title || linea, tipo: 'Libro', anno: data.publish_date ? parseInt(data.publish_date.match(/\d{4}/)) : null, autores: '', doi: linea, estado_producto: 'Publicado' });
              importados++;
              results.push('✅ ' + (data.title || linea));
            }).catch(function() {
              errores++;
              results.push('❌ ISBN: ' + linea);
            });
          } else {
            SICP.db.addProducto({ titulo: linea, tipo: 'Otro', anno: null, autores: '', estado_producto: 'Publicado' });
            importados++;
            results.push('📄 ' + linea);
          }
        });
      });
      p.then(function() {
        document.getElementById('masiva-result').innerHTML = '<p class="text-sm">' +
          '✅ ' + importados + ' importados' + (errores ? ', ❌ ' + errores + ' errores' : '') + '</p>' +
          '<div style="max-height:200px;overflow-y:auto;font-size:12px">' + results.join('<br>') + '</div>' +
          '<button class="btn btn-primary mt-16" onclick="SICP.modal.closeModal();if(window.SICP_APP)SICP_APP.refresh()">Cerrar</button>';
      });
    },

    exportarCSV: function() {
      SICP.exportService.exportCSVProductos(SICP.db.getProductos());
    },

    importarCSV: function() {
      SICP.modal.showModal('Importar desde CSV',
        '<p class="text-sm text-muted">Sube un archivo CSV con columnas: Título, Tipo, Año, Autores, DOI, Revista/Editorial, Estado</p>' +
        '<div class="form-group"><label>Archivo CSV</label><input type="file" class="form-control" id="csv-file-input" accept=".csv" onchange="SICP.ProductosModule._procesarCSVFile(event)"></div>' +
        '<div id="csv-result" class="mt-16"></div>');
    },

    _procesarCSVFile: function(event) {
      var file = event.target.files[0];
      if (!file) return;
      document.getElementById('csv-result').innerHTML = SICP.utils.spinner('Procesando CSV...');
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var count = SICP.exportService.importCSVProductos(e.target.result);
          document.getElementById('csv-result').innerHTML = '<p style="color:var(--ok)">✅ ' + count + ' productos importados desde CSV</p>' +
            '<button class="btn btn-primary mt-16" onclick="SICP.modal.closeModal();if(window.SICP_APP)SICP_APP.refresh()">Cerrar</button>';
        } catch(err) {
          document.getElementById('csv-result').innerHTML = '<p style="color:var(--danger)">Error: ' + SICP.utils.escapeHtml(err.message) + '</p>';
        }
      };
      reader.readAsText(file);
    },

    afterRender: function() {}
  };
})();
