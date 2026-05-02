/**
 * Before/after image comparison — pointer + keyboard (home section)
 */
(function () {
  "use strict";

  var root = document.getElementById("home-ba-compare");
  if (!root) return;

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function getPct() {
    var raw = getComputedStyle(root).getPropertyValue("--ba-pos").trim();
    var n = parseFloat(raw);
    return Number.isFinite(n) ? clamp(n, 0, 100) : 50;
  }

  function setPct(pct) {
    root.style.setProperty("--ba-pos", clamp(pct, 0, 100).toFixed(2) + "%");
  }

  function pctFromClientX(clientX) {
    var rect = root.getBoundingClientRect();
    if (rect.width <= 0) return 50;
    return ((clientX - rect.left) / rect.width) * 100;
  }

  var activePointerId = null;

  function endDrag(e) {
    if (activePointerId === null) return;
    if (e && e.pointerId !== activePointerId) return;
    activePointerId = null;
    root.classList.remove("ba-compare--dragging");
  }

  root.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activePointerId = e.pointerId;
    root.classList.add("ba-compare--dragging");
    setPct(pctFromClientX(e.clientX));
    try {
      root.setPointerCapture(e.pointerId);
    } catch (_) {}
  });

  root.addEventListener("pointermove", function (e) {
    if (activePointerId === null || e.pointerId !== activePointerId) return;
    setPct(pctFromClientX(e.clientX));
  });

  root.addEventListener("pointerup", endDrag);
  root.addEventListener("pointercancel", endDrag);

  root.addEventListener("lostpointercapture", function () {
    activePointerId = null;
    root.classList.remove("ba-compare--dragging");
  });

  root.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    var step = e.shiftKey ? 10 : 3;
    var next = getPct() + (e.key === "ArrowRight" ? step : -step);
    setPct(next);
  });
})();
