function initMoviePlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var cover = document.querySelector('.player-cover');
  var hlsInstance = null;

  if (!video || !cover || !streamUrl) {
    return;
  }

  function attachStream() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    video.setAttribute('data-ready', '1');
  }

  function playVideo() {
    attachStream();
    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  cover.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.getAttribute('data-ready') !== '1') {
      playVideo();
    }
  });
  video.addEventListener('ended', function () {
    if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
      hlsInstance.stopLoad();
    }
  });
}
