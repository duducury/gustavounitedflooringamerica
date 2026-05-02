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
    var narrowStats =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(max-width: 1023px)")
        : { matches: true };
    var isNarrowStats = narrowStats.matches;

    var coarsePointer =
      typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

    /** Em ecrã estreito: autoplay (sem setas no HTML/CSS). Desktop: setas visíveis + autoplay só com rato fino. */
    var statsAutoplay = false;
    if (!reducedMotion && isNarrowStats) {
      statsAutoplay = {
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      };
    } else if (!reducedMotion && !isNarrowStats && !coarsePointer) {
      statsAutoplay = {
        delay: 6200,
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
      };
    }

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
      autoplay: statsAutoplay,
      navigation: !isNarrowStats
        ? {
            prevEl: "#stats-gallery-prev",
            nextEl: "#stats-gallery-next",
          }
        : false,
      keyboard: { enabled: true, onlyInViewport: true },
    });

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
