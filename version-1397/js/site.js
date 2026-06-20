(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setHero(index, slides, dots) {
    slides.forEach(function(slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        index = Number(dot.getAttribute('data-hero-dot')) || 0;
        setHero(index, slides, dots);
      });
    });
    window.setInterval(function() {
      index = (index + 1) % slides.length;
      setHero(index, slides, dots);
    }, 5000);
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  function uniqueValues(cards, attr) {
    var values = cards.map(function(card) {
      return card.getAttribute(attr) || '';
    }).filter(Boolean);
    return Array.from(new Set(values)).sort(function(a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function(value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupCatalogFilter() {
    var panel = document.querySelector('[data-catalog-filter]');
    if (!panel) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
    var keyword = panel.querySelector('[data-filter-keyword]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var empty = document.querySelector('[data-empty-result]');
    fillSelect(region, uniqueValues(cards, 'data-region'));
    fillSelect(type, uniqueValues(cards, 'data-type'));
    fillSelect(year, uniqueValues(cards, 'data-year'));
    function apply() {
      var q = (keyword.value || '').trim().toLowerCase();
      var r = region.value || '';
      var t = type.value || '';
      var y = year.value || '';
      var visible = 0;
      cards.forEach(function(card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = (!q || text.indexOf(q) !== -1) && (!r || card.getAttribute('data-region') === r) && (!t || card.getAttribute('data-type') === t) && (!y || card.getAttribute('data-year') === y);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    [keyword, region, type, year].forEach(function(control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
  }

  function cardHtml(item) {
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + item.url + '">' +
      '<img src="' + item.poster + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
      '<span class="duration-pill">' + item.duration + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<a class="category-pill" href="' + item.categoryUrl + '">' + item.category + '</a>' +
      '<h3><a href="' + item.url + '">' + item.title + '</a></h3>' +
      '<p>' + item.line + '</p>' +
      '<div class="meta-row"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var input = document.querySelector('[data-search-input]');
    if (!results || !status || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      status.textContent = '请输入关键词开始搜索';
      results.innerHTML = '';
      return;
    }
    var q = query.toLowerCase();
    var matched = window.MOVIE_INDEX.filter(function(item) {
      return item.search.indexOf(q) !== -1;
    }).slice(0, 120);
    status.textContent = '搜索结果：' + query;
    results.innerHTML = matched.length ? matched.map(cardHtml).join('') : '<div class="empty-result is-visible">没有匹配的影片</div>';
  }

  ready(function() {
    setupHero();
    setupMenu();
    setupCatalogFilter();
    setupSearchPage();
  });
}());
