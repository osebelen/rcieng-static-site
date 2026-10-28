// ---- Form settings -------------------------------------------------------
// Keep false until the Worker, Resend and Turnstile are live: forms then show a "call us" notice.
var RCI_FORMS_LIVE = false;
var RCI_FORM_ENDPOINT = "https://rci-forms.REPLACE-ME.workers.dev/";   // deployed Cloudflare Worker URL
var RCI_TURNSTILE_SITEKEY = "REPLACE-ME";                                // public Turnstile site key
// --------------------------------------------------------------------------

(function () {
  var forms = document.querySelectorAll(".rci-form");
  if (!forms.length) return;

  if (!RCI_FORMS_LIVE) {
    forms.forEach(function (f) {
      var note = document.createElement("div");
      note.className = "rci-form-status err";
      note.style.cssText = "display:block;font-size:18px;line-height:1.5;background:#f6f8f7;color:#222;border:1px solid #cfd8d3;padding:24px";
      note.innerHTML = "<strong>Our online form is temporarily unavailable while we update our website.</strong><br>Please call us at <a href=\"tel:19546802690\">+1 954-680-2690</a> and we will be glad to help.";
      f.replaceWith(note);
    });
    return;
  }

  // Cloudflare Turnstile widget (invisible to most visitors).
  window.rciTurnstileReady = function () {
    forms.forEach(function (f) {
      var box = document.createElement("div");
      f.querySelector("button").before(box);
      turnstile.render(box, { sitekey: RCI_TURNSTILE_SITEKEY });
    });
  };
  var s = document.createElement("script");
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=rciTurnstileReady&render=explicit";
  s.async = true;
  document.head.appendChild(s);

  document.addEventListener("submit", function (e) {
    var form = e.target.closest(".rci-form");
    if (!form) return;
    e.preventDefault();
    var btn = form.querySelector("button"), status = form.querySelector(".rci-form-status");
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    if (!data["cf-turnstile-response"]) {
      status.className = "rci-form-status err"; status.textContent = "Please wait a moment for the security check to finish, then try again.";
      return;
    }
    btn.disabled = true; status.className = "rci-form-status"; status.textContent = "";
    fetch(RCI_FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); status.className = "rci-form-status ok"; status.textContent = "Thank you! Your message has been sent and we will be in touch shortly."; })
      .catch(function () { status.className = "rci-form-status err"; status.textContent = "Sorry, something went wrong. Please call +1 954-680-2690 or email info@rcieng.com."; })
      .then(function () { btn.disabled = false; if (window.turnstile) turnstile.reset(); });
  });
})();
