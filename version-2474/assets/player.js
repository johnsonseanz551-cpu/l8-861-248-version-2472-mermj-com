import { H as Hls } from './hls-vendor.js';

export function initMoviePlayer(videoId, overlayId, streamUrl) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);

    if (!video || !overlay || !streamUrl) {
        return;
    }

    let ready = false;
    let hlsInstance = null;

    const startPlayback = () => {
        if (!ready) {
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            video.controls = true;
            overlay.classList.add('is-hidden');
        }

        video.play().catch(() => {});
    };

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', () => {
        if (!ready) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
