(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", mobile.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-section");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
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
      }, 5200);
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

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
    if (!lists.length) {
      return;
    }
    var input = document.querySelector(".movie-search-input");
    var typeSelect = document.querySelector(".movie-type-select");
    var regionSelect = document.querySelector(".movie-region-select");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function activeChipValue() {
      var selected = chips.find(function (chip) {
        return chip.classList.contains("is-active");
      });
      return selected ? normalize(selected.getAttribute("data-filter-value")) : "";
    }

    function apply() {
      var query = input ? normalize(input.value) : "";
      var typeValue = typeSelect ? normalize(typeSelect.value) : "";
      var regionValue = regionSelect ? normalize(regionSelect.value) : "";
      var chipValue = activeChipValue();
      lists.forEach(function (list) {
        Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item")).forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
          var typeText = normalize(card.getAttribute("data-type"));
          var regionText = normalize(card.getAttribute("data-region"));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = !typeValue || typeText.indexOf(typeValue) !== -1;
          var matchesRegion = !regionValue || regionText.indexOf(regionValue) !== -1;
          var matchesChip = !chipValue || haystack.indexOf(chipValue) !== -1;
          card.classList.toggle("hidden-by-filter", !(matchesQuery && matchesType && matchesRegion && matchesChip));
        });
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", apply);
    }
    if (regionSelect) {
      regionSelect.addEventListener("change", apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        apply();
      });
    });
    apply();
  }

  function initPlayer() {
    var shell = document.querySelector(".player-shell");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    if (!video || !cover) {
      return;
    }
    var hlsUrl = video.getAttribute("data-hls-url");
    var hlsInstance = null;

    function playVideo() {
      if (!hlsUrl) {
        return;
      }
      cover.classList.add("is-hidden");
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = hlsUrl;
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(hlsUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (!video.src) {
        video.src = hlsUrl;
      }
      video.play().catch(function () {});
    }

    cover.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
  });
})();
