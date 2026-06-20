(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");

    if (header && toggle) {
        toggle.addEventListener("click", function () {
            var open = header.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;
    var timer = null;

    function showSlide(next) {
        if (!slides.length) {
            return;
        }

        activeSlide = (next + slides.length) % slides.length;

        slides.forEach(function (slide, index) {
            slide.classList.toggle("is-active", index === activeSlide);
        });

        dots.forEach(function (dot, index) {
            dot.classList.toggle("is-active", index === activeSlide);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            window.clearInterval(timer);
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            startHero();
        });
    });

    startHero();

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupLocalFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

        panels.forEach(function (panel) {
            var input = panel.querySelector(".local-filter");
            var grid = panel.nextElementSibling;

            if (!grid || !grid.classList.contains("filter-grid")) {
                grid = document.querySelector(".filter-grid");
            }

            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

            function applyFilter() {
                var query = normalize(input ? input.value : "");

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-keywords")
                    ].join(" "));

                    card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
                });
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            panel.querySelectorAll("[data-sort]").forEach(function (button) {
                button.addEventListener("click", function () {
                    var sortKey = button.getAttribute("data-sort");
                    panel.querySelectorAll("[data-sort]").forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });

                    cards.sort(function (a, b) {
                        var av = Number(a.getAttribute("data-" + sortKey)) || 0;
                        var bv = Number(b.getAttribute("data-" + sortKey)) || 0;
                        return bv - av;
                    });

                    cards.forEach(function (card) {
                        grid.appendChild(card);
                    });
                });
            });
        });
    }

    setupLocalFilters();

    function renderSearch() {
        var index = window.SEARCH_INDEX || [];
        var results = document.getElementById("searchResults");
        var status = document.getElementById("searchStatus");
        var input = document.getElementById("searchInput");

        if (!results || !status || !input) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function card(movie) {
            return [
                '<a class="movie-card" href="' + movie.url + '" data-title="' + movie.title.replace(/"/g, '&quot;') + '">',
                '    <span class="cover-wrap">',
                '        <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
                '        <span class="card-badge">' + movie.category + '</span>',
                '        <span class="card-duration">' + movie.duration + '</span>',
                '        <span class="card-play">▶</span>',
                '    </span>',
                '    <span class="card-content">',
                '        <strong>' + movie.title + '</strong>',
                '        <em>' + movie.description + '</em>',
                '        <span class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.rating + '分</span></span>',
                '    </span>',
                '</a>'
            ].join("");
        }

        function runSearch() {
            var q = normalize(input.value);

            if (!q) {
                status.textContent = "输入关键词即可浏览相关影片。";
                results.innerHTML = "";
                return;
            }

            var matched = index.filter(function (movie) {
                return normalize(movie.search).indexOf(q) !== -1;
            }).slice(0, 96);

            status.textContent = matched.length ? "已找到相关影片。" : "没有找到相关影片，请尝试其他关键词。";
            results.innerHTML = matched.map(card).join("");
        }

        input.addEventListener("input", runSearch);
        runSearch();
    }

    renderSearch();

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));

        players.forEach(function (player) {
            var source = player.getAttribute("data-src");
            var video = player.querySelector("video");
            var start = player.querySelector(".player-start");
            var hls = null;

            if (!source || !video || !start) {
                return;
            }

            function loadSource() {
                if (video.getAttribute("data-ready") === "true") {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }

                video.setAttribute("data-ready", "true");
            }

            function play() {
                loadSource();
                player.classList.add("is-playing");
                video.controls = true;

                var playTask = video.play();

                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {
                        video.controls = true;
                    });
                }
            }

            start.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });

            player.addEventListener("click", function (event) {
                if (event.target === video || player.classList.contains("is-playing")) {
                    return;
                }

                play();
            });

            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    setupPlayers();
})();
