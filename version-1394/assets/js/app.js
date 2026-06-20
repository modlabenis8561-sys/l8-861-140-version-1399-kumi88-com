(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var nextButton = hero.querySelector("[data-hero-next]");
    var prevButton = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupHorizontalScroll() {
    var row = document.querySelector("[data-scroll-row]");
    var left = document.querySelector("[data-scroll-left]");
    var right = document.querySelector("[data-scroll-right]");
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
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    if (!cards.length) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var year = document.querySelector("[data-year-filter]");
    var type = document.querySelector("[data-type-filter]");
    var empty = document.querySelector("[data-empty-message]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input ? input.value : "");
      var selectedYear = normalize(year ? year.value : "");
      var selectedType = normalize(type ? type.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        if (selectedType && cardType !== selectedType) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    if (!players.length) {
      return;
    }

    players.forEach(function (player) {
      var video = player.querySelector("video[data-hls]");
      var cover = player.querySelector("[data-cover]");
      var buttons = Array.prototype.slice.call(player.querySelectorAll("[data-play-button]"));
      if (!video) {
        return;
      }
      var url = video.getAttribute("data-hls");
      var loaded = false;
      var hls = null;

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      function loadAndPlay() {
        if (!url) {
          return;
        }
        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
              hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            }
          } else {
            video.src = url;
          }
          loaded = true;
        }
        if (cover) {
          cover.classList.add("hidden");
        }
        video.controls = true;
        playVideo();
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", loadAndPlay);
      });

      if (cover && buttons.indexOf(cover) === -1) {
        cover.addEventListener("click", loadAndPlay);
      }

      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          loadAndPlay();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupHorizontalScroll();
    setupFilters();
    setupPlayers();
  });
})();
