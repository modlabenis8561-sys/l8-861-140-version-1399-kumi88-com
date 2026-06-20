(function () {
  function each(selector, callback, root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), callback);
  }

  function toggleMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.site-hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) return;
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === active);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
      });
    });

    show(0);
    window.setInterval(function () {
      show(active + 1);
    }, 5600);
  }

  function setupScrollers() {
    each('[data-scroll-target]', function (button) {
      button.addEventListener('click', function () {
        var target = document.querySelector(button.getAttribute('data-scroll-target'));
        if (!target) return;
        var direction = button.getAttribute('data-direction') === 'prev' ? -1 : 1;
        target.scrollBy({ left: direction * 420, behavior: 'smooth' });
      });
    });
  }

  function setupLibrary() {
    var library = document.querySelector('[data-library]');
    if (!library) return;
    var cards = Array.prototype.slice.call(library.querySelectorAll('.movie-card'));
    var search = document.querySelector('[data-filter-search]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

    function normalized(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalized(search ? search.value : '');
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter')] = normalized(select.value);
      });

      cards.forEach(function (card) {
        var haystack = normalized(card.getAttribute('data-search'));
        var visible = !query || haystack.indexOf(query) !== -1;
        Object.keys(filters).forEach(function (key) {
          var value = filters[key];
          if (!value) return;
          var current = normalized(card.getAttribute('data-' + key));
          if (current.indexOf(value) === -1) visible = false;
        });
        card.classList.toggle('is-hidden', !visible);
      });
    }

    if (search) {
      search.addEventListener('input', applyFilters);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) search.value = q;
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    each('[data-view]', function (button) {
      button.addEventListener('click', function () {
        var mode = button.getAttribute('data-view');
        library.classList.toggle('is-list', mode === 'list');
        each('[data-view]', function (other) {
          other.classList.toggle('is-active', other === button);
        });
      });
    });

    applyFilters();
  }

  function setupPlayer() {
    var video = document.querySelector('[data-stream]');
    if (!video) return;
    var overlay = document.querySelector('.player-overlay');
    var button = document.querySelector('.player-button');
    var stream = video.getAttribute('data-stream');
    var ready = false;

    function prepare() {
      if (ready || !stream) return;
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function start() {
      prepare();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) start();
    });
    video.addEventListener('play', function () {
      if (overlay) overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (overlay) overlay.classList.remove('is-hidden');
    });
    video.addEventListener('loadedmetadata', function () {
      if (overlay && !video.paused) overlay.classList.add('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileMenu();
    setupHero();
    setupScrollers();
    setupLibrary();
    setupPlayer();
  });
})();
