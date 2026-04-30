/**
 * Gallery: Instagram-style 3-column grid + lightbox with prev/next (keyboard + buttons).
 * Manifest: images/unitedflooringamerica/galeria/manifest.json (python scripts/update_gallery_manifest.py).
 */
(function () {
  "use strict";

  var PREFIX = "images/unitedflooringamerica/galeria/";
  var MANIFEST = "images/unitedflooringamerica/galeria/manifest.json";

  var gridRoot = document.getElementById("gallery-grid-root");
  var emptyEl = document.getElementById("gallery-empty");
  var lb = document.getElementById("gallery-lightbox");

  if (!gridRoot || !lb) return;

  var imgs = [];

  function srcFor(fn) {
    return PREFIX + encodeURIComponent(fn).replace(/%2F/g, "/");
  }

  function openLightbox(index) {
    if (imgs.length === 0) return;
    var i = ((index % imgs.length) + imgs.length) % imgs.length;
    lb.dataset.index = String(i);
    var imgEl = lb.querySelector("[data-lightbox-img]");
    var cap = lb.querySelector("[data-lightbox-caption]");
    if (imgEl) {
      imgEl.src = srcFor(imgs[i]);
      imgEl.alt = "Gallery photo — " + (i + 1) + " of " + imgs.length;
    }
    if (cap) cap.textContent = i + 1 + " / " + imgs.length;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    var closeBtn = lb.querySelector("[data-lightbox-close]");
    closeBtn?.focus({ preventScroll: true });
    lb.dispatchEvent(new CustomEvent("gallery:open"));
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }

  function step(delta) {
    var cur = parseInt(lb.dataset.index || "0", 10) || 0;
    openLightbox(cur + delta);
  }

  function buildGrid(names) {
    imgs = names.slice().sort(function (a, b) {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });
    gridRoot.textContent = "";
    if (!imgs.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    imgs.forEach(function (fn, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-thumb-btn";
      btn.setAttribute("aria-label", "Open photo " + (i + 1) + " of " + imgs.length);
      btn.setAttribute("role", "listitem");
      var im = document.createElement("img");
      im.src = srcFor(fn);
      im.alt = "";
      im.width = 400;
      im.height = 400;
      im.loading = i < 24 ? "eager" : "lazy";
      im.draggable = false;
      im.decoding = "async";
      /* Estilo hover em styles.css (.gallery-thumb-img) — Tailwind CDN não vê classes JS dinâmicas */
      im.className = "gallery-thumb-img";
      btn.appendChild(im);
      btn.addEventListener("click", function () {
        openLightbox(i);
      });
      gridRoot.appendChild(btn);
    });
  }

  function initFromManifest(data) {
    var names = (data && Array.isArray(data.images) ? data.images : []).filter(Boolean);
    buildGrid(names);
  }

  fetch(MANIFEST, { cache: "no-store" })
    .then(function (r) {
      return r.ok ? r.json() : Promise.reject(new Error(String(r.status)));
    })
    .then(initFromManifest)
    .catch(function () {
      buildGrid([]);
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent =
          "Could not load the gallery list (" + MANIFEST + "). Run: python scripts/update_gallery_manifest.py";
      }
    });

  lb.querySelector("[data-lightbox-prev]")?.addEventListener("click", function (e) {
    e.stopPropagation();
    step(-1);
  });
  lb.querySelector("[data-lightbox-next]")?.addEventListener("click", function (e) {
    e.stopPropagation();
    step(1);
  });
  lb.querySelector("[data-lightbox-close]")?.addEventListener("click", function (e) {
    e.stopPropagation();
    closeLightbox();
  });

  lb.addEventListener("click", function (e) {
    if (e.target.closest("[data-gallery-dismiss]")) closeLightbox();
  });

  function isLbOpen() {
    return lb.classList.contains("is-open");
  }

  document.addEventListener(
    "keydown",
    function (e) {
      if (!isLbOpen()) return;
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        step(1);
      } else if (e.key === "ArrowLeft") {
        step(-1);
      }
    },
    true,
  );

  var lx = null;
  var ly = null;
  var swipeTarget = lb.querySelector("[data-lightbox-img]");
  swipeTarget?.addEventListener(
    "touchstart",
    function (e) {
      if (!e.touches?.length) return;
      lx = e.touches[0].screenX;
      ly = e.touches[0].screenY;
    },
    { passive: true },
  );
  swipeTarget?.addEventListener(
    "touchend",
    function (e) {
      if (!e.changedTouches?.length || lx == null || ly == null) return;
      var x = e.changedTouches[0].screenX - lx;
      var y = e.changedTouches[0].screenY - ly;
      lx = ly = null;
      if (Math.abs(x) < 50 || Math.abs(x) < Math.abs(y)) return;
      if (x < 0) step(1);
      else step(-1);
    },
    { passive: true },
  );
})();
