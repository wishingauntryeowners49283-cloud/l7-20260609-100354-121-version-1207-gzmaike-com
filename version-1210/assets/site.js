(function() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let activeIndex = 0;
        let timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function start() {
            timer = window.setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                if (timer) {
                    window.clearInterval(timer);
                }
                showSlide(index);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    const homeSearch = document.querySelector("[data-home-search]");

    if (homeSearch) {
        homeSearch.addEventListener("submit", function(event) {
            event.preventDefault();
            const input = homeSearch.querySelector("input[name='q']");
            const query = input ? input.value.trim() : "";
            const suffix = query ? "?q=" + encodeURIComponent(query) : "";
            window.location.href = "./search.html" + suffix;
        });
    }

    const filterPanel = document.querySelector("[data-filter-panel]");
    const cardList = document.querySelector("[data-card-list]");

    if (filterPanel && cardList) {
        const input = filterPanel.querySelector("[data-filter-input]");
        const region = filterPanel.querySelector("[data-filter-region]");
        const type = filterPanel.querySelector("[data-filter-type]");
        const year = filterPanel.querySelector("[data-filter-year]");
        const emptyState = document.querySelector("[data-empty-state]");
        const cards = Array.from(cardList.querySelectorAll("[data-movie-card]"));
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function includes(value, target) {
            return !target || String(value || "").toLowerCase().includes(String(target || "").toLowerCase());
        }

        function applyFilters() {
            const query = input ? input.value.trim().toLowerCase() : "";
            const regionValue = region ? region.value : "";
            const typeValue = type ? type.value : "";
            const yearValue = year ? year.value : "";
            let visible = 0;

            cards.forEach(function(card) {
                const text = (card.dataset.searchText || card.textContent || "").toLowerCase();
                const matched = includes(text, query)
                    && includes(card.dataset.region, regionValue)
                    && includes(card.dataset.type, typeValue)
                    && includes(card.dataset.year, yearValue);

                card.classList.toggle("is-hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [input, region, type, year].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
})();
