
import { H as Stream } from './hls-vendor-DrU42sTK.js';

export function initVideoPlayer(videoId, buttonId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    const nativeType = 'application/vnd.apple.mpegurl';

    if (video.canPlayType(nativeType)) {
      video.src = streamUrl;
      return;
    }

    if (Stream && Stream.isSupported()) {
      const engine = new Stream({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      engine.loadSource(streamUrl);
      engine.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  async function startPlayback() {
    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  }

  attachStream();

  if (button) {
    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
}
