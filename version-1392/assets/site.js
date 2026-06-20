document.addEventListener("DOMContentLoaded", function () {
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            var value = input ? input.value.trim() : "";
            if (!value) {
                event.preventDefault();
                window.location.href = "search.html";
            }
        });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 4800);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    });

    document.querySelectorAll("[data-scroll-wrap]").forEach(function (wrap) {
        var row = wrap.querySelector("[data-scroll-row]");
        var left = wrap.querySelector("[data-scroll-left]");
        var right = wrap.querySelector("[data-scroll-right]");

        if (!row) {
            return;
        }

        if (left) {
            left.addEventListener("click", function () {
                row.scrollBy({ left: -420, behavior: "smooth" });
            });
        }

        if (right) {
            right.addEventListener("click", function () {
                row.scrollBy({ left: 420, behavior: "smooth" });
            });
        }
    });

    document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
        var section = bar.closest("section");
        var input = bar.querySelector("[data-filter-input]");
        var year = bar.querySelector("[data-filter-year]");
        var type = bar.querySelector("[data-filter-type]");
        var category = bar.querySelector("[data-filter-category]");
        var count = bar.querySelector("[data-filter-count]");
        var list = section ? section.querySelector("[data-filter-list]") : null;
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";

        if (input && q) {
            input.value = q;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var yearValue = normalize(year ? year.value : "");
            var typeValue = normalize(type ? type.value : "");
            var categoryValue = normalize(category ? category.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.textContent + " " + card.dataset.title + " " + card.dataset.tags + " " + card.dataset.category + " " + card.dataset.year + " " + card.dataset.type);
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (yearValue && normalize(card.dataset.year) !== yearValue) {
                    matched = false;
                }
                if (typeValue && normalize(card.dataset.type) !== typeValue) {
                    matched = false;
                }
                if (categoryValue && normalize(card.dataset.category) !== categoryValue) {
                    matched = false;
                }

                card.classList.toggle("hidden-card", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + " 部影片";
            }
        }

        [input, year, type, category].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });

        apply();
    });
});
