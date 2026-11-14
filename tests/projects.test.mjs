import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import { generatePassword, randomIndex, CHARACTER_GROUPS, estimateStrength } from "../projects/password-generator/logic.mjs";
import { normalizeTodos, toggleTodo, deleteTodo, filterTodos } from "../projects/todo-app/logic.mjs";
import { WINNING_LINES, evaluateBoard } from "../projects/tic-tac-toe/logic.mjs";
import { MAX_AMOUNT, parseAmount, readRate } from "../projects/currency-converter/logic.mjs";

test("legacy tasks receive unique IDs; toggling and deleting affect one task", () => {
  let id = 0;
  const todos = normalizeTodos([{ text: "One", completed: false }, { text: "Two", completed: false }], () => String(++id));
  assert.notEqual(todos[0].id, todos[1].id);
  const updated = toggleTodo(todos, todos[0].id);
  assert.deepEqual(updated.map((todo) => todo.completed), [true, false]);
  assert.equal(todos[0].completed, false);
  assert.deepEqual(deleteTodo(updated, updated[0].id).map((todo) => todo.text), ["Two"]);
  assert.equal(filterTodos(updated, "completed").length, 1);
  assert.equal(filterTodos(updated, "active").length, 1);
});
test("task normalization repairs duplicate IDs and rejects malformed storage", () => {
  let id = 0;
  const todos = normalizeTodos([{ id: "same", text: " A ", completed: true }, { id: "same", text: "B", completed: false }], () => `new-${++id}`);
  assert.equal(todos[0].text, "A");
  assert.notEqual(todos[0].id, todos[1].id);
  for (const invalid of [{}, null, [null], [{ text: " ", completed: false }], [{ text: "A", completed: "yes" }]]) assert.throws(() => normalizeTodos(invalid, () => "id"));
});
test("every winning line works for both players", () => {
  for (const symbol of ["X", "O"]) for (const line of WINNING_LINES) {
    const board = Array(9).fill(null);
    line.forEach((index) => { board[index] = symbol; });
    assert.deepEqual(evaluateBoard(board), { winner: symbol, line });
  }
});
test("game distinguishes ongoing boards and draws", () => {
  assert.equal(evaluateBoard(Array(9).fill(null)), null);
  assert.deepEqual(evaluateBoard(["X", "O", "X", "X", "O", "O", "O", "X", "X"]), { winner: "draw", line: [] });
});
test("passwords honor every combination of selected groups at boundary lengths", () => {
  const names = Object.keys(CHARACTER_GROUPS);
  for (let mask = 1; mask < 16; mask++) {
    const selected = names.filter((_, index) => mask & (1 << index));
    for (const length of [8, 16, 44]) {
      const value = generatePassword(length, selected, webcrypto);
      assert.equal(value.length, length);
      assert.ok([...value].every((character) => selected.some((group) => CHARACTER_GROUPS[group].includes(character))));
      for (const group of selected) assert.ok([...value].some((character) => CHARACTER_GROUPS[group].includes(character)));
    }
  }
});
test("random selection rejects biased tail values and never falls back to Math.random", () => {
  const values = [4294967295, 7];
  assert.equal(randomIndex(10, { getRandomValues(buffer) { buffer[0] = values.shift(); } }), 7);
  assert.equal(values.length, 0);
  assert.throws(() => generatePassword(16, ["numbers"], {}), /Secure randomness/);
  for (const groups of [[], ["invalid"], ["numbers", "numbers"]]) assert.throws(() => generatePassword(16, groups, webcrypto));
  assert.throws(() => generatePassword(7, ["numbers"], webcrypto));
  assert.throws(() => generatePassword(65, ["numbers"], webcrypto));
  assert.equal(estimateStrength("12345678").label, "Limited");
});
test("currency amount validation accepts zero and decimals and rejects invalid input", () => {
  assert.equal(parseAmount("0"), 0);
  assert.equal(parseAmount("1.25"), 1.25);
  assert.equal(parseAmount(String(MAX_AMOUNT)), MAX_AMOUNT);
  for (const input of ["", " ", "bad", "Infinity", "-1", String(MAX_AMOUNT + 1)]) assert.throws(() => parseAmount(input));
});
test("currency results require a successful response, matching base, and finite positive rate", () => {
  const data = { result: "success", base_code: "USD", rates: { COP: 4000 } };
  assert.equal(readRate(data, "USD", "COP"), 4000);
  for (const invalid of [null, { ...data, result: "error" }, { ...data, base_code: "EUR" }, { ...data, rates: {} }, { ...data, rates: { COP: "4000" } }, { ...data, rates: { COP: -1 } }, { ...data, rates: { COP: Infinity } }]) assert.throws(() => readRate(invalid, "USD", "COP"));
});

test("both themes maintain readable text and distinguishable control borders", async () => {
  const css = await readFile(new URL("../shared/style.css", import.meta.url), "utf8");
  const tokens = (block) => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[a-f0-9]+);/gi)].map((match) => [match[1], match[2]]));
  const dark = tokens(css.match(/:root\s*\{([^}]+)\}/)[1]);
  const light = { ...dark, ...tokens(css.match(/\[data-theme="light"\]\s*\{([^}]+)\}/)[1]) };
  function luminance(hex) {
    const value = hex.length === 4 ? hex.slice(1).split("").map((digit) => digit + digit).join("") : hex.slice(1);
    const channels = value.match(/../g).map((channel) => parseInt(channel, 16) / 255).map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  }
  const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
  for (const theme of [dark, light]) {
    for (const background of ["bg", "surface", "surface-raised"]) {
      for (const foreground of ["text", "muted", "accent", "success", "danger", "warning"]) assert.ok(contrast(theme[foreground], theme[background]) >= 4.5, `${foreground} on ${background} needs more contrast`);
      assert.ok(contrast(theme["control-border"], theme[background]) >= 3, "Control boundary needs more contrast");
    }
    assert.ok(contrast(theme["on-accent"], theme["accent-bg"]) >= 4.5, "Button label needs more contrast");
  }
});

import { analyzeText, changeCase } from "../projects/text-analyzer/logic.mjs";
import { normalizeCards, columns } from "../projects/kanban-board/logic.mjs";
import { ingredients } from "../projects/recipe-explorer/logic.mjs";
import { formatTime } from "../projects/stopwatch/logic.mjs";
import { validQRText } from "../projects/qr-code-generator/logic.mjs";
import { findCountries } from "../projects/country-explorer/logic.mjs";
import { passwordChecks } from "../projects/form-validation-demo/logic.mjs";

test("text analysis handles empty text, repeated letters, Unicode, and whitespace", () => {
 assert.deepEqual(analyzeText(""), { words: 0, characters: 0, letters: 0, whitespace: 0 });
 assert.equal(analyzeText("I see three trees").words, 4);
 assert.equal(analyzeText("café 😊\n").characters, 7);
 assert.equal(analyzeText("café 😊\n").letters, 4);
 assert.equal(analyzeText("a  b\n\t").whitespace, 4);
 assert.equal(changeCase("HELLO. NEXT LINE!", "sentence"), "Hello. Next line!");
});
test("Kanban rejects duplicate IDs, unknown columns, and malformed cards", () => {
 const cards = normalizeCards([{id:"one", text:"  Work  ", column:columns[0]}, {id:"one",text:"Duplicate",column:columns[1]}, {id:"bad",text:"Invalid",column:"Elsewhere"}, null]);
 assert.deepEqual(cards, [{id:"one",text:"Work",column:"To do"}]);
 assert.deepEqual(normalizeCards({}), []);
});
test("recipe ingredients include all twenty slots and tolerate absent measures", () => {
 assert.deepEqual(ingredients({strIngredient1:" Rice ",strMeasure1:" 1 cup ",strIngredient2:"",strIngredient20:"Salt"}), ["1 cup Rice","Salt"]);
});
test("stopwatch rolls over seconds without losing accumulated minutes", () => {
 assert.equal(formatTime(0),"00:00.00");
 assert.equal(formatTime(59999),"00:59.99");
 assert.equal(formatTime(60000),"01:00.00");
 assert.equal(formatTime(3600000),"60:00.00");
});
test("QR limits are UTF-8 bytes, not UTF-16 character counts", () => {
 assert.equal(validQRText("   "),false);
 assert.equal(validQRText("a".repeat(250)),true);
 assert.equal(validQRText("a".repeat(251)),false);
 assert.equal(validQRText("😊".repeat(62)),true);
 assert.equal(validQRText("😊".repeat(63)),false);
});
test("country search supports accents, exact codes, and multiple matches", () => {
 const list = [{name:"Côte d’Ivoire",official:"Republic of Côte d’Ivoire",code:"CI"}, {name:"Colombia",official:"Republic of Colombia",code:"CO"}];
 assert.equal(findCountries(list,"cote")[0].code,"CI");
 assert.equal(findCountries(list,"co")[0].code,"CO");
 assert.equal(findCountries(list,"Republic").length,2);
 assert.equal(findCountries(list,"").length,0);
});
test("practice password requirements accept Unicode letters and reject short values", () => {
 assert.deepEqual(passwordChecks("a1"),[false,true,true,false,false]);
 assert.deepEqual(passwordChecks("abcdefghijkl"),[true,true,false,false,false]);
 assert.deepEqual(passwordChecks("é".repeat(11)+"1"),[true,true,true,false,false]);
});


import { runInNewContext } from "node:vm";
test("vendored QR encoder preserves mixed-width Unicode text exactly", async () => {
 const source = await readFile(new URL("../projects/qr-code-generator/vendor/qrcode.min.js", import.meta.url), "utf8");
 const encoderSource = source.slice(source.indexOf("function a(a)"), source.indexOf("function b(a,b)"));
 const Encoder = runInNewContext("(" + encoderSource + ")", { c: { MODE_8BIT_BYTE: 4 }, TextEncoder });
 for (const text of ["plain ASCII", "café 😊", "éa", "\u0080\u0800a", "こんにちは", "😊".repeat(62)]) {
  const encoded = new Encoder(text);
  assert.equal(new TextDecoder().decode(new Uint8Array(encoded.parsedData)), text);
 }
});


test("password generator rejects lengths above 44", () => {
 assert.equal(generatePassword(44, ["uppercase","lowercase","numbers","symbols"], webcrypto).length,44);
 assert.throws(() => generatePassword(45, ["lowercase"], webcrypto), /8 to 44/);
});
test("practice validation requires uppercase and a special character", () => {
 assert.deepEqual(passwordChecks("Practicevalue1!"), [true,true,true,true,true]);
 assert.equal(passwordChecks("Practicevalue1 ")[4],false);
 assert.equal(passwordChecks("practicevalue1!")[3],false);
});

