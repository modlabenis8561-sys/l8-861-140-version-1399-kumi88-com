function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function initMobileNav() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function initSearchForms() {
  const forms = document.querySelectorAll("[data-search-form]");
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const target = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
      window.location.href = target;
    });
  });
}

function initHero() {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }

  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      show(dotIndex);
      start();
    });
  });

  show(0);
  start();
}

function initCatalogFilters() {
  const blocks = document.querySelectorAll("[data-filter-block]");
  blocks.forEach((block) => {
    const input = block.querySelector("[data-filter-input]");
    const select = block.querySelector("[data-filter-select]");
    const cards = Array.from(block.querySelectorAll("[data-movie-card]"));
    const empty = block.querySelector("[data-empty-state]");

    const apply = () => {
      const query = normalizeText(input ? input.value : "");
      const year = select ? select.value : "";
      let shown = 0;

      cards.forEach((card) => {
        const haystack = normalizeText([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.category,
          card.dataset.year
        ].join(" "));
        const yearMatches = !year || card.dataset.year === year;
        const queryMatches = !query || haystack.includes(query);
        const visible = yearMatches && queryMatches;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("visible", shown === 0);
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }

    const urlQuery = new URLSearchParams(window.location.search).get("q");
    if (urlQuery && input) {
      input.value = urlQuery;
    }

    apply();
  });
}

export async function initMoviePlayer(streamUrl) {
  const video = document.querySelector("[data-player-video]");
  const overlay = document.querySelector("[data-player-overlay]");
  const playButton = document.querySelector("[data-player-button]");
  if (!video || !streamUrl) {
    return;
  }

  let loaded = false;
  let hlsInstance = null;

  const loadVideo = async () => {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      loaded = true;
      return;
    }

    const module = await import("./hls-vendor-dru42stk.js");
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      loaded = true;
      return;
    }

    video.src = streamUrl;
    loaded = true;
  };

  const startPlayback = async () => {
    await loadVideo();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  };

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }
  if (playButton) {
    playButton.addEventListener("click", (event) => {
      event.stopPropagation();
      startPlayback();
    });
  }
  video.addEventListener("click", () => {
    if (video.paused) {
      startPlayback();
    }
  });
  window.addEventListener("beforeunload", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

ready(() => {
  initMobileNav();
  initSearchForms();
  initHero();
  initCatalogFilters();
});
