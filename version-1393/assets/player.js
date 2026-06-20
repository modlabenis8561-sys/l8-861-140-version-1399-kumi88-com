import { H as Hls } from './video-vendor-dru42stk.js';

export function initMoviePlayer(videoUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var buttons = document.querySelectorAll('[data-play-button]');
    var loaded = false;
    var hls = null;

    if (!video || !videoUrl) {
        return;
    }

    function loadVideo() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = videoUrl;
    }

    function startPlayback() {
        loadVideo();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.setAttribute('controls', 'controls');

        var playback = video.play();

        if (playback && typeof playback.catch === 'function') {
            playback.catch(function () {
                video.setAttribute('controls', 'controls');
            });
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', startPlayback);
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
