/**
 * Builds a mailto: draft from the contact form (static sites have no backend).
 */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = ((form.elements.namedItem("name") || {}).value || "").trim();
    var email = ((form.elements.namedItem("email") || {}).value || "").trim();
    var phone = ((form.elements.namedItem("phone") || {}).value || "").trim();
    var msg = ((form.elements.namedItem("message") || {}).value || "").trim();

    var body =
      "Name: " +
      name +
      "\r\nEmail: " +
      email +
      "\r\nPhone: " +
      phone +
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
  });
})();
