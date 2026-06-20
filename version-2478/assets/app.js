(function () {
  "use strict";

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        restart();
      });
    });

    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-local-search]");
    var select = document.querySelector("[data-type-filter]");
    var cards = all("[data-card]");
    if (!cards.length || (!input && !select)) {
      return;
    }

    if (input && input.hasAttribute("data-query-from-url")) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var typeValue = normalize(select ? select.value : "");
      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search"));
        var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchesType = !typeValue || searchText.indexOf(typeValue) !== -1;
        card.classList.toggle("is-hidden", !(matchesKeyword && matchesType));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(videoId, buttonId, sourceUrl) {
  "use strict";

  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var ready = false;

  if (!video || !button || !sourceUrl) {
    return;
  }

  function prepare() {
    if (ready) {
      return;
    }
    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function hideButton() {
    button.classList.add("is-hidden");
  }

  function play() {
    prepare();
    hideButton();
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  button.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", hideButton);
  prepare();
}
