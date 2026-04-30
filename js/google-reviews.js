/**
 * Loads data/google-reviews.json (manual entries or synced via Google Places Details API)
 * and renders the homepage testimonials section.
 */
(function () {
  "use strict";

  function warn(msg) {
    if (typeof console !== "undefined" && console.warn) console.warn("[google-reviews] " + msg);
  }

  function initials(name) {
    if (!name || typeof name !== "string") return "?";
    var parts = name.trim().split(/\s+/).slice(0, 2);
    var out = "";
    for (var i = 0; i < parts.length; i++) {
      if (parts[i][0]) out += parts[i][0].toUpperCase();
    }
    return out || "?";
  }

  function formatReviewDate(seconds) {
    if (seconds == null || seconds === "") return "";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(Number(seconds) * 1000));
    } catch (_) {
      return "";
    }
  }

  function starsLabel(n) {
    var r = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
    var s = "";
    for (var i = 0; i < r; i++) s += "★";
    return s;
  }

  function truncateText(text, limit) {
    if (!text || text.length <= limit) return { preview: text, full: text, needsToggle: false };
    var cut = text.slice(0, limit);
    var sp = cut.lastIndexOf(" ");
    if (sp > limit * 0.55) cut = cut.slice(0, sp);
    return {
      preview: cut.trim() + "…",
      full: text,
      needsToggle: true,
    };
  }

  /** Simple multicolor Google “G” SVG (decorative) */
  function googleBadgeSvg() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "h-5 w-5 shrink-0 sm:h-7 sm:w-7");
    svg.setAttribute("viewBox", "0 0 48 48");
    svg.setAttribute("aria-hidden", "true");
    var paths = [
      { fill: "#fbc02d", d: "M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.284 36 24 36c-7.18 0-13-5.82-13-13s5.82-13 13-13c3.241 0 6.175 1.207 8.418 3.181l6.171-6.171C34.071 8.391 29.33 6 24 6 12.955 6 4 14.955 4 26s8.955 20 20 20 20-8.955 20-20c0-1.688-.236-3.318-.739-4.917z" },
      { fill: "#e53935", d: "m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.657 7.157 6.306 14.691z" },
      { fill: "#4caf50", d: "M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.587 5.072C9.506 39.556 16.227 44 24 44z" },
      { fill: "#1565c0", d: "M43.611 20.083 42 20 24 20v8h11.303a13.982 13.982 0 0 1-4.849 8.069l6.764 6.759C46.982 39.068 52 34.058 52 24 52 22.619 51.734 21.357 51.269 20.097z" },
    ];
    for (var i = 0; i < paths.length; i++) {
      var p = document.createElementNS(ns, "path");
      p.setAttribute("fill", paths[i].fill);
      p.setAttribute("d", paths[i].d);
      svg.appendChild(p);
    }
    return svg;
  }

  function mountWriteFallbackHref() {
    var el = document.getElementById("google-reviews-mount");
    if (!el) return "";
    var h = el.getAttribute("data-write-review");
    if (!h) return "";
    return String(h).replace(/&amp;/g, "&").trim();
  }

  function pickWriteReviewHref(data) {
    var w =
      (data.writeReviewUrl && String(data.writeReviewUrl).trim()) ||
      (data.write_review_url && String(data.write_review_url).trim()) ||
      "";
    return w || mountWriteFallbackHref();
  }

  function buildCard(review) {
    var block = document.createElement("blockquote");
    block.className =
      "flex h-full min-h-[6.75rem] flex-col rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition duration-300 ease-out hover:z-[1] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:shadow-lg hover:shadow-black/25 sm:min-h-0 sm:rounded-2xl sm:p-4 md:p-6";

    var header = document.createElement("div");
    header.className =
      "flex flex-nowrap items-start justify-between gap-3 gap-y-2 [align-items:flex-start]";
    var stars = document.createElement("div");
    stars.className = "flex min-w-0 shrink-0 gap-0.5 text-sm leading-none tracking-tight text-gold";
    stars.setAttribute("aria-label", (review.rating || 5) + " out of 5 stars");
    stars.textContent = starsLabel(review.rating);

    var when = document.createElement("time");
    when.className =
      "review-date-slot ml-auto shrink-0 max-w-[min(36vw,6.5rem)] text-right text-[0.65rem] leading-tight whitespace-nowrap tabular-nums text-white/50 break-normal sm:max-w-[min(42vw,10rem)] sm:text-[0.7rem] sm:leading-snug";
    var whenStr =
      review.relativeTimeDescription ||
      review.relativeTime ||
      formatReviewDate(review.reviewTimeUtcSeconds);
    when.textContent = whenStr || "";

    header.appendChild(stars);
    header.appendChild(when);

    var bodyWrap = document.createElement("div");
    bodyWrap.className = "mt-2 flex flex-1 flex-col sm:mt-3";

    var para = document.createElement("p");
    para.className =
      "review-body text-[0.76rem] leading-snug text-white/90 sm:text-sm sm:leading-relaxed";

    var full = review.text ? String(review.text) : "";
    var tr = truncateText(full, 176);
    para.textContent = tr.preview;
    bodyWrap.appendChild(para);

    if (tr.needsToggle) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mt-2 self-start text-xs font-semibold text-sky-300 hover:text-sky-200";
      btn.textContent = "More";
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var exp = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", exp ? "false" : "true");
        para.textContent = exp ? tr.preview : tr.full;
        btn.textContent = exp ? "More" : "Less";
      });
      bodyWrap.appendChild(btn);
    }

    block.appendChild(header);
    block.appendChild(bodyWrap);

    var foot = document.createElement("footer");
    foot.className =
      "mt-2 flex shrink-0 items-center justify-between gap-2 border-t border-white/10 pt-3 sm:mt-4 sm:gap-3 sm:pt-4";
    var who = document.createElement("div");
    who.className = "flex min-w-0 flex-1 items-center gap-2 sm:gap-3";
    var av = document.createElement("div");
    av.className =
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 font-display text-xs font-semibold uppercase text-white/95";
    av.textContent = initials(review.authorName || "");
    var blk = document.createElement("div");
    blk.className = "min-w-0 text-left";
    var name = document.createElement("p");
    name.className = "truncate text-xs font-semibold text-white sm:text-sm";
    name.textContent = review.authorName || "Reviewer";
    blk.appendChild(name);
    if (review.subtitle) {
      var sub = document.createElement("p");
      sub.className = "truncate text-xs text-white/60";
      sub.textContent = review.subtitle;
      blk.appendChild(sub);
    }
    who.appendChild(av);
    who.appendChild(blk);

    foot.appendChild(who);
    foot.appendChild(googleBadgeSvg());
    block.appendChild(foot);
    return block;
  }

  /** Horizontal Swiper carousel for review cards */
  function buildReviewsCarousel(list) {
    var wrap = document.createElement("div");
    wrap.className = "reviews-carousel-wrap relative mt-4 pb-0 md:mt-5";

    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className =
      "google-reviews-prev absolute left-0 top-[46%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#0f2847]/95 text-lg font-semibold leading-none text-white shadow-md ring-1 ring-white/10 transition hover:bg-white/15 sm:left-1 md:flex md:h-11 md:w-11 md:text-xl";
    prevBtn.setAttribute("aria-label", "Previous review");
    prevBtn.appendChild(document.createTextNode("\u2039"));

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className =
      "google-reviews-next absolute right-0 top-[46%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#0f2847]/95 text-lg font-semibold leading-none text-white shadow-md ring-1 ring-white/10 transition hover:bg-white/15 sm:right-1 md:flex md:h-11 md:w-11 md:text-xl";
    nextBtn.setAttribute("aria-label", "Next review");
    nextBtn.appendChild(document.createTextNode("\u203a"));

    var swiperEl = document.createElement("div");
    swiperEl.className =
      "swiper google-reviews-swiper mx-auto w-full max-w-6xl overflow-hidden px-2 pb-1 sm:px-6 md:px-11 lg:px-12";
    swiperEl.style.setProperty("--swiper-pagination-bullet-inactive-opacity", "0.45");
    swiperEl.style.setProperty("--swiper-pagination-color", "#b8923c");
    swiperEl.style.setProperty("--swiper-pagination-bullet-horizontal-gap", "8px");

    var swWrap = document.createElement("div");
    swWrap.className = "swiper-wrapper items-stretch";

    for (var j = 0; j < list.length; j++) {
      var slide = document.createElement("div");
      slide.className = "swiper-slide h-auto";
      slide.appendChild(buildCard(list[j]));
      swWrap.appendChild(slide);
    }

    var pag = document.createElement("div");
    pag.className = "swiper-pagination google-reviews-swiper-pagination !relative !bottom-0 mt-5";

    swiperEl.appendChild(swWrap);
    swiperEl.appendChild(pag);

    wrap.appendChild(prevBtn);
    wrap.appendChild(nextBtn);
    wrap.appendChild(swiperEl);

    requestAnimationFrame(function () {
      if (typeof Swiper === "undefined") {
        warn("Swiper not loaded — reviews shown as carousel markup only.");
        return;
      }

      var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      try {
        new Swiper(swiperEl, {
          slidesPerView: 2,
          spaceBetween: 8,
          centeredSlides: false,
          grabCursor: true,
          watchSlidesProgress: true,
          watchOverflow: true,
          observer: true,
          observeParents: true,
          navigation: {
            prevEl: prevBtn,
            nextEl: nextBtn,
          },
          pagination: {
            el: pag,
            clickable: true,
            dynamicBullets: list.length > 5,
          },
          keyboard: { enabled: true, onlyInViewport: true },
          breakpoints: {
            768: {
              slidesPerView: 2,
              spaceBetween: 14,
            },
            1100: {
              slidesPerView: 3,
              spaceBetween: 18,
            },
          },
          speed: reducedMotion ? 0 : 480,
          autoplay: reducedMotion
            ? false
            : {
                delay: 6200,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              },
        });
      } catch (err) {
        warn(String(err && err.message ? err.message : err));
      }
    });

    return wrap;
  }

  function layout(root, data) {
    root.innerHTML = "";
    root.className = "fade-in-section is-visible mt-4 min-h-0 md:mt-6";

    var list = data.reviews && data.reviews.length ? data.reviews.slice() : [];
    if (!list.length) {
      fallback(root);
      return;
    }

    var summary = document.createElement("div");
    summary.className =
      "review-summary-strip mt-6 flex flex-col gap-2.5 border-t border-white/10 pt-5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:gap-4 sm:pt-6";

    var right = document.createElement("div");
    right.className =
      "flex w-full min-w-0 shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 xl:gap-4";

    var ratingBox = document.createElement("div");
    ratingBox.className = "flex flex-wrap items-baseline gap-x-2 gap-y-1";
    var avg = document.createElement("span");
    avg.className =
      "font-display text-xl font-bold tabular-nums tracking-tight text-white sm:text-[1.625rem]";
    avg.textContent = data.rating != null ? Number(data.rating).toFixed(2) : "";
    var st = document.createElement("span");
    st.className = "select-none text-base text-gold sm:text-xl";
    st.setAttribute("aria-hidden", "true");
    st.textContent = "★★★★★";
    var cnt = document.createElement("span");
    cnt.className = "text-xs text-white/70 sm:text-sm";
    cnt.textContent =
      "| " +
      (data.userRatingsTotal != null
        ? String(data.userRatingsTotal) + " reviews"
        : String(list.length) + " shown here");
    ratingBox.appendChild(avg);
    ratingBox.appendChild(st);
    ratingBox.appendChild(cnt);

    var write = document.createElement("a");
    write.className =
      "inline-flex items-center justify-center rounded-lg bg-[#4285f4] px-2.5 py-1.5 text-[0.6875rem] font-semibold text-white shadow transition hover:bg-[#3367d6] sm:px-4 sm:py-2 sm:text-sm";
    write.target = "_blank";
    write.rel = "noopener noreferrer";
    write.textContent = "Write a Google review";
    /** Prefer explicit GBP / Search review link — do not fall back to maps/search for this CTA */
    var reviewLink = pickWriteReviewHref(data);
    var pidClean = data.placeId && String(data.placeId).replace(/\s+/g, "");
    write.href =
      reviewLink ||
      (pidClean && pidClean.length > 8
        ? "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(String(data.placeId).trim())
        : "") ||
      "https://www.google.com/search?q=" +
        encodeURIComponent((data.placeName || "United Flooring America") + " google reviews");

    /** Optional: listing URL for “see on Maps” elsewhere (not primary CTA here) */

    right.appendChild(ratingBox);
    right.appendChild(write);
    summary.appendChild(right);
    root.appendChild(summary);

    root.appendChild(buildReviewsCarousel(list));
  }

  function fallback(root) {
    root.innerHTML = "";
    root.className = "fade-in-section is-visible mt-6 flex flex-col gap-5";

    var banner = document.createElement("div");
    banner.className =
      "flex flex-col gap-4 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6";
    var note = document.createElement("p");
    note.className = "min-w-0 flex-1 text-sm leading-snug text-amber-100/95";
    note.textContent =
      "If reviews fail to load, the page may be opened as a local file. Run a quick local server from this folder (e.g. VS Code Live Server or: python -m http.server) so data/google-reviews.json can load.";

    var btn = document.createElement("a");
    btn.className =
      "inline-flex shrink-0 items-center justify-center rounded-lg bg-[#4285f4] px-3 py-2 text-xs font-semibold text-white shadow transition hover:bg-[#3367d6] sm:px-4 sm:py-2 sm:text-sm";
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.textContent = "Write a Google review";
    var h = mountWriteFallbackHref();
    btn.href = h || "https://www.google.com/search?q=" + encodeURIComponent("United Flooring America reviews");

    banner.appendChild(note);
    banner.appendChild(btn);
    root.appendChild(banner);

    var items = [
      {
        txt:
          "From estimate to cleanup, United Flooring exceeded expectations. The crew was professional and the floors look incredible.",
        name: "Jennifer M.",
        sub: "Residential — Greenwich, CT",
      },
      {
        txt:
          "Honest timelines, transparent pricing, and attention to transitions. Easily the best contracting experience we have had.",
        name: "David R.",
        sub: "Residential — Stamford, CT",
      },
      {
        txt: "We needed waterproof vinyl for our kitchen renovation. Installation was flawless and completed on schedule.",
        name: "Angela K.",
        sub: "Residential — Fairfield County",
      },
    ];

    var fakeReviews = [];
    for (var k = 0; k < items.length; k++) {
      fakeReviews.push({
        authorName: items[k].name,
        text: "\u201C" + items[k].txt + "\u201D",
        subtitle: items[k].sub,
        rating: 5,
      });
    }

    root.appendChild(buildReviewsCarousel(fakeReviews));
  }

  function init() {
    var mount = document.getElementById("google-reviews-mount");
    if (!mount) return;

    var raw = mount.getAttribute("data-reviews-json") || "data/google-reviews.json";
    var withoutQuery = raw.indexOf("?") >= 0 ? raw.slice(0, raw.indexOf("?")) : raw;

    function loadJson(u) {
      return fetch(u, { credentials: "same-origin" }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      });
    }

    loadJson(raw)
      .catch(function () {
        if (withoutQuery !== raw) return loadJson(withoutQuery);
        throw new Error("retry");
      })
      .then(function (data) {
        if (!data.reviews || !data.reviews.length) {
          fallback(mount);
          return;
        }
        layout(mount, data);
      })
      .catch(function (err) {
        warn(String(err && err.message ? err.message : err));
        fallback(mount);
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
