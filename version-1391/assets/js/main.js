(function () {
    var body = document.body;
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            body.classList.toggle('is-menu-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showHero(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showHero(current + 1);
            }, 5000);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                showHero(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showHero(current + 1);
                startHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showHero(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        showHero(0);
        startHero();
    }

    var siteSearch = document.querySelector('[data-site-search]');

    if (siteSearch) {
        siteSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = siteSearch.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = './categories.html';

            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }

            window.location.href = target;
        });
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var filterInput = filterPanel.querySelector('[data-filter-input]');
        var filterSelects = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-select]'));
        var clearButton = filterPanel.querySelector('[data-filter-clear]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';

        if (filterInput && queryValue) {
            filterInput.value = queryValue;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(filterInput ? filterInput.value : '');
            var filters = {};
            var visible = 0;

            filterSelects.forEach(function (select) {
                filters[select.getAttribute('data-filter-select')] = select.value;
            });

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !filters.region || card.getAttribute('data-region') === filters.region;
                var matchYear = !filters.year || card.getAttribute('data-year') === filters.year;
                var matchType = !filters.type || card.getAttribute('data-type') === filters.type;
                var matched = matchKeyword && matchRegion && matchYear && matchType;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        if (filterInput) {
            filterInput.addEventListener('input', applyFilter);
        }

        filterSelects.forEach(function (select) {
            select.addEventListener('change', applyFilter);
        });

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (filterInput) {
                    filterInput.value = '';
                }

                filterSelects.forEach(function (select) {
                    select.value = '';
                });

                applyFilter();
            });
        }

        applyFilter();
    }

    var player = document.querySelector('[data-hls]');
    var playButton = document.querySelector('[data-play-trigger]');

    if (player) {
        var streamUrl = player.getAttribute('data-hls');
        var hasStarted = false;
        var hlsInstance = null;

        function beginPlayback() {
            if (!streamUrl) {
                return;
            }

            if (!hasStarted) {
                hasStarted = true;
                player.setAttribute('controls', 'controls');

                if (player.canPlayType('application/vnd.apple.mpegurl')) {
                    player.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(player);
                } else {
                    player.src = streamUrl;
                }
            }

            if (playButton) {
                playButton.classList.add('is-hidden');
            }

            var playPromise = player.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (playButton) {
            playButton.addEventListener('click', beginPlayback);
        }

        player.addEventListener('click', function () {
            if (!hasStarted) {
                beginPlayback();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
