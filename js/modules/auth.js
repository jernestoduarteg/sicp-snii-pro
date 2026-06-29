SICP.AuthModule = (function() {
  function escape(s) { return SICP.utils.escapeHtml(s); }

  return {
    show: function(app) {
      var isLogged = SICP.auth.isAuthenticated();
      var html;
      if (isLogged) {
        var user = SICP.auth.getUser();
        html = '<p>Conectado como <strong>' + escape(user ? user.email : 'Usuario') + '</strong></p>' +
          '<button class="btn btn-danger" onclick="SICP.auth.signOut();SICP.modal.closeModal();SICP.toast.showToast(\'Sesión cerrada\',\'info\')">Cerrar sesión</button>';
      } else {
        html = '<p class="text-muted mb-16">Inicia sesión para sincronizar tus datos en la nube (requiere Supabase).</p>' +
          '<p class="text-sm text-muted">Sin conexión a Supabase — los datos se guardan localmente en el navegador.</p>' +
          '<button class="btn btn-primary" onclick="SICP.toast.showToast(\'Modo local activo. Los datos se guardan en tu navegador.\',\'info\')">Modo local</button>';
      }
      SICP.modal.showModal('Cuenta', html);
    },

    afterRender: function() {}
  };
})();
