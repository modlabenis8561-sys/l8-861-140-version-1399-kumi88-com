function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
        return;
    }
    callback();
}

ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-fallback');
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
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
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach(function (panel) {
        var scope = panel.closest('[data-filter-scope]') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-movie-card'));
        var searchInput = panel.querySelector('[data-filter-search]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var resetButton = panel.querySelector('[data-filter-reset]');
        var emptyState = scope.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normalize(searchInput && searchInput.value);
            var typeValue = normalize(typeSelect && typeSelect.value);
            var yearValue = normalize(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var isVisible = matchesKeyword && matchesType && matchesYear;

                card.style.display = isVisible ? '' : 'none';

                if (isVisible) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                applyFilter();
            });
        }

        var parameters = new URLSearchParams(window.location.search);
        var query = parameters.get('q');

        if (query && searchInput) {
            searchInput.value = query;
        }

        applyFilter();
    });
});
