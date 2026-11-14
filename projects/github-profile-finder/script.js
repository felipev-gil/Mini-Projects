import { $, element, status, requestJSON, image, link } from "../../shared/project-utils.js";

const request = requestJSON();
let repositoryController;
async function repositories(username, target) {
 const controller = new AbortController(); repositoryController = controller;
 const timeout = setTimeout(() => controller.abort(), 12000);
 try {
  const response = await fetch("https://api.github.com/users/" + encodeURIComponent(username) + "/repos?sort=updated&per_page=6", { signal: controller.signal, referrerPolicy: "no-referrer" });
  if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? "Repository requests are rate-limited. Try again later." : "Repositories could not be loaded. Search again to retry.");
  const repos = await response.json();
  if (!Array.isArray(repos)) throw new Error("Unexpected repository response.");
  target.replaceChildren(element("h3", "Recently updated repositories"));
  if (!repos.length) target.append(element("p", "No public repositories."));
  repos.forEach(repo => {
   const article = element("article", "", "panel result-card");
   article.append(link(repo.name || "Repository", repo.html_url), element("p", repo.description || "No description provided."), element("p", (repo.language || "Language not listed") + " · " + (repo.stargazers_count ?? 0) + " stars"));
   target.append(article);
  });
 } catch (error) {
  target.replaceChildren(element("p", controller.signal.aborted ? "Repository request canceled or timed out. Search again to retry." : error.message, "help-text"));
 } finally { clearTimeout(timeout); }
}
$("#search-form").addEventListener("submit", event => {
 event.preventDefault(); const username = $("#query").value.trim();
 if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) return status("Enter a GitHub username using letters, numbers, and internal hyphens (up to 39 characters).", "error");
 repositoryController?.abort();
 request("https://api.github.com/users/" + encodeURIComponent(username), user => {
  if (!user || typeof user.login !== "string") throw new Error("The service returned an unexpected profile.");
  const card = element("article", "", "panel stack result-card");
  card.append(image(user.avatar_url, user.login + "'s avatar", "portrait"), element("h2", user.name || user.login), element("p", "@" + user.login), element("p", user.bio || "No biography provided."));
  for (const [label, value] of Object.entries({Location:user.location,Company:user.company,Followers:user.followers,Following:user.following,"Public repositories":user.public_repos})) card.append(element("p", label + ": " + (value ?? "Not listed"), "fact"));
  card.append(link("View profile on GitHub (opens in a new tab)", "https://github.com/" + encodeURIComponent(user.login)));
  const repos = element("section", "Loading repositories…", "stack");
  $("#result").replaceChildren(card, repos); status("Showing @" + user.login + ".");
  repositories(user.login, repos);
 }, "No public user found with that username.");
});


