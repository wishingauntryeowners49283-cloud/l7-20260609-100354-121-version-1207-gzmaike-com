document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    document.querySelectorAll('[data-local-search]').forEach(function (form) {
        var input = form.querySelector('[data-search-input]');
        var scope = form.closest('main') || document;
        var list = scope.querySelector('[data-filter-list]');

        if (!input || !list) {
            return;
        }

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            var items = Array.prototype.slice.call(list.querySelectorAll('[data-filter-item]'));

            items.forEach(function (item) {
                var text = [item.getAttribute('data-title'), item.getAttribute('data-meta')].join(' ').toLowerCase();
                item.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
            });
        });
    });

    document.querySelectorAll('.player-shell[data-stream-url]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-overlay');
        var streamUrl = shell.getAttribute('data-stream-url');
        var mediaReady = false;
        var hlsInstance = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        var prepareMedia = function () {
            if (mediaReady) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            mediaReady = true;
        };

        var playMedia = function () {
            prepareMedia();
            shell.classList.add('is-playing');
            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        };

        button.addEventListener('click', function (event) {
            event.preventDefault();
            playMedia();
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
});
