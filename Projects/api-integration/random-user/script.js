(() => {
  "use strict";
  const { $, element, status, json, picture } = Mini;

  let busy = false;
  $("generate").addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    $("generate").disabled = true;
    $("result").replaceChildren();
    status("Loading fictional profile…");
    try {
      const data = await json("https://randomuser.me/api/");
      if (!Array.isArray(data.results))
        throw Error("The profile service returned an unexpected response.");
      if (!data.results.length) {
        status("No profiles returned. Try again.");
        return;
      }
      const user = data.results[0];
      if (!user.name) throw Error("The profile is incomplete.");
      const name = [user.name.first, user.name.last].filter(Boolean).join(" ");
      $("result").append(
        picture(user.picture?.large, "Fictional profile: " + name),
        element("h2", name),
      );
      const fields = {
        "First name": user.name.first,
        "Last name": user.name.last,
        Street: [user.location?.street?.number, user.location?.street?.name]
          .filter(Boolean)
          .join(" "),
        Phone: user.phone,
        Email: user.email,
      };
      for (const [label, value] of Object.entries(fields))
        $("result").append(
          element("p", label + ": " + (value || "Not provided")),
        );
      status("Fictional profile loaded.");
    } catch (error) {
      status(error.message);
    } finally {
      busy = false;
      $("generate").disabled = false;
    }
  });
})();
