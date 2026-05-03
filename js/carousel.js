/**
 * Homepage carousels: hero fade + stats + work coverflow (Swiper rewind, sem loop manual).
 */
(function () {
  "use strict";

  if (typeof Swiper === "undefined") return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var heroEl = document.querySelector(".hero-swiper");
  if (heroEl) {
    var heroPag = heroEl.querySelector(".hero-swiper-pagination");
    new Swiper(".hero-swiper", {
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      speed: reducedMotion ? 0 : 900,
      autoplay: reducedMotion
        ? false
        : {
            delay: 7000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
      grabCursor: true,
      pagination: heroPag
        ? {
            el: heroPag,
            clickable: true,
            dynamicBullets: false,
          }
        : undefined,
      keyboard: { enabled: true, onlyInViewport: true },
    });
  }

  /** Credentials gallery: sempre Swiper (mesmo no telefone) para manter slide + mesmo layout lado a lado (~7/5). */
  var statsCarousel = document.querySelector(".stats-gallery-swiper");
  var statsSwiperInst = null;
  var statsGalleryRefreshT;

  function scheduleStatsGalleryRefresh() {
    if (!statsSwiperInst) return;
    window.clearTimeout(statsGalleryRefreshT);
    statsGalleryRefreshT = window.setTimeout(function () {
      try {
        statsSwiperInst.updateSize();
        statsSwiperInst.updateSlides();
        statsSwiperInst.update();
      } catch (e1) {}
    }, 96);
  }


  if (statsCarousel) {
    var statsGalleryRoot = document.getElementById("trust-stats-gallery");
    var narrowStats =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(max-width: 1023px)")
        : { matches: true };
    var isNarrowStats = narrowStats.matches;

    var coarsePointer =
      typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

    /** Em ecrã estreito: autoplay; em desktop há um pouco de autoplay com rato fino — só quando a zona está à vista (igual Portfolio). */
    var statsAutoplayConfig = false;
    if (!reducedMotion && isNarrowStats) {
      statsAutoplayConfig = {
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      };
    } else if (!reducedMotion && !isNarrowStats && !coarsePointer) {
      statsAutoplayConfig = {
        delay: 6200,
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
      };
    }

    var statsObserveEl = statsGalleryRoot || statsCarousel.closest(".stats-gallery-shell");

    function syncStatsAutoplay() {
      if (!statsSwiperInst || !statsAutoplayConfig || !statsSwiperInst.autoplay) return;
      if (document.visibilityState !== "visible") {
        statsSwiperInst.autoplay.stop();
        return;
      }
      if (!statsObserveEl) {
        statsSwiperInst.autoplay.stop();
        return;
      }
      var r = statsObserveEl.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      if (vh <= 0 || r.height <= 0) {
        statsSwiperInst.autoplay.stop();
        return;
      }
      var overlap = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (overlap < Math.min(vh * 0.16, r.height * 0.18)) {
        statsSwiperInst.autoplay.stop();
        return;
      }
      statsSwiperInst.autoplay.start();
    }

    var statsPaginationEl = document.getElementById("stats-gallery-pagination");

    statsSwiperInst = new Swiper(statsCarousel, {
      loop: false,
      rewind: true,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: reducedMotion ? 0 : 450,
      roundLengths: true,
      grabCursor: !coarsePointer,
      observer: true,
      observeParents: true,
      watchOverflow: true,
      preventInteractionOnTransition: false,
      touchStartPreventDefault: false,
      threshold: 8,
      longSwipesRatio: 0.35,
      passiveListeners: true,
      autoplay: statsAutoplayConfig,
      navigation: {
        prevEl: "#stats-gallery-prev",
        nextEl: "#stats-gallery-next",
      },
      pagination: statsPaginationEl
        ? {
            el: statsPaginationEl,
            clickable: true,
            bulletClass: "swiper-pagination-bullet stats-gallery-bullet",
            bulletActiveClass: "swiper-pagination-bullet-active",
          }
        : undefined,
      keyboard: { enabled: true, onlyInViewport: true },
      on: {
        init: function () {
          if (this.autoplay && typeof this.autoplay.stop === "function") {
            this.autoplay.stop();
          }
        },
      },
    });

    if (statsAutoplayConfig && statsObserveEl) {
      if ("IntersectionObserver" in window) {
        var statsIo = new IntersectionObserver(syncStatsAutoplay, {
          root: null,
          threshold: [0, 0.06, 0.12, 0.2, 0.35, 0.5],
          rootMargin: "-6% 0px -14% 0px",
        });
        statsIo.observe(statsObserveEl);
      } else {
        window.addEventListener("scroll", syncStatsAutoplay, { passive: true });
      }
      document.addEventListener("visibilitychange", syncStatsAutoplay, false);
      window.addEventListener("resize", syncStatsAutoplay, { passive: true });
      window.addEventListener(
        "orientationchange",
        function () {
          window.setTimeout(syncStatsAutoplay, 240);
        },
        { passive: true },
      );
      syncStatsAutoplay();
    }

    statsCarousel.classList.add("stats-gallery-swiper--ready");

    scheduleStatsGalleryRefresh();
    window.requestAnimationFrame(scheduleStatsGalleryRefresh);

    window.setTimeout(scheduleStatsGalleryRefresh, 0);
    window.setTimeout(scheduleStatsGalleryRefresh, 180);

    window.addEventListener("resize", scheduleStatsGalleryRefresh, { passive: true });
    window.addEventListener("orientationchange", function () {
      window.setTimeout(scheduleStatsGalleryRefresh, 380);
    });
    window.addEventListener(
      "load",
      function () {
        window.requestAnimationFrame(scheduleStatsGalleryRefresh);
      },
      { once: true },
    );
  }

  /** What We Install — horizontal card carousel (touch + desktop drag) */
  var servicesCardsEl = document.querySelector(".services-cards-swiper");
  if (servicesCardsEl) {
    var servicesPag = servicesCardsEl.querySelector(".services-cards-pagination");
    new Swiper(servicesCardsEl, {
      slidesPerView: 1.08,
      spaceBetween: 16,
      centeredSlides: true,
      loop: false,
      rewind: true,
      speed: reducedMotion ? 0 : 480,
      grabCursor: true,
      threshold: 6,
      watchOverflow: true,
      pagination: servicesPag
        ? {
            el: servicesPag,
            clickable: true,
          }
        : undefined,
      keyboard: { enabled: true, onlyInViewport: true },
      breakpoints: {
        480: {
          slidesPerView: 1.22,
          spaceBetween: 18,
        },
        768: {
          slidesPerView: 2,
          centeredSlides: false,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          centeredSlides: false,
          spaceBetween: 24,
        },
      },
    });
  }

  var root = document.getElementById("work-carousel");
  var el = document.querySelector(".work-swiper-cover");
  if (!root || !el) return;

  var paginationEl = el.querySelector(".work-swiper-pagination");

  var swiper;

  function keyNav(nextHandler, prevHandler) {
    root.addEventListener(
      "keydown",
      function (e) {
        if (document.activeElement !== root && !root.contains(document.activeElement)) return;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevHandler();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          nextHandler();
        }
      },
      true,
    );
  }

  if (reducedMotion) {
    swiper = new Swiper(el, {
      effect: "slide",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 1,
      spaceBetween: 16,
      loop: false,
      rewind: true,
      speed: 0,
      pagination: paginationEl
        ? {
            el: paginationEl,
            clickable: true,
          }
        : undefined,
      navigation: {
        prevEl: "#carousel-prev",
        nextEl: "#carousel-next",
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
    });
    keyNav(
      function () {
        swiper.slideNext();
      },
      function () {
        swiper.slidePrev();
      },
    );
  } else {
    /* rewind: arrasto e setas fiáveis. loop:true+coverflow volta a ficar buggy; “roda infinita” não cabe bem neste modo. */
    var workSlideCount = el.querySelectorAll(".swiper-wrapper > .swiper-slide").length;

    function syncWorkAutoplay() {
      if (!swiper || !swiper.autoplay) return;
      if (document.visibilityState !== "visible") {
        swiper.autoplay.stop();
        return;
      }
      var r = root.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      if (vh <= 0 || r.height <= 0) {
        swiper.autoplay.stop();
        return;
      }
      var overlap = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (overlap < Math.min(vh * 0.16, r.height * 0.18)) {
        swiper.autoplay.stop();
        return;
      }
      swiper.autoplay.start();
    }

    swiper = new Swiper(el, {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      spaceBetween: 0,
      loop: false,
      rewind: true,
      speed: 550,
      navigation: {
        prevEl: "#carousel-prev",
        nextEl: "#carousel-next",
      },
      pagination: false,
      keyboard: { enabled: true, onlyInViewport: true },
      autoplay: {
        delay: 5500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      on: {
        init: function () {
          if (this.autoplay && typeof this.autoplay.stop === "function") {
            this.autoplay.stop();
          }
        },
      },
      coverflowEffect: {
        rotate: 46,
        stretch: -18,
        depth: 200,
        modifier: 1,
        slideShadows: false,
      },
      breakpoints: {
        480: {
          coverflowEffect: {
            rotate: 46,
            stretch: -20,
            depth: 220,
            modifier: 1,
            slideShadows: false,
          },
        },
        992: {
          coverflowEffect: {
            rotate: 46,
            stretch: -24,
            depth: 240,
            modifier: 1,
            slideShadows: false,
          },
        },
      },
    });

    if ("IntersectionObserver" in window) {
      var workIo = new IntersectionObserver(syncWorkAutoplay, {
        root: null,
        threshold: [0, 0.06, 0.12, 0.2, 0.35, 0.5],
        rootMargin: "-6% 0px -14% 0px",
      });
      workIo.observe(root);
    } else {
      window.addEventListener("scroll", syncWorkAutoplay, { passive: true });
    }

    document.addEventListener("visibilitychange", syncWorkAutoplay, false);
    window.addEventListener("resize", syncWorkAutoplay, { passive: true });
    window.addEventListener(
      "orientationchange",
      function () {
        window.setTimeout(syncWorkAutoplay, 240);
      },
      { passive: true },
    );

    syncWorkAutoplay();

    function updateWorkFraction() {
      if (!paginationEl || !swiper) return;
      if (!workSlideCount) return;
      paginationEl.textContent = swiper.realIndex + 1 + " / " + workSlideCount;
    }

    swiper.on("slideChange", updateWorkFraction);
    updateWorkFraction();

    keyNav(
      function () {
        swiper.slideNext();
      },
      function () {
        swiper.slidePrev();
      },
    );
  }
})();
