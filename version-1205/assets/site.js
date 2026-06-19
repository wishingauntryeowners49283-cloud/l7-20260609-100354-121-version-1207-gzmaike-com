(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var searchInput = document.querySelector('[data-global-search]');
    var searchResults = document.querySelector('[data-search-results]');

    if (searchInput && searchResults && window.SEARCH_ITEMS) {
        searchInput.addEventListener('input', function () {
            var query = searchInput.value.trim().toLowerCase();
            searchResults.innerHTML = '';

            if (!query) {
                searchResults.classList.remove('is-open');
                return;
            }

            var matches = window.SEARCH_ITEMS.filter(function (item) {
                return item.title.toLowerCase().indexOf(query) !== -1 ||
                    item.region.toLowerCase().indexOf(query) !== -1 ||
                    item.genre.toLowerCase().indexOf(query) !== -1 ||
                    item.category.toLowerCase().indexOf(query) !== -1;
            }).slice(0, 12);

            if (!matches.length) {
                var empty = document.createElement('span');
                empty.textContent = '未找到相关影片';
                empty.style.display = 'block';
                empty.style.padding = '12px';
                empty.style.color = '#6b7280';
                searchResults.appendChild(empty);
                searchResults.classList.add('is-open');
                return;
            }

            matches.forEach(function (item) {
                var link = document.createElement('a');
                link.href = item.url;
                var title = document.createElement('strong');
                title.textContent = item.title;
                var meta = document.createElement('span');
                meta.textContent = item.year + ' · ' + item.region + ' · ' + item.category;
                link.appendChild(title);
                link.appendChild(meta);
                searchResults.appendChild(link);
            });

            searchResults.classList.add('is-open');
        });

        document.addEventListener('click', function (event) {
            if (!searchResults.contains(event.target) && event.target !== searchInput) {
                searchResults.classList.remove('is-open');
            }
        });
    }

    var localFilter = document.querySelector('[data-local-filter]');

    if (localFilter) {
        var movieCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        localFilter.addEventListener('input', function () {
            var query = localFilter.value.trim().toLowerCase();
            movieCards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('hidden-card', query && haystack.indexOf(query) === -1);
            });
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var source = player.getAttribute('data-video');
        var hlsInstance = null;

        function prepareVideo() {
            if (!video || !source || video.getAttribute('data-ready') === '1') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 32,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            video.setAttribute('data-ready', '1');
        }

        function startPlayback() {
            prepareVideo();
            if (!video) {
                return;
            }
            player.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayback();
            });
        }

        player.addEventListener('click', function (event) {
            if (event.target === video || event.target.closest('button')) {
                return;
            }
            startPlayback();
        });

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
