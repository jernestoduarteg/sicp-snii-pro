SICP.utils = {
  escapeHtml: function(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },
  copyText: function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function() { SICP.utils._fallbackCopy(text); });
    } else {
      SICP.utils._fallbackCopy(text);
    }
  },
  _fallbackCopy: function(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  },
  generarId: function() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },
  formatDate: function(d) {
    if (!d) return '';
    var dt = typeof d === 'string' ? new Date(d) : d;
    return dt.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  debounce: function(fn, ms) {
    var timer;
    return function() {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, ms || 300);
    };
  },
  todayISO: function() {
    return new Date().toISOString().slice(0, 10);
  },
  spinner: function(text) {
    text = text || 'Cargando...';
    return '<div class="spinner-wrap" style="display:flex;align-items:center;gap:10px;padding:16px 0"><div class="spinner" style="width:20px;height:20px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spinner-rotate .6s linear infinite"></div><span class="text-sm text-muted">' + SICP.utils.escapeHtml(text) + '</span></div>';
  }
};
