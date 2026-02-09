(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function initMobileMenu() {
    var toggle = qs('[data-nav-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) return;

    function setOpen(next) {
      menu.classList.toggle('is-open', next);
      toggle.setAttribute('aria-expanded', String(next));
    }

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.contains('is-open');
      setOpen(!isOpen);
    });

    qsa('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        setOpen(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });
  }

  function initReveals() {
    var items = qsa('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );

    items.forEach(function (el) {
      io.observe(el);
    });
  }

  function initCopyButtons() {
    qsa('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var text = btn.getAttribute('data-copy') || '';
        if (!text) return;

        try {
          await navigator.clipboard.writeText(text);
          var prev = btn.textContent;
          btn.textContent = 'Copied';
          setTimeout(function () {
            btn.textContent = prev;
          }, 1200);
        } catch (e) {
          // Fallback: select a temporary input.
          var input = document.createElement('input');
          input.value = text;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initReveals();
    initCopyButtons();
  });
})();
