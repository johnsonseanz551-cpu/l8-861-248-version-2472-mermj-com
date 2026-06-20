(function () {
  var loaded = false;
  var hlsInstance = null;

  function attach(video, source) {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function play(video, cover, source) {
    attach(video, source);
    video.controls = true;
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  window.MoviePlayer = {
    init: function (source) {
      var video = document.querySelector("[data-player-video]");
      var cover = document.querySelector("[data-player-trigger]");

      if (!video || !source) {
        return;
      }

      if (cover) {
        cover.addEventListener("click", function () {
          play(video, cover, source);
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play(video, cover, source);
        }
      });
    }
  };
})();
