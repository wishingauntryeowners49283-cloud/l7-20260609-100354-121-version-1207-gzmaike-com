(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav-links");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initSearchPanels() {
    var panels = document.querySelectorAll("[data-search-panel]");
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var genre = panel.querySelector("[data-filter-genre]");
      var region = panel.querySelector("[data-filter-region]");
      var targetSelector = panel.getAttribute("data-search-panel");
      var target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(
        target.querySelectorAll("[data-search-text]"),
      );
      var empty = document.querySelector(
        panel.getAttribute("data-empty-target") || "",
      );

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var genreValue = normalize(genre ? genre.value : "");
        var regionValue = normalize(region ? region.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var blob = normalize(card.getAttribute("data-search-text"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var keywordMatch = !keyword || blob.indexOf(keyword) >= 0;
          var genreMatch = !genreValue || cardGenre === genreValue;
          var regionMatch =
            !regionValue || cardRegion.indexOf(regionValue) >= 0;
          var show = keywordMatch && genreMatch && regionMatch;
          card.classList.toggle("is-hidden-card", !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, genre, region].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

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

    restart();
  }

  function initWatching() {
    var zone = document.querySelector(".watch-zone");
    if (!zone) {
      return;
    }
    var video = zone.querySelector("video");
    var overlay = zone.querySelector(".watch-overlay");
    if (!video || !overlay) {
      return;
    }
    var streamUrl = video.getAttribute("src");
    var prepared = false;
    var hlsInstance = null;

    if (streamUrl && window.Hls && window.Hls.isSupported()) {
      video.removeAttribute("src");
      video.load();
    }

    function prepare() {
      if (prepared || !streamUrl) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            overlay.classList.remove("is-hidden");
            overlay.querySelector("span").textContent = "暂时无法播放";
          }
        });
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.setAttribute("src", streamUrl);
        return;
      }
      video.setAttribute("src", streamUrl);
    }

    function play() {
      prepare();
      overlay.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
        return;
      }
      video.pause();
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initNavigation();
    initSearchPanels();
    initHero();
    initWatching();
  });
})();
