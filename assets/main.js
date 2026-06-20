(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('.hero-slider');
  if (slider) {
    var slides = all('.hero-slide', slider);
    var dots = all('.hero-dots button', slider);
    var prev = slider.querySelector('.slider-arrow.prev');
    var next = slider.querySelector('.slider-arrow.next');
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

    function auto() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        auto();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        auto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        auto();
      });
    }

    show(0);
    auto();
  }

  all('[data-local-filter]').forEach(function (input) {
    var grid = document.querySelector(input.getAttribute('data-local-filter'));
    if (!grid) {
      return;
    }
    var cards = all('.movie-card', grid);
    var yearSelect = document.querySelector('[data-year-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');

    function runFilter() {
      var keyword = input.value.trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !year || card.getAttribute('data-year') === year;
        var okType = !type || card.getAttribute('data-type') === type;
        card.style.display = okKeyword && okYear && okType ? '' : 'none';
      });
    }

    input.addEventListener('input', runFilter);
    if (yearSelect) {
      yearSelect.addEventListener('change', runFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', runFilter);
    }
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SITE_MOVIES) {
    var keywordInput = searchPage.querySelector('[data-search-input]');
    var yearInput = searchPage.querySelector('[data-search-year]');
    var typeInput = searchPage.querySelector('[data-search-type]');
    var result = searchPage.querySelector('[data-search-result]');

    function optionList(values) {
      return values.filter(Boolean).filter(function (value, index, array) {
        return array.indexOf(value) === index;
      }).sort().map(function (value) {
        return '<option value="' + value.replace(/"/g, '&quot;') + '">' + value + '</option>';
      }).join('');
    }

    if (yearInput) {
      yearInput.innerHTML = '<option value="">全部年份</option>' + optionList(window.SITE_MOVIES.map(function (item) { return item.year; }));
    }
    if (typeInput) {
      typeInput.innerHTML = '<option value="">全部类型</option>' + optionList(window.SITE_MOVIES.map(function (item) { return item.type; }));
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

    function renderCard(movie) {
      return '<a class="movie-card" href="' + escapeHtml(movie.link) + '" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '">' +
        '<span class="poster-wrap">' +
        '<img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="play-chip">▶</span>' +
        '<span class="category-chip">' + escapeHtml(movie.category) + '</span>' +
        '<span class="duration-chip">' + escapeHtml(movie.duration) + '</span>' +
        '</span>' +
        '<strong>' + escapeHtml(movie.title) + '</strong>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<em>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</em>' +
        '</a>';
    }

    function runSearch() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearInput ? yearInput.value : '';
      var type = typeInput ? typeInput.value : '';
      var list = window.SITE_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine, movie.category].join(' ').toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !year || movie.year === year;
        var okType = !type || movie.type === type;
        return okKeyword && okYear && okType;
      }).slice(0, 240);

      if (!list.length) {
        result.innerHTML = '<div class="empty-result">没有找到匹配影片</div>';
        return;
      }
      result.innerHTML = list.map(renderCard).join('');
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', runSearch);
    }
    if (yearInput) {
      yearInput.addEventListener('change', runSearch);
    }
    if (typeInput) {
      typeInput.addEventListener('change', runSearch);
    }
    runSearch();
  }

  all('.player').forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var message = box.parentElement.querySelector('.player-message');
    var src = box.getAttribute('data-video');
    var started = false;
    var hls = null;

    function playVideo() {
      if (!video || !src) {
        if (message) {
          message.textContent = '影片加载失败，请稍后再试';
        }
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(function () {
          if (message) {
            message.textContent = '影片加载失败，请稍后再试';
          }
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            if (message) {
              message.textContent = '影片加载失败，请稍后再试';
            }
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && message) {
            message.textContent = '影片加载失败，请稍后再试';
          }
        });
        return;
      }

      video.src = src;
      video.play().catch(function () {
        if (message) {
          message.textContent = '影片加载失败，请稍后再试';
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          playVideo();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
