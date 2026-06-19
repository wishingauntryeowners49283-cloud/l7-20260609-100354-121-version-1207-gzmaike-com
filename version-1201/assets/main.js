(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        var links = document.querySelector('.nav-links');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = links.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('.movie-list-scope'));
        scopes.forEach(function (scope) {
            var panel = scope.querySelector('[data-filter-panel]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var empty = scope.querySelector('[data-empty-state]');
            if (!panel || !cards.length) {
                return;
            }
            var search = panel.querySelector('.js-search-input');
            var year = panel.querySelector('.js-year-filter');
            var region = panel.querySelector('.js-region-filter');
            var type = panel.querySelector('.js-type-filter');
            var reset = panel.querySelector('.js-filter-reset');

            function valueOf(input) {
                return input ? input.value.trim() : '';
            }

            function apply() {
                var q = valueOf(search).toLowerCase();
                var selectedYear = valueOf(year);
                var selectedRegion = valueOf(region);
                var selectedType = valueOf(type);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var matched = true;
                    if (q && haystack.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
                        matched = false;
                    }
                    if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
                        matched = false;
                    }
                    if (selectedType && card.getAttribute('data-type') !== selectedType) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [search, year, region, type].forEach(function (input) {
                if (!input) {
                    return;
                }
                input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', apply);
            });
            if (reset) {
                reset.addEventListener('click', function () {
                    [search, year, region, type].forEach(function (input) {
                        if (input) {
                            input.value = '';
                        }
                    });
                    apply();
                });
            }
            apply();
        });
    }

    function initQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (!q) {
            return;
        }
        var search = document.querySelector('.js-search-input');
        if (search) {
            search.value = q;
            search.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-button');
            var status = player.querySelector('.player-status');
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-video-src');
            var hlsInstance = null;

            function setStatus(text) {
                if (status) {
                    status.textContent = text || '';
                }
            }

            function attachSource() {
                if (video.dataset.ready === 'true') {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.dataset.ready = 'true';
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    video.dataset.ready = 'true';
                    return;
                }
                video.src = source;
                video.dataset.ready = 'true';
            }

            function play() {
                if (!source) {
                    setStatus('当前影片暂时无法播放');
                    return;
                }
                attachSource();
                video.controls = true;
                player.classList.add('is-playing');
                setStatus('正在准备播放...');
                var request = video.play();
                if (request && typeof request.then === 'function') {
                    request.then(function () {
                        setStatus('');
                    }).catch(function () {
                        setStatus('请再次点击播放按钮');
                        player.classList.remove('is-playing');
                    });
                }
            }

            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('playing', function () {
                player.classList.add('is-playing');
                setStatus('');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime > 0 && !video.ended) {
                    player.classList.remove('is-playing');
                }
            });
            video.addEventListener('error', function () {
                setStatus('播放源连接异常，请刷新后重试');
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.dataset.ready = 'false';
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initQuerySearch();
        initPlayers();
    });
}());
