/**
 * Web3Forms: any <form data-web3forms-key="..."> with matching
 * data-web3forms-feedback="element-id" on the form (points to #element-id for status).
 * Fallback: mailto draft when the key is missing or too short.
 */
(function () {
  "use strict";

  var WEB3_ENDPOINT = "https://api.web3forms.com/submit";

  function trimVal(form, fieldName) {
    var el = form.elements.namedItem(fieldName);
    if (!el || typeof el.value !== "string") return "";
    return el.value.trim();
  }

  function feedbackForForm(form) {
    var id = form.getAttribute("data-web3forms-feedback");
    if (!id) return null;
    return document.getElementById(id);
  }

  function hideFeedback(el) {
    if (!el) return;
    el.hidden = true;
    el.removeAttribute("data-state");
    el.textContent = "";
    el.classList.remove("contact-form-feedback--success", "contact-form-feedback--error");
  }

  function showFeedback(el, ok, text) {
    if (!el) return;
    el.hidden = false;
    el.dataset.state = ok ? "success" : "error";
    el.textContent = text;
    el.classList.remove("contact-form-feedback--success", "contact-form-feedback--error");
    el.classList.add("contact-form-feedback--" + (ok ? "success" : "error"));
  }

  function accessKeyConfigured(form) {
    var raw = form.getAttribute("data-web3forms-key") || "";
    var key = typeof raw === "string" ? raw.trim() : "";
    return key.length > 12;
  }

  function defaultSubject(form) {
    return (
      form.getAttribute("data-web3forms-subject") ||
      "Flooring inquiry — United Flooring America (website)"
    ).trim();
  }

  function defaultFooter(form) {
    return (
      form.getAttribute("data-web3forms-footer") ||
      "— Sent from unitedflooringamerica.com"
    ).trim();
  }

  function extraDetailLines(form) {
    var lines = [];
    var zip = trimVal(form, "zip");
    var service = trimVal(form, "service");
    var timeframe = trimVal(form, "timeframe");
    if (zip) lines.push("Project ZIP: " + zip);
    if (service) lines.push("Services: " + service);
    if (timeframe) lines.push("Ideal start timeframe: " + timeframe);
    return lines;
  }

  function buildWebMessage(form, msg, phone) {
    var extras = extraDetailLines(form);
    var body = msg;
    if (extras.length) {
      body += "\r\n\r\n" + extras.join("\r\n");
    }
    body += "\r\n\r\nPhone: " + (phone || "—");
    body += "\r\n\r\n" + defaultFooter(form);
    return body;
  }

  function mailtoSend(form, name, email, phone, msg) {
    var extras = extraDetailLines(form);
    var detailBlock = extras.length ? "\r\n\r\n" + extras.join("\r\n") : "";
    var body =
      "Name: " +
      name +
      "\r\nEmail: " +
      email +
      "\r\nPhone: " +
      (phone || "—") +
      detailBlock +
      "\r\n\r\nProject details:\r\n" +
      msg;

    var recipient = "unitedflooringamerica@gmail.com";
    var subject = defaultSubject(form);
    window.location.href =
      "mailto:" +
      encodeURIComponent(recipient) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    var fb = feedbackForForm(form);
    showFeedback(
      fb,
      true,
      "Your email app should open — press Send there to finish. If nothing opens, call (203) 526-3516."
    );
  }

  function initForm(form) {
    var feedback = feedbackForForm(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideFeedback(feedback);

      var name = trimVal(form, "name");
      var email = trimVal(form, "email");
      var phone = trimVal(form, "phone");
      var msg = trimVal(form, "message");

      if (!name || !email || !msg) {
        showFeedback(
          feedback,
          false,
          "Please enter your name, email, and project details so we can help."
        );
        return;
      }

      if (!accessKeyConfigured(form)) {
        mailtoSend(form, name, email, phone, msg);
        return;
      }

      var key = form.getAttribute("data-web3forms-key").trim();
      var btn = form.querySelector('button[type="submit"]');
      var prevText = btn ? btn.textContent : "";

      if (btn) {
        btn.disabled = true;
        btn.setAttribute("aria-busy", "true");
        btn.textContent = "Sending…";
      }

      var message = buildWebMessage(form, msg, phone);
      var payload = {
        access_key: key,
        subject: defaultSubject(form),
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
              feedback,
              true,
              "Thank you — your message was sent. We will get back to you soon."
            );
            form.reset();
          } else {
            var err =
              (result.data && (result.data.message || result.data.error)) ||
              "Could not send. Please call (203) 526-3516 or email unitedflooringamerica@gmail.com.";
            showFeedback(feedback, false, err);
          }
        })
        .catch(function () {
          showFeedback(
            feedback,
            false,
            "Connection error. Please try again or call (203) 526-3516."
          );
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.removeAttribute("aria-busy");
            btn.textContent = prevText || "Submit";
          }
        });
    });
  }

  document.querySelectorAll("form[data-web3forms-key]").forEach(initForm);
})();
