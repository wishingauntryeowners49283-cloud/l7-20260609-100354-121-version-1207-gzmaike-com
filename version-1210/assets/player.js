(function() {
    function initMoviePlayer(sourceUrl) {
        const shell = document.querySelector("[data-player]");
        const video = shell ? shell.querySelector("video") : document.querySelector("video");
        const button = shell ? shell.querySelector(".player-overlay") : null;
        let attached = false;
        let hls = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function(event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        video.src = sourceUrl;
                    }
                });
                return;
            }

            video.src = sourceUrl;
        }

        function begin(event) {
            if (event) {
                event.preventDefault();
            }

            attachSource();

            if (button) {
                button.classList.add("is-hidden");
            }

            video.controls = true;
            const promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function() {});
            }
        }

        if (button) {
            button.addEventListener("click", begin);
        }

        video.addEventListener("click", function() {
            if (video.paused) {
                begin();
            }
        });

        video.addEventListener("play", function() {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function() {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
