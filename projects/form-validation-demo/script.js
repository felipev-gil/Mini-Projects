import { $, status } from "../../shared/project-utils.js";

import { passwordChecks } from "./logic.mjs";
const fields = ["name", "email", "password", "confirm"];
let submitted = false;
function validate() {
 const checks = passwordChecks($("#password").value);
 [...$("#requirements").children].forEach((item, index) => { item.textContent = (checks[index] ? "✓ " : "○ ") + ["At least 12 characters", "At least one letter", "At least one number", "At least one uppercase letter", "At least one special character"][index]; });
 const errors = {
   name: $("#name").value.trim() ? "" : "Enter a display name.",
   email: $("#email").value && $("#email").validity.valid ? "" : "Enter a valid email address.",
   password: checks.every(Boolean) ? "" : "Meet all five practice password requirements.",
   confirm: $("#confirm").value && $("#confirm").value === $("#password").value ? "" : "The passwords must match."
 };
 if (submitted) fields.forEach(id => { $("#" + id + "-error").textContent = errors[id]; $("#" + id).setAttribute("aria-invalid", String(Boolean(errors[id]))); });
 return errors;
}
$("#demo-form").addEventListener("input", () => { validate(); status(""); });
$("#show").addEventListener("click", () => { const show = $("#password").type === "password"; $("#password").type = $("#confirm").type = show ? "text" : "password"; $("#show").setAttribute("aria-pressed", String(show)); $("#show").textContent = show ? "Hide password" : "Show password"; });
$("#demo-form").addEventListener("submit", event => {
 event.preventDefault(); submitted = true;
 const errors = validate(), invalid = fields.find(id => errors[id]);
 if (invalid) { $("#" + invalid).focus(); status("Review the highlighted fields.", "error"); }
 else status("Validation passed. This is a demo; no account was created.", "success");
});



