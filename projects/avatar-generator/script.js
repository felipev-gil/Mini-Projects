import { $, element, status, link } from "../../shared/project-utils.js";

const adjectives = ["Bright", "Curious", "Gentle", "Lucky", "Mellow", "Nimble", "Sunny", "Swift"];
const animals = ["Badger", "Falcon", "Fox", "Koala", "Otter", "Panda", "Raven", "Tiger"];
let version = 0, timer, previousName = "";

function randomUsername() {
  let name;
  do {
    name = adjectives[Math.floor(Math.random() * adjectives.length)]
      + animals[Math.floor(Math.random() * animals.length)]
      + (1000 + Math.floor(Math.random() * 9000));
  } while (name === previousName);
  previousName = name;
  return name;
}

$("#avatar-form").addEventListener("submit", event => {
  event.preventDefault();
  const current = ++version;
  clearTimeout(timer);
  const username = $("#seed").value.trim() || randomUsername();
  const style = $("#style").value;
  if (!["lorelei", "bottts", "pixel-art"].includes(style)) return;
  const url = "https://api.dicebear.com/10.x/" + style + "/svg?seed=" + encodeURIComponent(username);
  const img = document.createElement("img");
  img.alt = style + " avatar for " + username;
  img.className = "portrait";
  img.referrerPolicy = "no-referrer";
  $("#result").replaceChildren();
  $("#result").setAttribute("aria-busy", "true");
  status("Loading avatar for " + username + "…");
  function fail() {
    if (current !== version) return;
    clearTimeout(timer);
    $("#result").setAttribute("aria-busy", "false");
    status("The avatar could not load. Check your connection and generate it again.", "error");
  }
  img.addEventListener("load", () => {
    if (current !== version) return;
    clearTimeout(timer);
    const card = element("div", "", "panel stack");
    const name = element("h2", username);
    name.id = "avatar-username";
    card.append(name, img, link("Open avatar image (opens in a new tab)", url));
    $("#result").replaceChildren(card);
    $("#result").setAttribute("aria-busy", "false");
    status("Avatar ready for " + username + ".", "success");
  }, { once: true });
  img.addEventListener("error", fail, { once: true });
  timer = setTimeout(() => { fail(); version++; }, 12000);
  img.src = url;
});
