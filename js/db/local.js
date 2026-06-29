SICP.localDB = (function() {
  var KEY = SICP.CONFIG.STORAGE_KEY;
  var data = null;

  function emptyData() {
    return {
      perfil: {
        nombre: '', institucion: '', area: 'Ciencias Sociales',
        lineaInvestigacion: '', orcid: '', scholar: '', cvu: '',
        nivelActual: 'Candidato', metaSNII: 'Nivel I',
        fechaRegistro: new Date().toISOString()
      },
      config: {
        perfilInvestigacion: 'Ciencia básica y de frontera',
        ponderacionComponente1: 40, ponderacionComponente2: 30, ponderacionComponente3: 30,
        ponderacionArticulos: 12, ponderacionLibros: 7, ponderacionTesis: 6,
        ponderacionCongresos: 3, ponderacionProyectos: 8, ponderacionDivulgacion: 3,
        ponderacionLiderazgo: 5, ponderacionInnovacion: 7, ponderacionDocencia: 3,
        metaArticulosAnual: 3, metaTesisAnual: 2, metaLiderazgoAnual: 2, metaInnovacionAnual: 1
      },
      metas: [], productos: [], evidencias: [],
      _version: 3
    };
  }

  function ensureDefaults() {
    var def = emptyData();
    data.perfil = data.perfil || def.perfil;
    data.config = data.config || def.config;
    data.metas = data.metas || [];
    data.productos = data.productos || [];
    data.evidencias = data.evidencias || [];
    if (!data._version || data._version < 2) {
      data = Object.assign({}, def, data);
      data._version = 2;
    }
    if (data._version < 3) {
      if (!data.config.perfilInvestigacion) data.config.perfilInvestigacion = 'Ciencia básica y de frontera';
      if (!data.config.ponderacionComponente1) {
        data.config.ponderacionComponente1 = 40;
        data.config.ponderacionComponente2 = 30;
        data.config.ponderacionComponente3 = 30;
      }
      data._version = 3;
    }
  }

  function init() {
    var saved = localStorage.getItem(KEY);
    if (saved) {
      try { data = JSON.parse(saved); } catch (e) { data = emptyData(); }
    } else {
      data = emptyData();
    }
    ensureDefaults();
    return data;
  }

  function save() { localStorage.setItem(KEY, JSON.stringify(data)); }

  function get() { return data; }
  function getProfile() { return data.perfil; }
  function updateProfile(perfil) { data.perfil = Object.assign({}, data.perfil, perfil); save(); return data.perfil; }
  function getConfig() { return data.config; }
  function updateConfig(config) { data.config = Object.assign({}, data.config, config); save(); return data.config; }

  function getMetas() { return data.metas; }
  function addMeta(meta) { meta.id = SICP.utils.generarId(); meta.fechaCreacion = new Date().toISOString(); data.metas.push(meta); save(); return meta; }
  function updateMeta(id, cambios) { var idx = data.metas.findIndex(function(m) { return m.id === id; }); if (idx === -1) return null; data.metas[idx] = Object.assign({}, data.metas[idx], cambios); save(); return data.metas[idx]; }
  function deleteMeta(id) { data.metas = data.metas.filter(function(m) { return m.id !== id; }); save(); }

  function getProductos() { return data.productos; }
  function addProducto(p) { p.id = SICP.utils.generarId(); p.fechaCreacion = new Date().toISOString(); data.productos.push(p); save(); return p; }
  function updateProducto(id, cambios) { var idx = data.productos.findIndex(function(p) { return p.id === id; }); if (idx === -1) return null; data.productos[idx] = Object.assign({}, data.productos[idx], cambios); save(); return data.productos[idx]; }
  function deleteProducto(id) { data.productos = data.productos.filter(function(p) { return p.id !== id; }); save(); }

  function getEvidencias() { return data.evidencias; }
  function addEvidencia(e) { e.id = SICP.utils.generarId(); e.fechaRegistro = new Date().toISOString(); data.evidencias.push(e); save(); return e; }
  function updateEvidencia(id, cambios) { var idx = data.evidencias.findIndex(function(e) { return e.id === id; }); if (idx === -1) return null; data.evidencias[idx] = Object.assign({}, data.evidencias[idx], cambios); save(); return data.evidencias[idx]; }
  function deleteEvidencia(id) { data.evidencias = data.evidencias.filter(function(e) { return e.id !== id; }); save(); }

  function uploadFile(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function exportJSON() { return JSON.stringify(data, null, 2); }
  function importJSON(jsonStr) {
    var imported = JSON.parse(jsonStr);
    if (!imported.metas || !imported.productos) throw new Error('Formato inválido');
    data = imported;
    ensureDefaults();
    save();
  }

  function calcularStats() {
    var metas = data.metas;
    var productos = data.productos;
    var evidencias = data.evidencias;
    var conf = data.config;

    var stats = {
      totalMetas: metas.length,
      metasCompletadas: metas.filter(function(m) { return m.estado === 'Completada'; }).length,
      metasEnProceso: metas.filter(function(m) { return m.estado === 'En proceso'; }).length,
      metasVencidas: metas.filter(function(m) { return m.estado !== 'Completada' && m.fechaLimite && new Date(m.fechaLimite) < new Date(); }).length,
      metasNoIniciadas: metas.filter(function(m) { return m.estado === 'No iniciada'; }).length,
      totalProductos: productos.length,
      articulos: productos.filter(function(p) { return p.tipo === 'Artículo'; }).length,
      libros: productos.filter(function(p) { return p.tipo === 'Libro' || p.tipo === 'Capítulo'; }).length,
      tesis: productos.filter(function(p) { return p.tipo === 'Tesis'; }).length,
      congresos: productos.filter(function(p) { return p.tipo === 'Congreso' || p.tipo === 'Conferencia'; }).length,
      proyectos: productos.filter(function(p) { return p.tipo === 'Proyecto'; }).length,
      innovacion: productos.filter(function(p) { return p.tipo === 'Innovación' || p.tipo === 'Software' || p.tipo === 'Patente'; }).length,
      liderazgo: productos.filter(function(p) { return p.tipo === 'Liderazgo' || p.tipo === 'Comité' || p.tipo === 'Editorial'; }).length,
      divulgacion: productos.filter(function(p) { return p.tipo === 'Divulgación' || p.tipo === 'Acceso abierto'; }).length,
      docencia: productos.filter(function(p) { return p.tipo === 'Docencia'; }).length,
      totalEvidencias: evidencias.length,
      evidenciasCompletas: evidencias.filter(function(e) { return e.estado === 'Completa'; }).length,
      evidenciasPendientes: evidencias.filter(function(e) { return e.estado === 'Pendiente' || e.estado === 'Incompleta'; }).length,
      avanceGeneral: 0,
      scoreSNII: 0,
      componente1: 0, componente2: 0, componente3: 0,
      brechas: []
    };

    if (metas.length > 0) {
      stats.avanceGeneral = Math.round(metas.reduce(function(s, m) { return s + (m.avance || 0); }, 0) / metas.length);
    }

    stats.componente1 = Math.min(
      (stats.articulos * (conf.ponderacionArticulos || 12)) +
      (stats.libros * (conf.ponderacionLibros || 7)) +
      (stats.congresos * (conf.ponderacionCongresos || 3)) +
      (stats.proyectos * (conf.ponderacionProyectos || 8)) +
      (stats.innovacion * (conf.ponderacionInnovacion || 7)), 100
    );
    stats.componente2 = Math.min(
      (stats.tesis * (conf.ponderacionTesis || 6)) +
      (stats.liderazgo * (conf.ponderacionLiderazgo || 5)) +
      (stats.docencia * (conf.ponderacionDocencia || 3)), 100
    );
    stats.componente3 = Math.min(
      (stats.divulgacion * (conf.ponderacionDivulgacion || 3)), 100
    );

    var p1 = (conf.ponderacionComponente1 || 40) / 100;
    var p2 = (conf.ponderacionComponente2 || 30) / 100;
    var p3 = (conf.ponderacionComponente3 || 30) / 100;
    stats.scoreSNII = Math.round((stats.componente1 * p1) + (stats.componente2 * p2) + (stats.componente3 * p3));

    var metaArts = conf.metaArticulosAnual || 3;
    var metaTesis = conf.metaTesisAnual || 2;
    if (stats.articulos < metaArts) stats.brechas.push({ area: 'C1: Artículos', actual: stats.articulos, meta: metaArts });
    if (stats.tesis < metaTesis) stats.brechas.push({ area: 'C2: Tesis', actual: stats.tesis, meta: metaTesis });
    if (stats.liderazgo < (conf.metaLiderazgoAnual || 2)) stats.brechas.push({ area: 'C2: Liderazgo', actual: stats.liderazgo, meta: conf.metaLiderazgoAnual || 2 });
    if (stats.innovacion < (conf.metaInnovacionAnual || 1)) stats.brechas.push({ area: 'C1: Innovación', actual: stats.innovacion, meta: conf.metaInnovacionAnual || 1 });
    if (stats.divulgacion < 2) stats.brechas.push({ area: 'C3: Divulgación', actual: stats.divulgacion, meta: 2 });

    return stats;
  }

  init();
  return {
    init: init, get: get, save: save,
    getProfile: getProfile, updateProfile: updateProfile,
    getConfig: getConfig, updateConfig: updateConfig,
    getMetas: getMetas, addMeta: addMeta, updateMeta: updateMeta, deleteMeta: deleteMeta,
    getProductos: getProductos, addProducto: addProducto, updateProducto: updateProducto, deleteProducto: deleteProducto,
    getEvidencias: getEvidencias, addEvidencia: addEvidencia, updateEvidencia: updateEvidencia, deleteEvidencia: deleteEvidencia,
    uploadFile: uploadFile,
    exportJSON: exportJSON, importJSON: importJSON,
    calcularStats: calcularStats
  };
})();
