SICP.orcid = (function() {
  var ORCID_API = 'https://pub.orcid.org/v3.0';
  var api = SICP.api;

  function buscar(orcidId) {
    return api.fetchWithRetry(ORCID_API + '/' + orcidId + '/works', {
      headers: { 'Accept': 'application/vnd.orcid+json' }
    }).then(function(data) {
        return (data.group || []).map(function(g) {
          var s = g['work-summary'] && g['work-summary'][0];
          if (!s) return null;
          var doi = '';
          if (s['external-ids'] && s['external-ids']['external-id']) {
            var ids = s['external-ids']['external-id'];
            for (var j = 0; j < ids.length; j++) {
              if (ids[j]['external-id-type'] === 'doi') { doi = ids[j]['external-id-value']; break; }
            }
          }
          return {
            titulo: s.title && s.title.title && s.title.title.value ? s.title.title.value : 'Sin título',
            tipo: s.type || '',
            doi: doi
          };
        }).filter(function(x) { return x !== null; });
      });
  }

  return { buscar: buscar };
})();
