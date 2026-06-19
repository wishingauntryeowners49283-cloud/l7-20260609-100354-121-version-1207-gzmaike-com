(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var jumps = Array.prototype.slice.call(document.querySelectorAll('[data-hero-jump]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startTimer() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startTimer();
    });
  });

  jumps.forEach(function (jump) {
    jump.addEventListener('mouseenter', function () {
      showSlide(Number(jump.getAttribute('data-hero-jump')) || 0);
    });
  });

  startTimer();

  var searchInput = document.querySelector('[data-search-input]');
  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var selected = {};

    filters.forEach(function (filter) {
      selected[filter.getAttribute('data-filter')] = filter.value;
    });

    cards.forEach(function (card) {
      var visible = true;
      var text = textOf(card);

      if (query && text.indexOf(query) === -1) {
        visible = false;
      }

      Object.keys(selected).forEach(function (key) {
        if (!selected[key]) {
          return;
        }
        var value = card.getAttribute('data-' + key) || '';
        if (value.indexOf(selected[key]) === -1) {
          visible = false;
        }
      });

      card.classList.toggle('is-hidden', !visible);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filters.forEach(function (filter) {
    filter.addEventListener('change', applyFilters);
  });
})();

function initPlayer(source) {
  var video = document.getElementById('movieVideo');
  var button = document.getElementById('playOverlay');
  var ready = false;
  var player = null;

  if (!video || !button || !source) {
    return;
  }

  function prepare() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      player = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      player.loadSource(source);
      player.attachMedia(video);
    } else {
      video.src = source;
    }

    ready = true;
  }

  function playVideo() {
    prepare();
    button.classList.add('is-hidden');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (player) {
      player.destroy();
    }
  });
}
