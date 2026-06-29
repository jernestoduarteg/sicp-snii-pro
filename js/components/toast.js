SICP.toast = (function() {
  var TOAST_TYPES = {
    success: { icon: '✅', bg: '#ecfdf3', border: '#86efac', color: '#067647' },
    error: { icon: '❌', bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' },
    warning: { icon: '⚠️', bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
    info: { icon: 'ℹ️', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' }
  };
  var container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column-reverse;gap:8px;max-width:400px;width:100%;';
      document.body.appendChild(container);
    }
    return container;
  }

  function dismiss(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(40px)';
    setTimeout(function() { el.remove(); }, 300);
  }

  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    var t = TOAST_TYPES[type] || TOAST_TYPES.info;
    var el = document.createElement('div');
    el.style.cssText = 'background:'+t.bg+';border:1px solid '+t.border+';color:'+t.color+';padding:12px 16px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.1);font-size:.88rem;font-weight:500;display:flex;align-items:center;gap:10px;animation:toastIn .25s ease;cursor:pointer;';
    el.innerHTML = '<span>'+t.icon+'</span><span>'+message+'</span>';
    el.onclick = function() { dismiss(el); };
    getContainer().appendChild(el);
    if (duration > 0) setTimeout(function() { dismiss(el); }, duration);
    return el;
  }

  function showConfirm(title, message) {
    return new Promise(function(resolve) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9998;display:flex;align-items:center;justify-content:center;';
      overlay.onclick = function(e) { if (e.target === overlay) { overlay.remove(); resolve(false); }};
      overlay.innerHTML = '<div style="background:#fff;border-radius:16px;padding:24px;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.15)"><h3 style="margin:0 0 8px">'+title+'</h3><p style="color:#667085;margin:0 0 20px;line-height:1.5">'+message+'</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" id="confirm-no">Cancelar</button><button class="btn btn-danger" id="confirm-yes">Confirmar</button></div></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('#confirm-yes').onclick = function() { overlay.remove(); resolve(true); };
      overlay.querySelector('#confirm-no').onclick = function() { overlay.remove(); resolve(false); };
    });
  }

  return { showToast: showToast, showConfirm: showConfirm };
})();
