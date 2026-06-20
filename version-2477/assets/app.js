(function() {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function bindMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function() {
            menu.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = all("[data-hero-slide]", hero);
        var dots = all("[data-hero-dot]", hero);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    function bindFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var cards = all("[data-card]");
        var searchInput = panel.querySelector("[data-local-search]");
        var typeSelect = panel.querySelector('[data-filter-select="type"]');
        var yearSelect = panel.querySelector('[data-filter-select="year"]');
        var tagButtons = all("[data-filter-value]", panel);
        var genreValue = "";

        function textOf(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.textContent
            ].join(" ").toLowerCase();
        }

        function update() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            cards.forEach(function(card) {
                var ok = true;
                if (query && textOf(card).indexOf(query) === -1) {
                    ok = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    ok = false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    ok = false;
                }
                if (genreValue && textOf(card).indexOf(genreValue.toLowerCase()) === -1) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", update);
        }
        if (typeSelect) {
            typeSelect.addEventListener("change", update);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", update);
        }
        tagButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                genreValue = button.getAttribute("data-filter-value") || "";
                tagButtons.forEach(function(item) {
                    item.classList.toggle("is-active", item === button);
                });
                update();
            });
        });
    }

    function cardHtml(item) {
        var tags = (item.tags || []).slice(0, 3).map(function(tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            '<article class="movie-card">',
            '<a class="movie-poster" href="' + escapeHtml(item.url) + '">',
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</div>',
            '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function bindSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = page.querySelector("[data-search-input]");
        var results = page.querySelector("[data-search-results]");
        if (input) {
            input.value = query;
        }

        function render(term) {
            var needle = term.trim().toLowerCase();
            var list = window.SEARCH_INDEX.filter(function(item) {
                if (!needle) {
                    return true;
                }
                return [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(" "), item.oneLine].join(" ").toLowerCase().indexOf(needle) !== -1;
            }).slice(0, 120);
            if (!list.length) {
                results.innerHTML = '<div class="search-empty">没有找到相关影片，请尝试其他片名、年份、地区或题材。</div>';
                return;
            }
            results.innerHTML = list.map(cardHtml).join("");
        }

        render(query);
        if (input) {
            input.addEventListener("input", function() {
                render(input.value);
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        bindMenu();
        bindHero();
        bindFilters();
        bindSearchPage();
    });
})();
