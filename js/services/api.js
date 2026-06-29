SICP.api = (function() {
  var _cache = {};
  var _cacheTTL = 5 * 60 * 1000;

  function _cacheKey(url, opts) {
    return url + '|' + (opts && opts.method || 'GET') + '|' + JSON.stringify(opts && opts.body || '');
  }

  function fetchWithRetry(url, opts, retries) {
    retries = retries || 2;
    var key = _cacheKey(url, opts);
    var cached = _cache[key];
    if (cached && Date.now() - cached.ts < _cacheTTL) {
      return Promise.resolve(cached.data);
    }
    var attempt = 0;
    function doFetch() {
      attempt++;
      return fetch(url, opts).then(function(r) {
        if (!r.ok) {
          if (r.status === 429 && attempt <= retries) {
            return new Promise(function(resolve) { setTimeout(resolve, attempt * 1000); }).then(doFetch);
          }
          throw new Error(r.status === 404 ? 'No encontrado' : r.status === 429 ? 'Demasiadas solicitudes' : 'Error ' + r.status);
        }
        return r.json().then(function(data) {
          _cache[key] = { data: data, ts: Date.now() };
          return data;
        });
      }).catch(function(err) {
        if (attempt <= retries && err.message !== 'No encontrado') {
          return new Promise(function(resolve) { setTimeout(resolve, attempt * 1000); }).then(doFetch);
        }
        throw err;
      });
    }
    return doFetch();
  }

  function clearCache() { _cache = {}; }

  return { fetchWithRetry: fetchWithRetry, clearCache: clearCache };
})();
