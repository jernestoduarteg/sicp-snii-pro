SICP.router = (function() {
  function createRouter(app) {
    function start() {
      window.addEventListener('hashchange', onHashChange);
      var initial = window.location.hash.slice(1).split('?')[0] || 'dashboard';
      app.navegar(initial);
    }

    function onHashChange() {
      var hash = window.location.hash.slice(1).split('?')[0];
      if (hash && app._routes && app._routes[hash]) {
        app.navegar(hash);
      }
    }

    return { start: start, onHashChange: onHashChange };
  }

  return { createRouter: createRouter };
})();
