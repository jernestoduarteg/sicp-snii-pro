SICP.modal = (function() {
  var modalOverlay = null;

  function showModal(title, contentHtml, opts) {
    opts = opts || {};
    closeModal();
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);';
    modalOverlay.onclick = function(e) { if (e.target === modalOverlay) closeModal(); };
    modalOverlay.innerHTML = '<div class="modal" style="max-width:'+(opts.wide ? '840px' : '560px')+';width:92%"><div class="modal-header"><h3 style="margin:0;font-size:1.05rem">'+title+'</h3><button class="btn-close" id="modal-close-btn">&times;</button></div><div class="modal-body">'+contentHtml+'</div></div>';
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close-btn').onclick = closeModal;
    document.addEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') closeModal();
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.remove();
      modalOverlay = null;
    }
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }

  return { showModal: showModal, closeModal: closeModal };
})();
