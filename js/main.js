/**
 * Homepage: sticky nav shadow, fade-in observers, mobile menu
 */
(function () {
  "use strict";

  const nav = document.getElementById("site-nav");

  function onScroll() {
    if (!nav) return;
    const y = window.scrollY || window.pageYOffset;
    nav.classList.toggle("shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12)]", y > 12);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const fadeEls = document.querySelectorAll(".fade-in-section");
  if (fadeEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      /* threshold 0 + margem inferior positiva = dispara mais cedo em mobile e evita secções eternamente invisíveis */
      { rootMargin: "0px 0px 120px 0px", threshold: 0 },
    );
    fadeEls.forEach((el) => io.observe(el));
  } else {
    fadeEls.forEach((el) => el.classList.add("is-visible"));
  }

  /** Se por algum motivo o observer não correr (viewport/iframe), não deixar o site branco eternamente */
  window.setTimeout(function () {
    fadeEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }, 1800);

  /** Credentials strip: staggered counters (26+, 5000+, 100%) when section enters view */
  (function setupTrustSectionCounters() {
    var motion = document.querySelector(".trust-stats-motion.fade-in-section");
    if (!motion) return;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function runCounter(el, target, ms) {
      var startTs = performance.now();

      function frame(now) {
        var t = Math.min(1, (now - startTs) / ms);
        var n = Math.round(target * easeOutCubic(t));
        el.textContent = String(n);
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = String(target);
      }
      requestAnimationFrame(frame);
    }

    function startCountersOnce() {
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var nodes = motion.querySelectorAll(".stats-count-num");
      if (!nodes.length) return;

      if (reduced) {
        nodes.forEach(function (el) {
          var tgt = Number(el.dataset.countTo);
          el.textContent = String(tgt);
        });
        return;
      }

      var starts = [430, 950, 1600];

      nodes.forEach(function (el, i) {
        var target = Number(el.dataset.countTo);
        if (Number.isNaN(target)) return;
        var ms = Math.min(2400, 720 + Math.abs(target) * 0.42);
        window.setTimeout(function () {
          runCounter(el, target, ms);
        }, starts[i] ?? 400 + i * 350);
      });
    }

    if (!("IntersectionObserver" in window)) {
      motion.classList.add("is-visible");
      startCountersOnce();
      return;
    }

    var done = false;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || done) return;
          done = true;
          startCountersOnce();
          io.disconnect();
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(motion);
  })();

  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobilePanel = document.getElementById("mobile-menu");
  const mobileLinks = mobilePanel?.querySelectorAll("a");

  function closeMobileMenu() {
    mobileBtn?.setAttribute("aria-expanded", "false");
    mobilePanel?.classList.add("hidden");
  }

  mobileBtn?.addEventListener("click", () => {
    const open = mobilePanel?.classList.toggle("hidden") === false;
    mobileBtn.setAttribute("aria-expanded", String(open));
  });

  mobileLinks?.forEach((a) => a.addEventListener("click", closeMobileMenu));

  document.getElementById("year-slot")?.appendChild(document.createTextNode(String(new Date().getFullYear())));

  /** Section #company-video: play while in view, pause when scrolled away (respects prefers-reduced-motion). */
  (function setupCompanyVideoScrollPlayback() {
    var section = document.getElementById("company-video");
    var video = section && section.querySelector("video[data-scroll-autoplay]");
    if (!section || !video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      return;
    }

    function tryPlay() {
      video.muted = false;
      var p = video.play();
      if (p !== undefined && typeof p.catch === "function") {
        p.catch(function () {
          video.muted = true;
          return video.play();
        }).catch(function () {});
      }
    }

    function pausePlayback() {
      video.pause();
    }

    document.addEventListener(
      "visibilitychange",
      function () {
        if (document.visibilityState === "hidden") pausePlayback();
      },
      false,
    );

    // rootMargin reduce a zona “central” da viewport para não dar play assim que aparece uma borda ao fundo da página.
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tryPlay();
          } else {
            pausePlayback();
          }
        });
      },
      {
        threshold: [0],
        rootMargin: "-14% 0px -26% 0px",
      },
    );

    observer.observe(section);
  })();

  /** #estimate-cta (< md): clip-path fixed overlay; desktop = .cta-parallax-bg (static1.jpeg) + fixed; mobile <img> static2.png */
  (function setupCtaPhotoStripsMobileBackdrop() {
    function setupStrip(section) {
      if (!section) return;
      var fallback = section.querySelector(".estimate-cta-mobile-photo");
      if (!fallback) return;

      var mqDesk = window.matchMedia("(min-width: 768px)");
      var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

      function vhPx() {
        try {
          if (window.visualViewport && window.visualViewport.height) {
            return window.visualViewport.height;
          }
        } catch (_) {}
        return window.innerHeight || document.documentElement.clientHeight || 0;
      }

      function resolveSrc() {
        var ds = section.getAttribute("data-mobile-photo");
        var fs = fallback.getAttribute("src");
        var raw = ds && ds.trim() ? ds : fs ? fs : "";
        return raw ? raw.trim() : "";
      }

      var srcNow = resolveSrc();
      if (!srcNow) return;

      var layer = document.createElement("div");
      layer.className = "estimate-cta-fixed-clip-root";
      layer.setAttribute("aria-hidden", "true");

      layer.style.cssText =
        "position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;min-height:100dvh;pointer-events:none;overflow:hidden;z-index:37;background-color:transparent;visibility:hidden";

      var overlayImg = document.createElement("img");
      overlayImg.alt = "";
      overlayImg.decoding = "async";

      var overlayReady = false;

      overlayImg.onload = function () {
        overlayReady = true;
        compute();
      };

      overlayImg.onerror = function () {
        overlayReady = false;
        section.classList.add("estimate-cta-show-inline-photo");
        teardown();
      };

      overlayImg.src = srcNow;

      overlayImg.style.cssText =
        "display:block;margin:0;padding:0;position:absolute;left:0;top:0;width:100%;height:100%;max-width:none;box-sizing:border-box;" +
        "-o-object-fit:cover;-webkit-object-fit:cover;object-fit:cover;" +
        "-o-object-position:center;-webkit-object-position:center;object-position:center center;" +
        "-webkit-backface-visibility:hidden;backface-visibility:hidden";

      layer.appendChild(overlayImg);

      if (overlayImg.complete && overlayImg.naturalWidth > 0) {
        overlayReady = true;
      }

      var ticking = false;

      function teardown() {
        if (layer.parentNode) document.body.removeChild(layer);
        layer.style.clipPath = "";
        layer.style.webkitClipPath = "";
      }

      function compute() {
        ticking = false;
        if (mqDesk.matches || mqReduce.matches) {
          teardown();
          return;
        }

        if (!layer.parentNode) document.body.appendChild(layer);

        if (!overlayReady) {
          layer.style.visibility = "hidden";
          layer.style.webkitClipPath = "";
          layer.style.clipPath = "";
          return;
        }

        var rect = section.getBoundingClientRect();
        var vh = vhPx();

        if (vh <= 0 || rect.bottom <= 0 || rect.top >= vh) {
          layer.style.visibility = "hidden";
          return;
        }

        var topInset = Math.max(0, rect.top);
        var bottomInset = Math.max(0, vh - rect.bottom);

        layer.style.visibility = "visible";
        var clipStr = "inset(" + topInset + "px 0px " + bottomInset + "px 0px)";
        layer.style.clipPath = clipStr;
        layer.style.webkitClipPath = clipStr;
      }

      function schedule() {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(compute);
        }
      }

      compute();

      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", compute, { passive: true });

      try {
        if (window.visualViewport && window.visualViewport.addEventListener) {
          window.visualViewport.addEventListener("resize", schedule);
        }
      } catch (_) {}

      if (typeof mqDesk.addEventListener === "function") {
        mqDesk.addEventListener("change", compute);
      } else if (typeof mqDesk.addListener === "function") {
        mqDesk.addListener(compute);
      }

      if (typeof mqReduce.addEventListener === "function") {
        mqReduce.addEventListener("change", compute);
      } else if (typeof mqReduce.addListener === "function") {
        mqReduce.addListener(compute);
      }
    }

    setupStrip(document.getElementById("estimate-cta"));
  })();

  /** Services page FAQ: one accordion open at a time */
  (function setupServicesFaqAccordion() {
    var root = document.querySelector(".services-faq");
    if (!root) return;

    var items = root.querySelectorAll(".services-faq__item");
    if (!items.length) return;

    function setOpen(item, open) {
      item.classList.toggle("is-open", open);
      var btn = item.querySelector(".services-faq__trigger");
      var panel = item.querySelector(".services-faq__panel");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.setAttribute("aria-hidden", open ? "false" : "true");
    }

    items.forEach(function (item) {
      var btn = item.querySelector(".services-faq__trigger");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");
        items.forEach(function (other) {
          setOpen(other, other === item ? willOpen : false);
        });
      });
    });
  })();
})();
