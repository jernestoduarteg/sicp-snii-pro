SICP.auth = (function() {
  var listeners = [];
  var currentUser = null;

  function initAuth() {
    try {
      currentUser = SICP.supabaseDB.getUser();
    } catch(e) { currentUser = null; }
    notifyListeners('ready', currentUser);
  }

  function onAuthChange(fn) {
    listeners.push(fn);
    return function() { listeners = listeners.filter(function(l) { return l !== fn; }); };
  }

  function notifyListeners(event, user) {
    for (var i = 0; i < listeners.length; i++) listeners[i](event, user || currentUser);
  }

  function getUser() {
    try {
      var u = SICP.supabaseDB.getUser();
      if (u) currentUser = u;
    } catch(e) {}
    return currentUser;
  }

  function isAuthenticated() {
    getUser();
    return !!currentUser;
  }

  function signOut() {
    try {
      SICP.supabaseDB.signOut().then(function() {
        currentUser = null;
        notifyListeners('signout', null);
      });
    } catch(e) { currentUser = null; }
  }

  return { initAuth: initAuth, onAuthChange: onAuthChange, getUser: getUser, isAuthenticated: isAuthenticated, signOut: signOut };
})();
