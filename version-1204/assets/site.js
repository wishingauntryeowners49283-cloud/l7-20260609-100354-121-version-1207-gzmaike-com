(function () {
  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-mobile-toggle]');

  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function setSlide(index) {
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

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(current + 1);
    }, 5200);
  }

  function textOf(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function applyFilters(root) {
    var search = root.querySelector('[data-list-search]');
    var year = root.querySelector('[data-filter-year]');
    var region = root.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var empty = root.querySelector('[data-empty]');
    var query = search ? textOf(search.value) : '';
    var y = year ? year.value : '';
    var r = region ? region.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = textOf(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region'));
      var ok = true;

      if (query && haystack.indexOf(query) === -1) {
        ok = false;
      }

      if (y && card.getAttribute('data-year') !== y) {
        ok = false;
      }

      if (r && card.getAttribute('data-region') !== r) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(function (root) {
    Array.prototype.slice.call(root.querySelectorAll('input, select')).forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(root);
      });
      control.addEventListener('change', function () {
        applyFilters(root);
      });
    });
    applyFilters(root);
  });
})();

function setupMoviePlayer(url) {
  var video = document.querySelector('[data-player-video]');
  var start = document.querySelector('[data-player-start]');
  var activated = false;
  var hls = null;

  if (!video || !url) {
    return;
  }

  function prepare() {
    if (activated) {
      return;
    }

    activated = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function play() {
    prepare();

    if (start) {
      start.classList.add('is-hidden');
    }

    video.play().catch(function () {});
  }

  if (start) {
    start.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
