
import { H as Hls } from './hls-vendor-dru42stk.js';

export function initMoviePlayer(sourceUrl) {
  const player = document.getElementById('movie-player');
  const video = document.getElementById('movie-video');
  const overlay = player ? player.querySelector('.player-overlay-button') : null;
  const status = player ? player.querySelector('.player-status') : null;
  let hls = null;
  let initialized = false;

  if (!player || !video || !overlay || !sourceUrl) {
    return;
  }

  const setStatus = function (message) {
    if (status) {
      status.textContent = message || '';
    }
  };

  const attemptPlay = function () {
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        player.classList.remove('is-loading');
        player.classList.remove('is-playing');
        setStatus('点击播放');
      });
    }
  };

  const loadWithHls = function () {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(sourceUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      player.classList.remove('is-loading');
      setStatus('');
      attemptPlay();
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        player.classList.remove('is-loading');
        player.classList.remove('is-playing');
        setStatus('播放暂时不可用');
      }
    });
  };

  const loadNative = function () {
    video.src = sourceUrl;
    video.addEventListener('loadedmetadata', function () {
      player.classList.remove('is-loading');
      setStatus('');
      attemptPlay();
    }, { once: true });
    video.load();
  };

  const start = function () {
    if (initialized) {
      attemptPlay();
      return;
    }

    initialized = true;
    player.classList.add('is-loading');
    setStatus('正在加载');

    if (Hls.isSupported()) {
      loadWithHls();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      loadNative();
    } else {
      player.classList.remove('is-loading');
      setStatus('当前浏览器无法播放');
    }
  };

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!initialized) {
      start();
    }
  });
  video.addEventListener('play', function () {
    player.classList.add('is-playing');
    setStatus('');
  });
  video.addEventListener('pause', function () {
    if (initialized && !video.ended) {
      player.classList.remove('is-playing');
    }
  });
  video.addEventListener('ended', function () {
    player.classList.remove('is-playing');
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
