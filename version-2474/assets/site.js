const mobileButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');

if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        mobileButton.setAttribute('aria-expanded', String(isOpen));
    });
}

const hero = document.querySelector('[data-hero-carousel]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;

    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.slide || 0));
        });
    });

    if (slides.length > 1) {
        window.setInterval(() => {
            showSlide(current + 1);
        }, 6500);
    }
}

const redirectToSearch = (query) => {
    const text = query.trim();
    const url = text ? `./movies.html?q=${encodeURIComponent(text)}` : './movies.html';
    window.location.href = url;
};

document.querySelectorAll('.global-search-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = form.querySelector('input[name="q"]');
        redirectToSearch(input ? input.value : '');
    });
});

const localInput = document.querySelector('[data-local-search]');
const movieList = document.querySelector('#movie-list');
const yearButtons = Array.from(document.querySelectorAll('[data-filter-year]'));
let selectedYear = '';

const filterCards = () => {
    if (!localInput || !movieList) {
        return;
    }

    const query = localInput.value.trim().toLowerCase();
    const cards = Array.from(movieList.querySelectorAll('[data-movie-card]'));

    cards.forEach((card) => {
        const haystack = [
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.year,
            card.dataset.category
        ].join(' ').toLowerCase();
        const matchedQuery = !query || haystack.includes(query);
        const matchedYear = !selectedYear || card.dataset.year === selectedYear;
        card.classList.toggle('is-hidden', !(matchedQuery && matchedYear));
    });
};

if (localInput && movieList) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery) {
        localInput.value = initialQuery;
    }

    localInput.addEventListener('input', filterCards);
    filterCards();
}

yearButtons.forEach((button) => {
    button.addEventListener('click', () => {
        selectedYear = button.dataset.filterYear || '';
        yearButtons.forEach((item) => item.classList.toggle('is-active', item === button));
        filterCards();
    });
});
