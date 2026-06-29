SICP.crossref = (function() {
  var BASE = 'https://api.crossref.org';
  var api = SICP.api;

  function buscarPorDOI(doi) {
    return api.fetchWithRetry(BASE + '/works/' + encodeURIComponent(doi))
      .then(function(data) {
        var m = data.message;
        return {
          titulo: m.title && m.title[0] ? m.title[0] : 'Sin título',
          autores: m.author ? m.author.map(function(a) { return a.given + ' ' + a.family; }).join(', ') : '',
          anno: m.issued && m.issued['date-parts'] ? m.issued['date-parts'][0][0] : null,
          revista: m['container-title'] && m['container-title'][0] ? m['container-title'][0] : '',
          doi: doi,
          url: m.URL || ''
        };
      });
  }

  function buscarPorTitulo(query) {
    return api.fetchWithRetry(BASE + '/works?query.title=' + encodeURIComponent(query) + '&rows=10')
      .then(function(data) {
        return (data.message && data.message.items || []).map(function(m) {
          return {
            titulo: m.title && m.title[0] ? m.title[0] : 'Sin título',
            autores: m.author ? m.author.map(function(a) { return a.given + ' ' + a.family; }).join(', ') : '',
            anno: m.issued && m.issued['date-parts'] ? m.issued['date-parts'][0][0] : null,
            revista: m['container-title'] && m['container-title'][0] ? m['container-title'][0] : '',
            doi: m.DOI || '',
            url: m.URL || ''
          };
        });
      });
  }

  return { buscarPorDOI: buscarPorDOI, buscarPorTitulo: buscarPorTitulo };
})();
