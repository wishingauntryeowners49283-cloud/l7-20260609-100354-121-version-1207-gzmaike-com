(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            play();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        play();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var input = document.getElementById("movieSearch");
        var year = document.getElementById("yearFilter");
        var region = document.getElementById("regionFilter");
        var type = document.getElementById("typeFilter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
        var empty = document.querySelector(".empty-results");
        if (!cards.length) {
            return;
        }

        function apply() {
            var query = normalize(input && input.value);
            var yearValue = normalize(year && year.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));
                var pass = true;
                if (query && text.indexOf(query) === -1) {
                    pass = false;
                }
                if (yearValue && normalize(card.dataset.year) !== yearValue) {
                    pass = false;
                }
                if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1) {
                    pass = false;
                }
                if (typeValue && normalize(card.dataset.type) !== typeValue) {
                    pass = false;
                }
                card.hidden = !pass;
                if (pass) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector(".movie-video");
        var cover = document.querySelector(".player-cover");
        if (!video || !cover || !streamUrl) {
            return;
        }
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function start() {
            attach();
            cover.classList.add("is-hidden");
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!attached) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
