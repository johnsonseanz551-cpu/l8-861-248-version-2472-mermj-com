(function() {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase().trim();
  }

  var searchInput = document.querySelector('[data-card-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var activeType = '全部';

  function applyFilter() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type')
      ].join(' '));
      var typeText = card.getAttribute('data-type') || '';
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchType = activeType === '全部' || typeText.indexOf(activeType) !== -1;
      card.style.display = matchKeyword && matchType ? '' : 'none';
    });
  }

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
    searchInput.addEventListener('input', applyFilter);
  }

  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
  if (buttons.length) {
    buttons.forEach(function(button, i) {
      if (i === 0) {
        button.classList.add('is-active');
      }
      button.addEventListener('click', function() {
        buttons.forEach(function(item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeType = button.getAttribute('data-filter-type') || '全部';
        applyFilter();
      });
    });
  }

  if (cards.length) {
    applyFilter();
  }
}());
