
(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.slide));
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const list = document.querySelector('[data-filter-list]');
    const cards = Array.from(list ? list.querySelectorAll('.movie-card') : []);
    const keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const regionSelect = filterPanel.querySelector('[data-filter-region]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const resetButton = filterPanel.querySelector('[data-filter-reset]');
    const countNode = document.querySelector('[data-filter-count]');

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const applyFilter = function () {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const region = normalize(regionSelect ? regionSelect.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(' '));
        const matchesKeyword = !keyword || text.includes(keyword);
        const matchesYear = !year || normalize(card.dataset.year) === year;
        const matchesRegion = !region || normalize(card.dataset.region) === region;
        const matchesType = !type || normalize(card.dataset.type) === type;
        const shouldShow = matchesKeyword && matchesYear && matchesRegion && matchesType;

        card.classList.toggle('hidden-by-filter', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '显示 ' + visible + ' 部影片';
      }
    };

    [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) keywordInput.value = '';
        if (yearSelect) yearSelect.value = '';
        if (regionSelect) regionSelect.value = '';
        if (typeSelect) typeSelect.value = '';
        applyFilter();
      });
    }

    applyFilter();
  }

  const searchResults = document.querySelector('[data-search-results]');
  const searchSummary = document.querySelector('[data-search-summary]');

  if (searchResults && searchSummary) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    const pageSearchInput = document.querySelector('.page-search-form input[name="q"]');

    if (pageSearchInput) {
      pageSearchInput.value = initialQuery;
    }

    const escapeHtml = function (value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const cardTemplate = function (movie) {
      return [
        '<article class="movie-card">',
        '  <a class="card-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="duration-pill">' + escapeHtml(movie.duration) + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a class="category-pill" href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="card-meta">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('\n');
    };

    const runSearch = function (query) {
      const q = normalize(query);
      const movies = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];

      if (!q) {
        searchResults.innerHTML = '';
        searchSummary.textContent = '请输入关键词开始搜索。';
        return;
      }

      const terms = q.split(/\s+/).filter(Boolean);
      const results = movies.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));

        return terms.every(function (term) {
          return haystack.includes(term);
        });
      });

      searchSummary.textContent = '关键词“' + query + '”共找到 ' + results.length + ' 部影片。';
      searchResults.innerHTML = results.slice(0, 240).map(cardTemplate).join('\n');
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        runSearch(initialQuery);
      });
    } else {
      runSearch(initialQuery);
    }
  }
})();
