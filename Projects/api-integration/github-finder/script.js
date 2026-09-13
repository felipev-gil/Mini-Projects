(() => {
  "use strict";
  const { $, element, status, json, picture, safeUrl } = Mini;

  let busy = false;
  function link(url, text) {
    const node = element("a", text);
    const safe = safeUrl(url);
    if (safe) {
      node.href = safe;
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    }
    return node;
  }
  $("search-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    const query = $("query").value.trim();
    if (!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i.test(query)) {
      status(
        "Enter a GitHub username using letters, numbers, or internal hyphens.",
      );
      return;
    }
    busy = true;
    $("search").disabled = true;
    $("profile").replaceChildren();
    $("repos").replaceChildren();
    $("repos-heading").hidden = true;
    status("Loading profile…");
    try {
      const user = await json(
        "https://api.github.com/users/" + encodeURIComponent(query),
      );
      if (!user.login) throw Error("No profile was returned.");
      const card = element("article", undefined, "panel");
      card.append(
        picture(user.avatar_url, "Avatar for " + user.login),
        element("h2", user.name || user.login),
        element("p", "@" + user.login),
        element("p", user.bio || "No bio available."),
        element("p", "Location: " + (user.location || "Not specified")),
        element("p", "Company: " + (user.company || "Not specified")),
        element(
          "p",
          "Joined: " + new Date(user.created_at).toLocaleDateString(),
        ),
        element(
          "p",
          "Followers: " +
            user.followers +
            " · Following: " +
            user.following +
            " · Repositories: " +
            user.public_repos,
        ),
        link(user.html_url, "View GitHub profile"),
      );
      if (user.blog) {
        const p = element("p");
        p.append(
          link(
            user.blog.startsWith("https://")
              ? user.blog
              : "https://" + user.blog,
            user.blog,
          ),
        );
        card.append(p);
      }
      if (user.twitter_username) {
        const p = element("p");
        p.append(
          link(
            "https://twitter.com/" + encodeURIComponent(user.twitter_username),
            "@" + user.twitter_username,
          ),
        );
        card.append(p);
      }
      $("profile").append(card);
      $("repos-heading").hidden = false;
      status("Profile loaded. Loading repositories…");
      try {
        const repos = await json(
          "https://api.github.com/users/" +
            encodeURIComponent(user.login) +
            "/repos?sort=updated&per_page=6",
        );
        if (!Array.isArray(repos))
          throw Error("Unexpected repository response.");
        for (const repo of repos) {
          const item = element("article", undefined, "result-card");
          item.append(
            link(repo.html_url, repo.name),
            element("p", repo.description || "No description available."),
            element(
              "p",
              (repo.language || "Language not specified") +
                " · Stars: " +
                repo.stargazers_count +
                " · Forks: " +
                repo.forks_count,
            ),
            element(
              "p",
              "Updated: " + new Date(repo.updated_at).toLocaleDateString(),
            ),
          );
          $("repos").append(item);
        }
        status(
          repos.length
            ? "Profile and repositories loaded."
            : "This user has no public repositories.",
        );
      } catch (error) {
        status(
          "Profile loaded, but repositories could not load: " + error.message,
        );
      }
    } catch (error) {
      status(error.message);
    } finally {
      busy = false;
      $("search").disabled = false;
    }
  });
})();
