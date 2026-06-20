
(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let currentIndex = 0;
  let timer = null;

  function activateHero(index) {
    if (!slides.length) {
      return;
    }

    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentIndex);
    });
  }

  function scheduleHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        activateHero(currentIndex + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = Number(dot.getAttribute('data-hero-index') || '0');
      activateHero(index);
      scheduleHero();
    });
  });

  activateHero(0);
  scheduleHero();
})();
