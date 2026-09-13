(() => {
  "use strict";
  const { $, status, json, picture, safeUrl } = Mini;

  let busy = false;
  $("generate").addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    $("generate").disabled = true;
    $("result").replaceChildren();
    status("Loading cat…");
    try {
      const data = await json("https://api.thecatapi.com/v1/images/search");
      if (!Array.isArray(data))
        throw Error("The cat service returned an unexpected response.");
      if (!data.length) {
        status("No cat images returned. Try again.");
        return;
      }
      if (!safeUrl(data[0].url)) throw Error("No usable image was returned.");
      $("result").append(picture(data[0].url, "Random cat"));
      status("Cat photo received.");
    } catch (error) {
      status(error.message);
    } finally {
      busy = false;
      $("generate").disabled = false;
    }
  });
})();
