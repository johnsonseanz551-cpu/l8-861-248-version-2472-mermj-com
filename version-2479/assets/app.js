(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[type='search']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
      });
    });

    var localForm = document.querySelector("[data-local-search]");
    var grid = document.querySelector("[data-filter-grid]");
    var emptyState = document.querySelector("[data-empty-state]");

    if (localForm && grid) {
      var input = localForm.querySelector("input[type='search']");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      if (input && initialQuery) {
        input.value = initialQuery;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search-card]"));

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-text"));
          var matched = !query || text.indexOf(query) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      localForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      applyFilter();
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }
    }
  });
})();
