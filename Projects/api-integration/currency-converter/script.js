(() => {
  "use strict";
  const { $, status, json } = Mini;

  const currencies = [
    "USD",
    "EUR",
    "GBP",
    "COP",
    "JPY",
    "CAD",
    "AUD",
    "CHF",
    "MXN",
    "BRL",
  ];
  for (const id of ["from", "to"])
    for (const code of currencies) $(id).add(new Option(code, code));
  $("to").value = "COP";
  try {
    for (const id of ["from", "to"]) {
      const saved = localStorage.getItem("currency-" + id);
      if (currencies.includes(saved)) $(id).value = saved;
    }
  } catch {}
  $("swap").addEventListener("click", () => {
    const from = $("from").value;
    $("from").value = $("to").value;
    $("to").value = from;
  });
  let busy = false;
  $("convert-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    const amount = Number($("amount").value),
      from = $("from").value,
      to = $("to").value;
    if (
      !$("amount").value.trim() ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      amount > 999999999
    ) {
      status("Enter an amount between 0 and 999,999,999.");
      return;
    }
    busy = true;
    $("convert").disabled = true;
    status("Loading exchange rates…");
    try {
      const data = await json(
        "https://open.er-api.com/v6/latest/" + encodeURIComponent(from),
      );
      const rate = data.rates?.[to];
      if (data.result !== "success" || !Number.isFinite(rate) || rate <= 0)
        throw new Error("No rate was returned for these currencies.");
      status(
        amount.toLocaleString() +
          " " +
          from +
          " = " +
          (amount * rate).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          }) +
          " " +
          to +
          "\nPublished: " +
          (data.time_last_update_utc || "date unavailable"),
      );
      try {
        localStorage.setItem("currency-from", from);
        localStorage.setItem("currency-to", to);
      } catch {}
    } catch (error) {
      status(error.message);
    } finally {
      busy = false;
      $("convert").disabled = false;
    }
  });
})();
