(function () {
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var panel = document.getElementById('searchPanel');
  var input = document.getElementById('globalSearchInput');
  var results = document.getElementById('globalSearchResults');
  var closeButton = document.querySelector('.search-close');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.search-trigger'));
  var quickInput = document.querySelector('.quick-search-input');
  var quickButton = document.querySelector('.quick-search-button');

  function openSearch(value) {
    if (!panel || !input) {
      return;
    }
    panel.hidden = false;
    input.value = value || '';
    window.setTimeout(function () {
      input.focus();
      renderSearch(input.value);
    }, 20);
  }

  function closeSearch() {
    if (panel) {
      panel.hidden = true;
    }
  }

  function fields(item) {
    return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase();
  }

  function renderSearch(query) {
    if (!results) {
      return;
    }
    var list = window.SiteMovieList || [];
    var text = (query || '').trim().toLowerCase();
    var matched = text
      ? list.filter(function (item) {
          return fields(item).indexOf(text) !== -1;
        }).slice(0, 24)
      : list.slice(0, 12);

    if (!matched.length) {
      results.innerHTML = '<div class="empty-tip">没有找到匹配影片</div>';
      return;
    }

    results.innerHTML = matched.map(function (item) {
      return [
        '<a class="search-result-item" href="' + item.link + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
        '<div>',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<span>' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year) + '</span>',
        '</div>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  triggers.forEach(function (button) {
    button.addEventListener('click', function () {
      openSearch('');
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeSearch);
  }

  if (panel) {
    panel.addEventListener('click', function (event) {
      if (event.target === panel) {
        closeSearch();
      }
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      renderSearch(input.value);
    });
  }

  if (quickButton && quickInput) {
    quickButton.addEventListener('click', function () {
      openSearch(quickInput.value);
    });
    quickInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        openSearch(quickInput.value);
      }
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterYear = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-title]'));

  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var q = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var t = filterType ? filterType.value : '';
    var y = filterYear ? filterYear.value : '';

    cards.forEach(function (card) {
      var text = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ').toLowerCase();
      var ok = (!q || text.indexOf(q) !== -1) && (!t || card.dataset.type === t) && (!y || card.dataset.year === y);
      card.style.display = ok ? '' : 'none';
    });
  }

  [filterInput, filterType, filterYear].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });
})();
