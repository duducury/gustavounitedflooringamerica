/**
 * Contact form: Web3Forms (JSON) when data-web3forms-key is set — emails your inbox directly.
 * Fallback: mailto draft (visitor must send from their mail app — no server needed).
 *
 * Setup: https://web3forms.com — register unitedflooringamerica@gmail.com, copy Access Key into
 * <form data-web3forms-key="YOUR_KEY_HERE"> on contact.html
 */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var WEB3_ENDPOINT = "https://api.web3forms.com/submit";

  function accessKeyConfigured() {
    var raw = form.getAttribute("data-web3forms-key") || "";
    var key = typeof raw === "string" ? raw.trim() : "";
    return key.length > 12;
  }

  function feedbackEl() {
    return document.getElementById("contact-form-feedback");
  }

  function hideFeedback() {
    var el = feedbackEl();
    if (!el) return;
    el.hidden = true;
    el.removeAttribute("data-state");
    el.textContent = "";
    el.className = "contact-form-feedback";
  }

  function showFeedback(ok, text) {
    var el = feedbackEl();
    if (!el) return;
    el.hidden = false;
    el.dataset.state = ok ? "success" : "error";
    el.textContent = text;
    el.className = "contact-form-feedback contact-form-feedback--" + (ok ? "success" : "error");
  }

  function mailtoSend(name, email, phone, msg) {
    var body =
      "Name: " +
      name +
      "\r\nEmail: " +
      email +
      "\r\nPhone: " +
      (phone || "—") +
      "\r\n\r\nMessage:\r\n" +
      msg;

    var recipient = "unitedflooringamerica@gmail.com";
    var subject = "Flooring inquiry — United Flooring America";
    window.location.href =
      "mailto:" +
      encodeURIComponent(recipient) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    showFeedback(
      true,
      "Your email app should open — press Send there to finish. If nothing opens, call (203) 526-3516."
    );
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    hideFeedback();

    var name = ((form.elements.namedItem("name") || {}).value || "").trim();
    var email = ((form.elements.namedItem("email") || {}).value || "").trim();
    var phone = ((form.elements.namedItem("phone") || {}).value || "").trim();
    var msg = ((form.elements.namedItem("message") || {}).value || "").trim();

    if (!name || !email || !msg) return;

    if (!accessKeyConfigured()) {
      mailtoSend(name, email, phone, msg);
      return;
    }

    var key = form.getAttribute("data-web3forms-key").trim();
    var btn = document.getElementById("contact-form-submit") || form.querySelector('button[type="submit"]');
    var prevText = btn ? btn.textContent : "";

    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      btn.textContent = "Sending…";
    }

    var message =
      msg +
      "\r\n\r\nPhone: " +
      (phone || "—") +
      "\r\n\r\n— Sent from unitedflooringamerica.com/contact";

    var payload = {
      access_key: key,
      subject: "Flooring inquiry — United Flooring America (website)",
      name: name,
      email: email,
      message: message,
    };

    fetch(WEB3_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok && data && data.success === true, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          showFeedback(
            true,
            "Thank you — your message was sent. We will get back to you soon."
          );
          form.reset();
        } else {
          var err =
            (result.data && (result.data.message || result.data.error)) ||
            "Could not send. Please call (203) 526-3516 or email unitedflooringamerica@gmail.com.";
          showFeedback(false, err);
        }
      })
      .catch(function () {
        showFeedback(
          false,
          "Connection error. Please try again or call (203) 526-3516."
        );
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          btn.textContent = prevText || "Get Free Estimate →";
        }
      });
  });
})();
