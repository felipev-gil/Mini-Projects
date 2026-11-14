// Browser regression tests without a test library. Never use real saved data.
const results = document.getElementById("results");
const summary = document.getElementById("summary");
const root = new URL("../", location.href);
const catalog = await (await fetch(new URL("projects.json", root))).json();
let passed = 0;
let failed = 0;
window.testCollections = new Map();

function assert(condition, message) { if (!condition) throw new Error(message); }
async function until(predicate, message, timeout = 4000) {
  const deadline = performance.now() + timeout;
  while (!predicate()) {
    if (performance.now() > deadline) throw new Error(message);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
async function test(name, run) {
  const item = document.createElement("li");
  item.textContent = `${name}: running…`;
  results.append(item);
  try { await run(); passed++; item.textContent = `PASS — ${name}`; }
  catch (error) { failed++; item.textContent = `FAIL — ${name}: ${error.message}`; }
  finally { document.getElementById("fixtures").replaceChildren(); }
  summary.textContent = `${passed} passed; ${failed} failed.`;
}

// This function is serialized into each test frame before application scripts run.
function setup(config) {
  let memory = new Map(Object.entries(config.storage || {}));
  if (config.sharedKey) {
    if (!parent.testCollections.has(config.sharedKey)) parent.testCollections.set(config.sharedKey, memory);
    memory = parent.testCollections.get(config.sharedKey);
  }
  const fixture = window.fixture = { memory, errors: [], requests: [], clipboard: null, releases: [], failCatalog: config.failCatalog, sharedKey: config.sharedKey, stallCatalog: config.stallCatalog };
  window.addEventListener("error", (event) => fixture.errors.push(event.message));
  window.addEventListener("unhandledrejection", (event) => fixture.errors.push(String(event.reason)));
  Object.defineProperty(window, "localStorage", { value: {
    getItem(key) { if (config.blockStorage) throw new Error("Storage blocked"); return memory.get(key) ?? null; },
    setItem(key, value) { if (config.blockStorage) throw new Error("Storage blocked"); memory.set(key, String(value));
      if (config.sharedKey) queueMicrotask(() => parent.document.querySelectorAll('iframe').forEach(frame => {
        const other = frame.contentWindow;
        if (other !== window && other.fixture?.sharedKey === config.sharedKey) other.dispatchEvent(new other.StorageEvent('storage', { key, newValue: String(value) }));
      }));
    },
  } });
  Object.defineProperty(navigator, "clipboard", { value: { async writeText(value) {
    if (config.blockClipboard) throw new Error("Clipboard blocked");
    fixture.clipboard = value;
  } } });
  
  if (config.fastDeadlines) {
    const originalTimeout = window.setTimeout.bind(window);
    window.setTimeout = (fn, delay, ...args) => originalTimeout(fn, delay === 12000 ? 30 : delay, ...args);
  }
  if (config.clock) {
    fixture.now = 1000;
    Object.defineProperty(performance, "now", { value: () => fixture.now });
  }
  if (config.fastReaction) {
    const originalTimeout = window.setTimeout.bind(window);
    window.setTimeout = (fn, delay, ...args) => originalTimeout(fn, delay >= 1200 && delay < 3501 ? 10 : delay, ...args);
  }
  
  if (config.mockImages) {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
    Object.defineProperty(HTMLImageElement.prototype, "src", {
      get: descriptor.get,
      set(value) {
        descriptor.set.call(this, "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      }
    });
  }
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, options) => {
    const url = new URL(input, document.baseURI);
    fixture.requests.push(url.href);
    if (config.failHeader && url.pathname.endsWith("/shared/header.html")) return new Response("", { status: 503 });
    if (url.pathname.endsWith("/projects.json")) {
      if (fixture.stallCatalog) return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')), { once: true }));
      if (fixture.failCatalog) return new Response("", { status: 503 });
      if (config.catalog) return Response.json(config.catalog);
    }
    if (url.hostname === "open.er-api.com") {
      if (config.api === "offline") throw new TypeError("Offline");
      if (config.api === "429") return new Response("", { status: 429 });
      if (config.api === "timeout") throw new DOMException("Timed out", "AbortError");
      if (config.api === "malformed") return Response.json({ result: "success", rates: {} });
      // Deliberately ignores abort to prove stale responses are discarded too.
      if (config.api === "delayed") await new Promise((resolve) => fixture.releases.push(resolve));
      return Response.json({ result: "success", base_code: url.pathname.split("/").pop(), rates: { COP: 4000, USD: 1, EUR: .9 }, time_last_update_utc: "Mon, 02 Nov 2026 00:00:00 +0000" });
    }
    
    for (const [match, mock] of Object.entries(config.mocks || {})) {
      if (!url.href.includes(match)) continue;
      if (mock.delay) await new Promise(resolve => fixture.releases.push(resolve));
      if (mock.offline) throw new TypeError("Offline");
      return Response.json(mock.body ?? {}, { status: mock.status || 200 });
    }
    return originalFetch(input, options);
  };
}

async function fixture(page, config = {}) {
  const url = new URL(page, root);
  const html = await (await fetch(url)).text();
  const frame = document.createElement("iframe");
  frame.title = "Isolated test fixture";
  const bootstrap = `<base href="${url.href}"><script>(${setup.toString()})(${JSON.stringify(config).replace(/</g, "\\u003c")});<\/script>`;
  frame.srcdoc = html.replace("<head>", `<head>${bootstrap}`);
  document.getElementById("fixtures").append(frame);
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("Frame load timed out")), 5000); frame.onload = () => { clearTimeout(timeout); resolve(); }; });
  const frameWindow = frame.contentWindow;
  const frameDocument = frame.contentDocument;
  await until(() => frameDocument.getElementById("year")?.textContent, "Shared footer did not initialize");
  return { window: frameWindow, document: frameDocument, state: frameWindow.fixture, find: (selector) => frameDocument.querySelector(selector) };
}
function input(app, selector, value, event = "input") {
  app.find(selector).value = value;
  app.find(selector).dispatchEvent(new app.window.Event(event, { bubbles: true }));
}
function clean(app) { assert(app.state.errors.length === 0, app.state.errors.join("; ")); }

await test("Catalog failure can be retried; featured selection stops at six", async () => {
  const extended = [...catalog, ...Array.from({ length: 3 }, (_, i) => ({ ...catalog[0], id: `test-${i}`, title: `Test ${i}` }))];
  const app = await fixture("index.html", { failCatalog: true, catalog: extended });
  await until(() => !app.find("#retry").hidden, "Retry was not shown");
  app.state.failCatalog = false;
  app.find("#retry").click();
  await until(() => app.document.querySelectorAll("#grid .project-card").length === extended.length, "Catalog did not recover");
  assert(app.document.querySelectorAll("#featured-grid .project-card").length === 6, "Featured cap failed");
  clean(app);
});
await test("Shared navigation failure preserves a working fallback", async () => {
  const app = await fixture("projects/tic-tac-toe/index.html", { failHeader: true });
  assert(app.find(".fallback-nav a").href === new URL("index.html", root).href, "Fallback home link is wrong");
  app.find(".cell").click();
  assert(app.find("#game-status").textContent.includes("O"), "App stopped when header failed");
  clean(app);
});
await test("Blocked storage does not break Todo or theme switching", async () => {
  const app = await fixture("projects/todo-app/index.html", { blockStorage: true });
  input(app, "#task-input", "Temporary task"); app.find("#task-form").requestSubmit();
  await until(() => app.document.querySelectorAll(".todo-item").length === 1, "Task was not added");
  assert(app.find("#storage-status").textContent.includes("could not be saved"), "Storage warning missing");
  const theme = app.document.documentElement.dataset.theme;
  app.find("#theme-toggle").click();
  assert(app.document.documentElement.dataset.theme !== theme, "Theme did not change");
  clean(app);
});
await test("Corrupt saved tasks recover; user text stays literal", async () => {
  const app = await fixture("projects/todo-app/index.html", { storage: { "mini-projects:todo:v1": "broken JSON" } });
  assert(app.find("#storage-status").textContent.includes("could not be read"), "Corruption warning missing");
  input(app, "#task-input", '<img src=x onerror="throw 1">'); app.find("#task-form").requestSubmit();
  await until(() => app.find("#todos-list").textContent.includes("<img"), "Task not added");
  assert(!app.find("#todos-list img"), "Task text became HTML");
  assert(app.find("#todos-list").textContent.includes("<img"), "Literal task text missing");
  clean(app);
});
await test("Legacy Todo migration gives separate identities and persists", async () => {
  const app = await fixture("projects/todo-app/index.html", { storage: { todos: JSON.stringify([{ text: "One", completed: false }, { text: "Two", completed: false }]) } });
  await until(() => app.state.memory.has("mini-projects:todo:v1"), "Migration not saved");
  const loaded = JSON.parse(app.state.memory.get("mini-projects:todo:v1"));
  assert(loaded.length === 2 && loaded[0].id !== loaded[1].id, "Migration lost identity");
  app.find('.todo-item input').click();
  await until(() => app.document.querySelectorAll('.todo-item.completed').length === 1, "Completion affected the wrong number of tasks");
  app.find('.delete-task').click();
  await until(() => app.document.querySelectorAll('.todo-item').length === 1, "Deletion affected the wrong number of tasks");
  clean(app);
});
for (const api of ["offline", "429", "timeout", "malformed"]) await test(`Currency handles ${api} responses and allows retry`, async () => {
  const app = await fixture("projects/currency-converter/index.html", { api });
  app.find("#converter-form").requestSubmit();
  await until(() => app.find("#result").dataset.tone === "error", "Error message missing");
  assert(!app.find("#convert").disabled, "Convert remains disabled");
  clean(app);
});
await test("Currency ignores a late response after input changes", async () => {
  const app = await fixture("projects/currency-converter/index.html", { api: "delayed" });
  app.find("#converter-form").requestSubmit();
  await until(() => app.state.releases.length, "Request did not start");
  input(app, "#amount", "20");
  app.state.releases.shift()();
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert(app.find("#result").textContent.includes("update your result"), "Stale conversion was displayed");
  clean(app);
});
await test("Same-currency zero conversion avoids the API", async () => {
  const app = await fixture("projects/currency-converter/index.html");
  input(app, "#amount", "0"); input(app, "#to", "USD", "change");
  app.find("#converter-form").requestSubmit();
  assert(app.find("#result").textContent.includes("="), "Zero was rejected");
  assert(!app.state.requests.some((url) => url.includes("open.er-api.com")), "Unnecessary API call");
  clean(app);
});
await test("Password constraints hold in the page and clipboard denial offers manual copy", async () => {
  const app = await fixture("projects/password-generator/index.html", { blockClipboard: true });
  const value = app.find("#password").value;
  assert(value.length === 16 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) && /[^a-z0-9]/i.test(value), "Default password constraints failed");
  app.find("#copy").click();
  await until(() => app.find("#password-status").dataset.tone === "error", "Clipboard error missing");
  assert(app.find("#password").selectionEnd - app.find("#password").selectionStart === 16, "Manual selection missing");
  assert(app.state.memory.size === 0, "Password was persisted");
  clean(app);
});


await test("Text Analyzer keeps markup literal, transforms text, and handles denied clipboard", async () => {
 const app = await fixture("projects/text-analyzer/index.html", {blockClipboard:true});
 input(app,"#text",'<img src=x> Hello hello');
 assert(!app.find("#preview img"),"Text was interpreted as HTML");
 app.find('[data-case="upper"]').click();
 assert(app.find("#text").value.includes("HELLO"),"Case conversion failed");
 app.find('[data-format="bold"]').click();
 assert(app.find("#preview").classList.contains("bold"),"Preview style failed");
 app.find("#copy").click();
 await until(()=>app.find("#status").dataset.tone==="error","Clipboard fallback missing");
 app.find("#clear").click();
 assert(!app.find("#text").value && app.find("#counts").textContent.includes("0 words"),"Clear failed");
 clean(app);
});
await test("Kanban supports keyboard-friendly moves, persistence, and blocked storage", async () => {
 const app = await fixture("projects/kanban-board/index.html",{blockStorage:true});
 input(app,"#task","<b>Test task</b>"); app.find("#add-form").requestSubmit();
 await until(()=>app.document.querySelectorAll(".kanban-card").length===1,"Task not added");
 assert(!app.find(".kanban-card b"),"Task became HTML");
 input(app,".kanban-card select","Done","change");
 await until(()=>app.find(".kanban-card").parentElement.querySelector("h2").textContent.includes("Done"),"Move failed");
 assert(app.find("#status").textContent.includes("Storage is unavailable"),"Storage fallback missing");
 app.find(".kanban-card button").click();
 await until(()=>!app.find(".kanban-card"),"Delete failed");
 clean(app);
});
await test("Kanban restores only valid saved cards", async () => {
 const app = await fixture("projects/kanban-board/index.html",{storage:{"mini-projects:kanban:v1":JSON.stringify([{id:"one",text:"Saved",column:"Done"},{id:"bad",text:"Bad",column:"Missing"}])}});
 assert(app.document.querySelectorAll(".kanban-card").length===1,"Saved card normalization failed"); clean(app);
});
await test("Stopwatch accumulates elapsed time across pauses and resets laps", async () => {
 const app = await fixture("projects/stopwatch/index.html",{clock:true});
 app.find("#start").click(); app.state.now += 1250; app.find("#pause").click();
 assert(app.find("#clock").textContent==="00:01.25","First interval incorrect");
 app.find("#start").click(); app.state.now += 750; app.find("#lap").click(); app.find("#pause").click();
 assert(app.find("#clock").textContent==="00:02.00","Resume lost elapsed time");
 assert(app.find("#laps li"),"Lap missing");
 app.find("#reset").click(); assert(!app.find("#laps li") && app.find("#clock").textContent==="00:00.00","Reset failed"); clean(app);
});
await test("Form validation shows field errors and never claims to create an account", async () => {
 const app = await fixture("projects/form-validation-demo/index.html");
 app.find("#demo-form").requestSubmit();
 assert(app.find("#name").getAttribute("aria-invalid")==="true","Missing required field state");
 input(app,"#name","Sample"); input(app,"#email","sample@example.com"); input(app,"#password","Practicevalue1!"); input(app,"#confirm","Practicevalue1!");
 app.find("#demo-form").requestSubmit();
 assert(app.find("#status").textContent.includes("no account was created"),"Demo success is misleading");
 assert(app.state.memory.size===0,"Form was persisted"); clean(app);
});
await test("Emoji game stops scoring at its deadline", async () => {
 const app = await fixture("projects/emoji-catcher/index.html",{clock:true});
 app.find("#start").click();
 const target = app.document.querySelector('#grid [aria-label$="smiling face"]'); assert(target,"Target missing"); target.click(); target.click();
 assert(app.find("#score").textContent==="1","Target scored twice");
 assert(app.find("#bad").textContent==="1" && app.find("#missed").textContent==="1", "Wrong click was not counted");
 assert(app.find("#total").textContent==="3", "Each replacement face should count toward the total");
 app.state.now += 31000;
 await until(()=>app.find("#time").textContent==="0","Round did not end");
 target.click(); assert(app.find("#score").textContent==="1","Scored after deadline");
 assert(Number(app.find("#score").textContent)+Number(app.find("#missed").textContent)===Number(app.find("#total").textContent),"Final face totals do not balance"); clean(app);
});
await test("Reaction game measures elapsed time and reports the result", async () => {
 const app = await fixture("projects/reaction-time-game/index.html",{clock:true,fastReaction:true});
 app.find("#start").click(); await until(()=>!app.find("#target").hidden,"Target did not appear");
 app.state.now+=250; app.find("#target").click();
 assert(app.find("#last").textContent.includes("250 ms"),"Reaction result incorrect");
 assert(app.find("#target").hidden,"Target stayed active"); clean(app);
});
await test("Country Explorer searches its bundled data without an external request", async () => {
 const app = await fixture("projects/country-explorer/index.html");
 input(app,"#query","Colombia"); app.find("#search-form").requestSubmit();
 await until(()=>app.find("#result h2"),"Country result missing");
 assert(app.find("#result").textContent.includes("Bogotá"),"Country detail missing");
 assert(!app.state.requests.some(url=>new URL(url).origin!==location.origin),"Country query left the site"); clean(app);
});
await test("QR generation includes a canvas and invalidates stale output", async () => {
 const app = await fixture("projects/qr-code-generator/index.html");
 input(app,"#text","https://example.com"); app.find("#qr-form").requestSubmit();
 assert(app.find("#qr canvas") && !app.find("#result").hidden,"QR code failed to render");
 assert(!app.find("#download").disabled,"Download not enabled");
 input(app,"#text","changed");
 assert(app.find("#result").hidden && app.find("#download").disabled,"Old QR code survived editing"); clean(app);
});
const apiCases = [
 {id:"pokemon-explorer",host:"pokeapi.co",query:"pikachu",body:{id:25,name:"pikachu",height:4,weight:60,types:[],stats:[],sprites:{}},expected:"pikachu"},
 {id:"recipe-explorer",host:"themealdb.com",query:"rice",body:{meals:[{idMeal:"1",strMeal:"Test Rice",strIngredient1:"Rice",strMeasure1:"1 cup",strInstructions:"Cook it."}]},expected:"Test Rice"},
 {id:"github-profile-finder",host:"api.github.com/users/",query:"octocat",body:{login:"octocat",name:"Sample Developer",public_repos:0},expected:"Sample Developer"},
];
for(const item of apiCases) await test(item.id + " renders a valid response and handles network failure", async () => {
 const mocks = {[item.host]:{body:item.body}};
 if(item.id==="github-profile-finder") { delete mocks[item.host]; mocks["/repos?"]={body:[]}; mocks[item.host]={body:item.body}; }
 const app = await fixture("projects/"+item.id+"/index.html",{mocks});
 if(item.query) { input(app,"#query",item.query); app.find("#search-form").requestSubmit(); }
 else if(item.button) app.find(item.button).click();
 await until(()=>app.find("#result").textContent.includes(item.expected),"API content not rendered");
 if(item.id==="recipe-explorer") { app.find("#result button").click(); assert(app.find("#recipe-detail").textContent.includes("1 cup Rice"),"Recipe detail missing"); app.find("#recipe-detail button").click(); assert(!app.find("#recipe-detail"),"Recipe did not close"); }
 clean(app);
 const offline = await fixture("projects/"+item.id+"/index.html",{mocks:{[item.host]:{offline:true}}});
 if(item.query) { input(offline,"#query",item.query); offline.find("#search-form").requestSubmit(); }
 else if(item.button) offline.find(item.button).click();
 await until(()=>offline.find("#status").dataset.tone==="error","Network error missing");
 assert(offline.find("#result").getAttribute("aria-busy")==="false","Loading state stuck"); clean(offline);
});
await test("API errors distinguish missing results and rate limits", async () => {
 for(const [statusCode,phrase] of [[404,"No Pokémon"],[429,"limiting requests"]]) {
  const app=await fixture("projects/pokemon-explorer/index.html",{mocks:{"pokeapi.co":{status:statusCode}}});
  input(app,"#query","missing"); app.find("#search-form").requestSubmit();
  await until(()=>app.find("#status").dataset.tone==="error","HTTP error not reported");
  assert(app.find("#status").textContent.includes(phrase),"Incorrect HTTP error message"); clean(app);
 }
});
await test("New API requests cannot be overwritten by late responses", async () => {
 const app=await fixture("projects/pokemon-explorer/index.html",{mocks:{
  "/pokemon/old":{delay:true,body:{id:1,name:"old",types:[],stats:[]}},
  "/pokemon/new":{body:{id:2,name:"new",types:[],stats:[]}}
 }});
 input(app,"#query","old"); app.find("#search-form").requestSubmit(); await until(()=>app.state.releases.length,"Delayed request missing");
 input(app,"#query","new"); app.find("#search-form").requestSubmit(); await until(()=>app.find("#result h2")?.textContent.includes("new"),"New response missing");
 app.state.releases.shift()(); await new Promise(resolve=>setTimeout(resolve,30));
 assert(app.find("#result h2").textContent.includes("new"),"Old response replaced current content"); clean(app);
});

await test("Avatar generates fresh usernames repeatedly and preserves custom names", async () => {
 const app = await fixture("projects/avatar-generator/index.html", {mockImages:true});
 app.find("#avatar-form").requestSubmit();
 await until(()=>app.find("#avatar-username"),"First avatar missing");
 const first = app.find("#avatar-username").textContent;
 app.find("#avatar-form").requestSubmit();
 await until(()=>app.find("#avatar-username") && app.find("#avatar-username").textContent!==first,"Repeated generation reused the same name");
 input(app,"#seed","CustomOtter"); app.find("#avatar-form").requestSubmit();
 await until(()=>app.find("#avatar-username")?.textContent==="CustomOtter","Custom username ignored");
 app.find("#avatar-form").requestSubmit();
 await until(()=>app.find("#avatar-username")?.textContent==="CustomOtter","Same-name regeneration failed");
 input(app,"#seed",""); app.find("#avatar-form").requestSubmit();
 await until(()=>app.find("#avatar-username") && app.find("#avatar-username").textContent!=="CustomOtter","Random-name action failed");
 clean(app);
});
await test("Random recipes display only their full details", async () => {
 const app = await fixture("projects/recipe-explorer/index.html",{mocks:{"themealdb.com":{body:{meals:[{idMeal:"1",strMeal:"Surprise Rice",strIngredient1:"Rice",strInstructions:"Cook."}]}}}});
 app.find("#random").click();
 await until(()=>app.find("#recipe-detail"),"Random recipe did not open");
 assert(!app.find("#result .result-grid"),"Duplicate search card remained below recipe");
 assert(app.find("#result").children.length===1,"Unexpected content beneath random recipe");
 clean(app);
});

await test("Emoji Stop unlocks pace selection and a fresh round resets counters", async () => {
 const app = await fixture("projects/emoji-catcher/index.html", {clock:true});
 assert(app.find("#stop").disabled, "Stop should be disabled before starting");
 assert(app.find('#pace option[value="900"]') && app.find('#pace option[value="600"]'), "Updated pace options missing");
 input(app,"#pace","900","change");
 app.find("#start").click();
 assert(app.find("#pace").disabled && !app.find("#stop").disabled, "Running controls incorrect");
 app.state.now += 500;
 app.find("#stop").click();
 const total = app.find("#total").textContent;
 app.document.querySelector("#grid button").click();
 assert(app.find("#total").textContent === total && app.find("#score").textContent === "0", "Stopped round accepted input");
 assert(!app.find("#pace").disabled && app.find("#stop").disabled, "Stop did not restore controls");
 input(app,"#pace","600","change");
 app.find("#start").click();
 assert(app.find("#total").textContent === "1" && app.find("#missed").textContent === "0", "New round did not reset");
 app.state.now += 601;
 await until(()=>app.find("#total").textContent === "2","Fast pace did not advance at 0.6 seconds");
 app.find("#stop").click();
 clean(app);
});
await test('Catalog timeout exposes Retry and can recover', async () => {
 const app = await fixture('index.html', { stallCatalog: true, fastDeadlines: true });
 await until(() => !app.find('#retry').hidden, 'Timed-out catalog did not expose Retry');
 app.state.stallCatalog = false; app.find('#retry').click();
 await until(() => app.document.querySelectorAll('#grid .project-card').length === catalog.length, 'Catalog retry failed');
 clean(app);
});
for (const kind of ['todo-app', 'kanban-board']) await test(kind + ' serializes concurrent tab changes without losing or resurrecting tasks', async () => {
 const a = await fixture('projects/' + kind + '/index.html', { sharedKey: kind });
 const b = await fixture('projects/' + kind + '/index.html', { sharedKey: kind });
 const field = kind === 'todo-app' ? '#task-input' : '#task';
 const form = kind === 'todo-app' ? '#task-form' : '#add-form';
 const item = kind === 'todo-app' ? '.todo-item' : '.kanban-card';
 input(a, field, 'Task A'); input(b, field, 'Task B');
 a.find(form).requestSubmit(); b.find(form).requestSubmit();
 await until(() => a.document.querySelectorAll(item).length === 2 && b.document.querySelectorAll(item).length === 2, 'Concurrent add lost a task');
 a.find(item + ' button').click();
 input(b, field, 'Task C'); b.find(form).requestSubmit();
 await until(() => a.document.querySelectorAll(item).length === 2 && b.document.querySelectorAll(item).length === 2 && a.document.body.textContent.includes('Task C'), 'Delete and add did not converge');
 assert(!a.document.querySelector(item).parentElement.textContent.includes('Task A'), 'Deleted task was resurrected');
 clean(a); clean(b);
});
summary.dataset.complete = 'true';
