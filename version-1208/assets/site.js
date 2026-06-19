(function () {
    const header = document.getElementById("site-header");
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    function syncHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let activeSlide = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === activeSlide);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === activeSlide);
            dot.setAttribute("aria-pressed", i === activeSlide ? "true" : "false");
        });
    }

    function restartHero() {
        if (heroTimer) {
            clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = setInterval(function () {
                showSlide(activeSlide + 1);
            }, 5000);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            restartHero();
        });
    });

    showSlide(0);
    restartHero();

    document.querySelectorAll("[data-filter-scope]").forEach(function (toolbar) {
        const scope = toolbar.parentElement || document;
        const input = toolbar.querySelector("[data-filter-input]");
        const year = toolbar.querySelector("[data-filter-year]");
        const region = toolbar.querySelector("[data-filter-region]");
        const type = toolbar.querySelector("[data-filter-type]");
        const clear = toolbar.querySelector("[data-filter-clear]");
        const cards = Array.from(scope.querySelectorAll("[data-card]"));
        const empty = scope.querySelector("[data-empty-state]");

        function applyFilter() {
            const query = (input && input.value ? input.value : "").trim().toLowerCase();
            const y = year && year.value ? year.value : "";
            const r = region && region.value ? region.value : "";
            const t = type && type.value ? type.value : "";
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title || "",
                    card.dataset.year || "",
                    card.dataset.region || "",
                    card.dataset.genre || "",
                    card.dataset.type || ""
                ].join(" ").toLowerCase();
                const okQuery = !query || haystack.indexOf(query) !== -1;
                const okYear = !y || card.dataset.year === y;
                const okRegion = !r || card.dataset.region === r;
                const okType = !t || card.dataset.type === t;
                const show = okQuery && okYear && okRegion && okType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, year, region, type].forEach(function (el) {
            if (el) {
                el.addEventListener("input", applyFilter);
                el.addEventListener("change", applyFilter);
            }
        });

        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (region) {
                    region.value = "";
                }
                if (type) {
                    type.value = "";
                }
                applyFilter();
            });
        }
    });

    const resultGrid = document.querySelector("[data-search-results]");
    const searchInput = document.querySelector("[data-search-page-input]");
    const searchForm = document.querySelector("[data-search-page-form]");

    function cardTemplate(item) {
        const tags = item.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\" data-card>" +
            "<a class=\"poster-link\" href=\"" + item.url + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">" +
            "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"play-pill\">立即观看</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<div class=\"movie-meta-row\"><span>" + item.year + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
            "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>" +
            "<p>" + escapeHtml(item.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderSearch(query) {
        if (!resultGrid || !window.SEARCH_INDEX) {
            return;
        }
        const q = String(query || "").trim().toLowerCase();
        const source = window.SEARCH_INDEX;
        const results = source.filter(function (item) {
            if (!q) {
                return true;
            }
            return [item.title, item.year, item.region, item.type, item.genre, item.tags.join(" ")].join(" ").toLowerCase().indexOf(q) !== -1;
        }).slice(0, 240);
        resultGrid.innerHTML = results.map(cardTemplate).join("");
        const empty = document.querySelector("[data-search-empty]");
        if (empty) {
            empty.classList.toggle("is-visible", results.length === 0);
        }
    }

    function initSearchPage() {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q") || "";
        if (searchInput) {
            searchInput.value = q;
        }
        renderSearch(q);
    }

    if (resultGrid) {
        if (window.SEARCH_INDEX) {
            initSearchPage();
        } else {
            window.addEventListener("load", initSearchPage);
        }
    }

    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const query = searchInput ? searchInput.value : "";
            const url = new URL(window.location.href);
            if (query.trim()) {
                url.searchParams.set("q", query.trim());
            } else {
                url.searchParams.delete("q");
            }
            window.history.replaceState(null, "", url.toString());
            renderSearch(query);
        });
    }
}());
