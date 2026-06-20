import { H as Hls } from "./hls-vendor-dru42stk.js";

export function startMoviePage(videoUrl) {
    const video = document.getElementById("movie-video");
    const cover = document.getElementById("player-cover");
    const message = document.getElementById("player-message");
    if (!video || !cover || !videoUrl) return;
    let hls = null;
    let ready = false;
    const showMessage = (text) => {
        if (!message) return;
        message.textContent = text;
        message.classList.add("is-visible");
        window.setTimeout(() => message.classList.remove("is-visible"), 3600);
    };
    const begin = () => {
        cover.classList.add("is-hidden");
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(() => showMessage("轻触播放区域即可继续观看"));
        }
    };
    const setup = () => {
        if (ready) {
            begin();
            return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
            video.addEventListener("loadedmetadata", begin, { once: true });
            video.load();
            return;
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, begin);
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal) {
                    showMessage("播放加载失败，请稍后重试");
                }
            });
            return;
        }
        video.src = videoUrl;
        begin();
    };
    cover.addEventListener("click", setup);
    video.addEventListener("click", () => {
        if (!ready) setup();
    });
    window.addEventListener("pagehide", () => {
        if (hls) hls.destroy();
    });
}
