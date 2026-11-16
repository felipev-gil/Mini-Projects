import { $ } from "../../shared/project-utils.js";

const expressionDisplay = $("#expression");
const resultDisplay = $("#result");
const status = $("#status");
let expression = "";
let justCalculated = false;

function evaluate(source) {
  const tokens = source.match(/(?:\d+\.?\d*|\.\d+)|[+−×÷()]/g) || [];
  if (!tokens.length || tokens.join("") !== source.replace(/\s/g, "")) throw new Error("Enter a valid calculation.");
  let position = 0;

  function primary() {
    const token = tokens[position];
    if (token === "+" || token === "−") {
      position += 1;
      const value = primary();
      return token === "−" ? -value : value;
    }
    if (token === "(") {
      position += 1;
      const value = sum();
      if (tokens[position] !== ")") throw new Error("Add a closing parenthesis.");
      position += 1;
      return value;
    }
    if (token === undefined || !/^\d*\.?\d+$|^\d+\.?\d*$/.test(token)) throw new Error("Complete the calculation.");
    position += 1;
    return Number(token);
  }

  function product() {
    let value = primary();
    while (tokens[position] === "×" || tokens[position] === "÷") {
      const operator = tokens[position++];
      const next = primary();
      if (operator === "÷" && next === 0) throw new Error("Cannot divide by zero.");
      value = operator === "×" ? value * next : value / next;
    }
    return value;
  }

  function sum() {
    let value = product();
    while (tokens[position] === "+" || tokens[position] === "−") {
      const operator = tokens[position++];
      const next = product();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }

  const value = sum();
  if (position !== tokens.length || !Number.isFinite(value)) throw new Error("Check the calculation and try again.");
  return Object.is(value, -0) ? 0 : Number(value.toPrecision(12));
}

function render() {
  expressionDisplay.textContent = expression || "0";
  if (!expression) {
    resultDisplay.textContent = "\u00a0";
    return;
  }
  try {
    resultDisplay.textContent = String(evaluate(expression));
  } catch {
    resultDisplay.textContent = "\u00a0";
  }
}

function append(value) {
  if (justCalculated && /[\d.(]/.test(value)) expression = "";
  justCalculated = false;
  status.textContent = "";
  expression += value;
  render();
}

function calculate() {
  if (!expression) return;
  try {
    const answer = evaluate(expression);
    expressionDisplay.textContent = expression + " =";
    resultDisplay.textContent = String(answer);
    expression = String(answer);
    justCalculated = true;
    status.textContent = "Calculation complete.";
  } catch (error) {
    status.textContent = error.message;
    resultDisplay.textContent = "Error";
  }
}

function changeSign() {
  if (!expression) return append("−");
  if (justCalculated) {
    expression = String(-Number(expression));
    justCalculated = false;
  } else if (/\d*\.?\d+$/.test(expression)) {
    const start = expression.search(/\d*\.?\d+$/);
    const hasUnaryMinus = start > 0 && expression[start - 1] === "−" && (start === 1 || /[+−×÷(]/.test(expression[start - 2]));
    expression = hasUnaryMinus
      ? expression.slice(0, start - 1) + expression.slice(start)
      : expression.slice(0, start) + "−" + expression.slice(start);
  } else {
    return append("−");
  }
  status.textContent = "";
  render();
}

document.querySelector(".calculator-keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "clear") {
    expression = "";
    justCalculated = false;
    status.textContent = "";
    render();
  } else if (button.dataset.action === "backspace") {
    expression = justCalculated ? "" : expression.slice(0, -1);
    justCalculated = false;
    status.textContent = "";
    render();
  } else if (button.dataset.action === "sign") {
    changeSign();
  } else if (button.dataset.action === "equals") {
    calculate();
  } else {
    append(button.dataset.value);
  }
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.]$/.test(event.key)) append(event.key);
  else if (["+", "-", "*", "/", "(", ")"].includes(event.key)) {
    event.preventDefault();
    append(({ "-": "−", "*": "×", "/": "÷" })[event.key] || event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculate();
  } else if (event.key === "Backspace") {
    expression = justCalculated ? "" : expression.slice(0, -1);
    justCalculated = false;
    render();
  } else if (event.key === "Escape") {
    expression = "";
    justCalculated = false;
    status.textContent = "";
    render();
  }
});

render();
