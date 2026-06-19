(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG') {
      target.classList.add('image-missing');
    }
  }, true);

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      event.preventDefault();
      var q = input.value.trim();
      var action = form.getAttribute('action') || 'search.html';
      window.location.href = q ? action + '?q=' + encodeURIComponent(q) : action;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
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
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero(current + 1);
      }, 5000);
    }
  }

  function applyFilter() {
    var searchInput = document.querySelector('[data-page-search]');
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var activeChip = document.querySelector('[data-filter-type].is-active');
    var type = activeChip ? activeChip.getAttribute('data-filter-type') : 'all';
    document.querySelectorAll('[data-card]').forEach(function (card) {
      var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '') + ' ' + card.textContent).toLowerCase();
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchType = type === 'all' || text.indexOf(type.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchQuery && matchType));
    });
  }

  var pageSearch = document.querySelector('[data-page-search]');
  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      pageSearch.value = q;
    }
    pageSearch.addEventListener('input', applyFilter);
    document.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('[data-filter-type]').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        applyFilter();
      });
    });
    applyFilter();
  }

  function playVideo(video) {
    var play = video.play();
    if (play && play.catch) {
      play.catch(function () {});
    }
  }

  function startPlayer(player) {
    var video = player.querySelector('video');
    var stream = player.getAttribute('data-stream');
    var playNow = true;
    if (!video || !stream) {
      return;
    }
    if (!video.getAttribute('data-ready')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        playNow = false;
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
        player._hls = hls;
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', '1');
    }
    player.classList.add('is-playing');
    if (playNow) {
      playVideo(video);
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var mask = player.querySelector('.player-mask');
    if (mask) {
      mask.addEventListener('click', function () {
        startPlayer(player);
      });
    }
  });
})();
