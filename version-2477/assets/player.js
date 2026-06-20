(function() {
    function tryPlay(video, cover) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function() {
                window.setTimeout(function() {
                    if (video.paused) {
                        cover.classList.remove("is-hidden");
                    }
                }, 500);
            });
        }
    }

    function prepare(video, url, done) {
        if (video.dataset.ready === "1") {
            done();
            return;
        }
        video.dataset.ready = "1";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.addEventListener("loadedmetadata", done, { once: true });
            video.load();
            window.setTimeout(done, 300);
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, done);
            hls.on(window.Hls.Events.ERROR, function(event, data) {
                if (data && data.fatal) {
                    try {
                        hls.destroy();
                    } catch (error) {}
                    video.src = url;
                    video.load();
                    done();
                }
            });
            window.setTimeout(done, 600);
            return;
        }
        video.src = url;
        video.load();
        window.setTimeout(done, 300);
    }

    function bind(video, cover, url) {
        if (!video || !cover || !url) {
            return;
        }
        function start() {
            cover.classList.add("is-hidden");
            video.controls = true;
            prepare(video, url, function() {
                tryPlay(video, cover);
            });
            window.setTimeout(function() {
                tryPlay(video, cover);
            }, 80);
        }
        cover.addEventListener("click", start);
        video.addEventListener("click", function() {
            if (video.paused) {
                start();
            }
        });
    }

    window.MoviePlayer = {
        bind: bind
    };
})();
