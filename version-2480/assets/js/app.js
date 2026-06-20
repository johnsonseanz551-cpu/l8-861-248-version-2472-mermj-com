(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getQuery(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</p>' +
      '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  ready(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (menuButton && menu) {
      menuButton.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      if (!slides.length) {
        return;
      }
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5000);
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('[data-video]');
      var button = player.querySelector('[data-play-button]');
      var source = player.getAttribute('data-source');
      var hlsInstance = null;
      var started = false;
      function start() {
        if (!video || !source) {
          return;
        }
        if (!started) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            video.src = source;
          }
          started = true;
        }
        if (button) {
          button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          start();
        });
      }
      player.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('video')) {
          return;
        }
        start();
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });

    var filterInput = document.querySelector('[data-movie-filter-input]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var filterList = document.querySelector('[data-filter-list]');
    if (filterInput && filterList) {
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
      function applyFilter() {
        var keyword = normalize(filterInput.value);
        var category = categoryFilter ? categoryFilter.value : '';
        cards.forEach(function (card) {
          var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year'));
          var cardCategory = card.getAttribute('data-category') || '';
          var matchedText = !keyword || text.indexOf(keyword) !== -1;
          var matchedCategory = !category || cardCategory === category;
          card.classList.toggle('is-hidden-card', !(matchedText && matchedCategory));
        });
      }
      filterInput.addEventListener('input', applyFilter);
      if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilter);
      }
    }

    var searchResults = document.querySelector('[data-search-results]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchHint = document.querySelector('[data-search-hint]');
    var searchForm = document.querySelector('[data-search-page-form]');
    if (searchResults && window.MOVIE_SEARCH_INDEX) {
      var initial = getQuery('q');
      if (searchInput) {
        searchInput.value = initial;
      }
      function renderSearch(keyword) {
        var q = normalize(keyword);
        searchResults.innerHTML = '';
        if (!q) {
          if (searchHint) {
            searchHint.textContent = '请输入关键词查看匹配影片。';
          }
          return;
        }
        var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
          var text = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' '));
          return text.indexOf(q) !== -1;
        }).slice(0, 120);
        if (searchHint) {
          searchHint.textContent = matched.length ? '以下是匹配影片。' : '没有找到匹配影片。';
        }
        if (!matched.length) {
          searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片。</div>';
          return;
        }
        searchResults.innerHTML = matched.map(createCard).join('');
      }
      renderSearch(initial);
      if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
          event.preventDefault();
          var value = searchInput ? searchInput.value.trim() : '';
          var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
          window.history.replaceState({}, '', url);
          renderSearch(value);
        });
      }
      if (searchInput) {
        searchInput.addEventListener('input', function () {
          renderSearch(searchInput.value);
        });
      }
    }
  });
})();
