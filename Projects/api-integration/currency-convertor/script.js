const amountInput = document.getElementById("amount");

const MAX_AMOUNT = 999999999999;

const fromSelect = document.getElementById("from");

const toSelect = document.getElementById("to");

const result = document.getElementById("result");

const convertButton = document.getElementById("convert");

const swapButton = document.getElementById("swap");

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

initialize();

function initialize() {
  populateCurrencies();

  convertButton.addEventListener("click", convertCurrency);

  swapButton.addEventListener("click", swapCurrencies);

  amountInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      convertCurrency();
    }
  });

  loadSavedCurrencies();
}

function formatNumber(number, decimals = 2) {
  return Number(number).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function populateCurrencies() {
  currencies.forEach((currency) => {
    fromSelect.add(new Option(currency, currency));

    toSelect.add(new Option(currency, currency));
  });

  fromSelect.value = "USD";
  toSelect.value = "COP";
}

function loadSavedCurrencies() {
  const from = localStorage.getItem("currency-from");

  const to = localStorage.getItem("currency-to");

  if (from) {
    fromSelect.value = from;
  }

  if (to) {
    toSelect.value = to;
  }
}

function saveCurrencies() {
  localStorage.setItem("currency-from", fromSelect.value);

  localStorage.setItem("currency-to", toSelect.value);
}

function swapCurrencies() {
  const temp = fromSelect.value;

  fromSelect.value = toSelect.value;

  toSelect.value = temp;

  saveCurrencies();
}

async function convertCurrency() {
  const amount = Number(amountInput.value);

  const from = fromSelect.value;

  const to = toSelect.value;

  if (!amount || amount < 0) {
    result.textContent = "Please enter a valid amount.";
    return;
  }

  if (amount > MAX_AMOUNT) {
    result.textContent = `Amount must be ${formatNumber(MAX_AMOUNT, 0)} or less.`;
    return;
  }

  saveCurrencies();

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);

    const data = await response.json();

    const rate = data.rates[to];

    const convertedAmount = amount * rate;

    const formattedAmount = formatNumber(amount, amount % 1 === 0 ? 0 : 2);
    const formattedConverted = formatNumber(convertedAmount, 2);

    result.textContent = `${formattedAmount} ${from} = ${formattedConverted} ${to}`;
  } catch (error) {
    console.error(error);

    result.textContent = "Unable to retrieve exchange rates.";
  }
}
