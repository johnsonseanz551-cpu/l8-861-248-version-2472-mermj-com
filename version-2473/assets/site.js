import { SEARCH_INDEX } from "./search-data.js";

function rootPrefix() {
    const path = window.location.pathname.replace(/\\/g, "/");
    if (path.includes("/movie/") || path.includes("/category/")) {
        return "../";
    }
    return "./";
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function renderSearchResults(input, panel, keyword) {
    const prefix = rootPrefix();
    const q = normalizeText(keyword);
    if (q.length < 1) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
    }
    const list = SEARCH_INDEX.filter((item) => {
        return normalizeText(item.title + " " + item.year + " " + item.region + " " + item.type + " " + item.genre + " " + item.category + " " + item.oneLine).includes(q);
    }).slice(0, 10);
    panel.innerHTML = list.map((item) => `
        <a class="search-item" href="${prefix}${item.url}">
            <img src="${prefix}${item.cover}" alt="${item.title}" loading="lazy">
            <span>
                <strong>${item.title}</strong>
                <span>${item.year} · ${item.category} · ${item.rating}</span>
            </span>
        </a>
    `).join("");
    panel.classList.toggle("is-open", list.length > 0);
}

function initGlobalSearch() {
    document.querySelectorAll("[data-global-search]").forEach((input) => {
        const panel = input.parentElement.querySelector(".search-results");
        if (!panel) return;
        input.addEventListener("input", () => renderSearchResults(input, panel, input.value));
        input.addEventListener("focus", () => renderSearchResults(input, panel, input.value));
        document.addEventListener("click", (event) => {
            if (!input.parentElement.contains(event.target)) {
                panel.classList.remove("is-open");
            }
        });
    });
}

function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
        nav.classList.toggle("is-open");
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) return;
    let index = 0;
    let timer = null;
    const show = (next) => {
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };
    const play = () => {
        clearInterval(timer);
        timer = setInterval(() => show(index + 1), 5200);
    };
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            show(i);
            play();
        });
    });
    hero.addEventListener("mouseenter", () => clearInterval(timer));
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
}

function initCardFilter() {
    const filter = document.querySelector("[data-card-filter]");
    if (!filter) return;
    const input = filter.querySelector("[data-filter-keyword]");
    const year = filter.querySelector("[data-filter-year]");
    const type = filter.querySelector("[data-filter-type]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const apply = () => {
        const q = normalizeText(input ? input.value : "");
        const y = year ? year.value : "";
        const t = type ? type.value : "";
        cards.forEach((card) => {
            const text = normalizeText(card.dataset.title + " " + card.dataset.genre + " " + card.dataset.region + " " + card.dataset.tags);
            const okText = !q || text.includes(q);
            const okYear = !y || card.dataset.year === y;
            const okType = !t || card.dataset.type === t;
            card.classList.toggle("is-hidden-by-filter", !(okText && okYear && okType));
        });
    };
    [input, year, type].filter(Boolean).forEach((node) => node.addEventListener("input", apply));
    [year, type].filter(Boolean).forEach((node) => node.addEventListener("change", apply));
}

function initSearchPage() {
    const input = document.querySelector("[data-search-page]");
    const results = document.querySelector("[data-search-page-results]");
    if (!input || !results) return;
    const prefix = rootPrefix();
    const render = () => {
        const q = normalizeText(input.value);
        const list = SEARCH_INDEX.filter((item) => {
            if (!q) return true;
            return normalizeText(item.title + " " + item.year + " " + item.region + " " + item.type + " " + item.genre + " " + item.category + " " + item.oneLine).includes(q);
        }).slice(0, 96);
        results.innerHTML = list.map((item) => `
            <article class="movie-card">
                <a href="${prefix}${item.url}">
                    <div class="movie-card-cover">
                        <img src="${prefix}${item.cover}" alt="${item.title}" loading="lazy">
                        <span class="card-score">${item.rating}</span>
                    </div>
                    <div class="movie-card-body">
                        <h3>${item.title}</h3>
                        <p>${item.oneLine}</p>
                        <div class="card-meta"><span>${item.year}</span><span>${item.category}</span></div>
                    </div>
                </a>
            </article>
        `).join("");
    };
    input.addEventListener("input", render);
    render();
}

document.addEventListener("DOMContentLoaded", () => {
    initGlobalSearch();
    initMenu();
    initHero();
    initCardFilter();
    initSearchPage();
});
