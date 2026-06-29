SICP.exportService = (function() {
  var _jspdf = null;

  function _copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function() {});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      document.body.removeChild(ta);
    }
  }

  function getJspdf() {
    if (_jspdf) return _jspdf;
    try {
      if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        _jspdf = window.jspdf.jsPDF;
        return _jspdf;
      }
      return null;
    } catch(e) { return null; }
  }

  function loadJspdfAsync() {
    if (_jspdf) return Promise.resolve(_jspdf);
    if (getJspdf()) return Promise.resolve(_jspdf);
    return import('jspdf').then(function(mod) {
      _jspdf = mod.jsPDF || (mod.default && mod.default.jsPDF) || null;
      if (!_jspdf) throw new Error('jsPDF not found');
      return _jspdf;
    }).catch(function() {
      SICP.toast.showToast('jsPDF no disponible', 'error');
      return null;
    });
  }

  function generateReport(stats, data) {
    var title = 'Reporte SNII - ' + (data.perfil.nombre || 'Investigador');
    var html = '<html><head><meta charset="utf-8"><title>' + title + '</title>';
    html += '<style>body{font-family:Arial,sans-serif;color:#333;padding:40px}h1{color:#1e40af}table{border-collapse:collapse;width:100%;margin:16px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}.section{margin:24px 0}</style></head><body>';
    html += '<h1>' + title + '</h1>';
    html += '<p>Generado: ' + new Date().toLocaleDateString('es-MX') + '</p>';
    html += '<div class="section"><h2>Resumen</h2><table><tr><th>Indicador</th><th>Valor</th></tr>';
    html += '<tr><td>Score SNII</td><td>' + stats.scoreSNII + '%</td></tr>';
    html += '<tr><td>Avance general</td><td>' + stats.avanceGeneral + '%</td></tr>';
    html += '<tr><td>Metas totales</td><td>' + stats.totalMetas + '</td></tr>';
    html += '<tr><td>Productos totales</td><td>' + stats.totalProductos + '</td></tr>';
    html += '<tr><td>Evidencias completas</td><td>' + stats.evidenciasCompletas + '/' + stats.totalEvidencias + '</td></tr>';
    html += '</table></div>';
    html += '<div class="section"><h2>Componentes</h2><table>';
    html += '<tr><th>Componente</th><th>Puntaje</th></tr>';
    html += '<tr><td>C1: Producción</td><td>' + stats.componente1 + '/100</td></tr>';
    html += '<tr><td>C2: Comunidad HCTI</td><td>' + stats.componente2 + '/100</td></tr>';
    html += '<tr><td>C3: Acceso universal</td><td>' + stats.componente3 + '/100</td></tr>';
    html += '</table></div>';
    if (data.productos && data.productos.length) {
      html += '<div class="section"><h2>Productos (' + data.productos.length + ')</h2><table><tr><th>Título</th><th>Tipo</th><th>Año</th></tr>';
      for (var i = 0; i < data.productos.length; i++) {
        var p = data.productos[i];
        html += '<tr><td>' + SICP.utils.escapeHtml(p.titulo) + '</td><td>' + SICP.utils.escapeHtml(p.tipo) + '</td><td>' + (p.anno || '-') + '</td></tr>';
      }
      html += '</table></div>';
    }
    html += '<p style="margin-top:40px;color:#999;font-size:.8em">Generado por SICP-SNII Pro</p></body></html>';

    var win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
    }
  }

  function exportPDF(stats, data) {
    var jsPDF = getJspdf();
    if (!jsPDF) {
      loadJspdfAsync().then(function(mod) {
        if (mod) exportPDFImpl(stats, data, mod);
      });
      return;
    }
    exportPDFImpl(stats, data, jsPDF);
  }

  function exportPDFImpl(stats, data, jsPDF) {

    var doc = new jsPDF('p', 'mm', 'a4');
    var pageW = 210, margin = 20, y = margin;
    var nombre = data.perfil.nombre || 'Investigador';

    function header() {
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175);
      doc.text('SICP-SNII Pro — Reporte Ejecutivo', margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('SNII 2026 · SECIHTI', margin, y);
      doc.text(new Date().toLocaleDateString('es-MX'), pageW - margin, y, { align: 'right' });
      y += 5;
      doc.setDrawColor(200);
      doc.line(margin, y, pageW - margin, y);
      y += 8;
    }

    function section(title) {
      doc.setFontSize(13);
      doc.setTextColor(30, 64, 175);
      doc.text(title, margin, y);
      y += 2;
      doc.setDrawColor(30, 64, 175);
      doc.line(margin, y, margin + 40, y);
      y += 6;
    }

    function checkPage() {
      if (y > 270) {
        doc.addPage();
        y = margin;
        header();
      }
    }

    header();

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text('Investigador: ' + nombre, margin, y);
    y += 6;
    if (data.perfil.institucion) { doc.text('Institución: ' + data.perfil.institucion, margin, y); y += 6; }
    if (data.perfil.area) { doc.text('Área SNII: ' + data.perfil.area, margin, y); y += 6; }
    y += 4;

    section('Resumen de Indicadores');
    var rows = [
      ['Score SNII', stats.scoreSNII + '%'],
      ['Avance general', stats.avanceGeneral + '%'],
      ['Metas totales', String(stats.totalMetas)],
      ['Metas completadas', String(stats.metasCompletadas)],
      ['Productos totales', String(stats.totalProductos)],
      ['Evidencias completas', stats.evidenciasCompletas + '/' + stats.totalEvidencias]
    ];
    doc.setFontSize(9);
    rows.forEach(function(r) {
      checkPage();
      doc.setFont('Helvetica', 'bold');
      doc.text(r[0], margin + 5, y);
      doc.setFont('Helvetica', 'normal');
      doc.text(r[1], margin + 90, y, { align: 'right' });
      doc.setDrawColor(230);
      doc.line(margin, y + 1, pageW - margin, y + 1);
      y += 5;
    });
    y += 4;

    section('Puntaje por Componente');
    var comps = [
      ['C1: Producción', stats.componente1 + '/100', stats.componente1 > 50 ? '#16a34a' : '#d97706'],
      ['C2: Comunidad HCTI', stats.componente2 + '/100', stats.componente2 > 50 ? '#16a34a' : '#d97706'],
      ['C3: Acceso universal', stats.componente3 + '/100', stats.componente3 > 50 ? '#16a34a' : '#d97706']
    ];
    comps.forEach(function(c) {
      y += 1;
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.text(c[0], margin + 5, y);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(c[2]);
      doc.text(c[1], margin + 90, y, { align: 'right' });
      doc.setTextColor(50);
      y += 5;
    });
    y += 4;

    if (data.productos && data.productos.length) {
      checkPage();
      section('Productos (' + data.productos.length + ')');
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(100);
      doc.text('Título', margin + 5, y);
      doc.text('Tipo', margin + 130, y);
      doc.text('Año', margin + 170, y);
      y += 1;
      doc.setDrawColor(200);
      doc.line(margin, y, pageW - margin, y);
      y += 3;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(50);
      var maxItems = Math.min(data.productos.length, 50);
      for (var i = 0; i < maxItems; i++) {
        checkPage();
        var p = data.productos[i];
        var t = p.titulo || '';
        if (t.length > 55) t = t.slice(0, 52) + '...';
        doc.text(t, margin + 5, y);
        doc.text(p.tipo || '-', margin + 130, y);
        doc.text(String(p.anno || '-'), margin + 170, y);
        y += 4.5;
      }
    }

    y = Math.max(y, 275);
    doc.setFontSize(8);
    doc.setTextColor(180);
    doc.text('Generado por SICP-SNII Pro v' + (SICP.CONFIG.APP_VERSION || '2.0'), margin, y);

    try { doc.save('reporte_snii_' + new Date().toISOString().slice(0, 10) + '.pdf'); }
    catch(e) { SICP.toast.showToast('Error al generar PDF', 'error'); }
  }

  function exportCSVProductos(productos) {
    if (!productos || !productos.length) { SICP.toast.showToast('No hay productos para exportar', 'warning'); return; }
    var header = 'Título,Tipo,Año,Autores,DOI,Revista/Editorial,Estado\n';
    var rows = productos.map(function(p) {
      return '"' + (p.titulo || '').replace(/"/g, '""') + '","' +
        (p.tipo || '').replace(/"/g, '""') + '","' +
        (p.anno || '') + '","' +
        (p.autores || '').replace(/"/g, '""') + '","' +
        (p.doi || '').replace(/"/g, '""') + '","' +
        (p.revista_editorial || '').replace(/"/g, '""') + '","' +
        (p.estado_producto || '') + '"';
    }).join('\n');
    var csv = '\uFEFF' + header + rows;
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'productos_snii_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importCSVProductos(csvText) {
    var lines = csvText.split('\n').filter(function(l) { return l.trim(); });
    if (lines.length < 2) { SICP.toast.showToast('CSV vacío o inválido', 'warning'); return 0; }
    var count = 0;
    for (var i = 1; i < lines.length; i++) {
      try {
        var vals = [];
        var current = '', inQuotes = false;
        for (var c = 0; c < lines[i].length; c++) {
          var ch = lines[i][c];
          if (ch === '"') { inQuotes = !inQuotes; continue; }
          if (ch === ',' && !inQuotes) { vals.push(current.trim()); current = ''; continue; }
          current += ch;
        }
        vals.push(current.trim());
        if (vals.length >= 2 && vals[0]) {
          SICP.db.addProducto({
            titulo: vals[0],
            tipo: vals[1] || 'Artículo',
            anno: parseInt(vals[2]) || null,
            autores: vals[3] || '',
            doi: vals[4] || '',
            revista_editorial: vals[5] || '',
            estado_producto: vals[6] || 'Publicado'
          });
          count++;
        }
      } catch(e) {}
    }
    return count;
  }

  return { generateReport: generateReport, exportPDF: exportPDF, exportCSVProductos: exportCSVProductos, importCSVProductos: importCSVProductos };
})();
