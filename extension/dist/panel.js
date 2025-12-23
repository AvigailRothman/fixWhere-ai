const container = document.getElementById("log-container");

function isProbablyNoiseConsole(p) {
  const f = (p.file || "").toLowerCase();
  const msg = (p.message || "").toLowerCase();
  return (
    msg.includes("extension context invalidated") || 
    f.includes("chrome-extension://")
  );
}

function isSolvable(p) {
  if (!p) return false;
  if (!p.message || p.message.trim() === "") return false;
  if (p.source === "react.error-boundary") return true;
  if (p.source === "window.error" || p.source === "unhandledrejection") {
    const hasLocation = (p.file && p.line) || (p.stack && p.stack.length > 20);
    return hasLocation;
  }
  if (p.source === "console" && (p.kind === "error" || p.kind === "warn")) {
    const hasStack = p.stack && p.stack.length > 20;
    return hasStack && !isProbablyNoiseConsole(p);
  }
  return false;
}

async function copyText(text) {
  await navigator.clipboard.writeText(text || "");
}

async function fetchTextSafe(url) {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function niceLocation(p) {
  if (p.file && p.line) return `${p.file}:${p.line}`;
  return "No code location";
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderChangeCard(change) {
  const card = document.createElement("div");
  card.className = "card";

  const file = change?.file || "(unknown)";
  const line = change?.startLine ?? change?.line ?? change?.aroundLine ?? null;

  const loc = document.createElement("div");
  loc.className = "meta";
  loc.textContent = line ? `File: ${file} | Around line: ${line}` : `File: ${file}`;

  const kind = (change?.type || "").toLowerCase();
  let before = change?.before ?? "";
  let after = change?.after ?? change?.code ?? "";

  const header = document.createElement("div");
  header.className = "meta";
  header.style.fontWeight = "700";
  header.textContent = `Change: ${kind.toUpperCase()}`;

  const grid = document.createElement("div");
  grid.className = "grid2";

  const beforeBox = document.createElement("div");
  beforeBox.className = "box";
  beforeBox.innerHTML = `<div class="colTitle">BEFORE</div><pre>${escapeHtml(before)}</pre>`;
  
  const afterBox = document.createElement("div");
  afterBox.className = "box";
  afterBox.innerHTML = `<div class="colTitle">AFTER</div><pre>${escapeHtml(after)}</pre>`;

  grid.append(beforeBox, afterBox);
  card.append(header, loc, grid);

  const row = document.createElement("div");
  row.className = "row";
  const copyWhere = document.createElement("button");
  copyWhere.className = "btn";
  copyWhere.textContent = "Copy Where";
  copyWhere.onclick = () => copyText(`File: ${file}${line ? `\nLine: ${line}` : ""}`);
  
  row.appendChild(copyWhere);
  card.appendChild(row);

  return card;
}

function renderResult(result) {
  // המבנה שמתקבל הוא result.analysis
  const wrap = document.createElement("div");
  wrap.className = "details";

  const summaryText = result?.summary || "No summary provided.";
  const s = document.createElement("div");
  s.innerHTML = `
    <div class="title" style="color: #2da44e;">Proposed Solution</div>
    <div class="msg">${escapeHtml(summaryText)}</div>
  `;
  wrap.appendChild(s);

  if (Array.isArray(result?.instructions) && result.instructions.length) {
    const inst = document.createElement("div");
    inst.className = "card";
    inst.innerHTML = `<div class="title">Steps</div>`;
    const ul = document.createElement("ul");
    result.instructions.forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      ul.appendChild(li);
    });
    inst.appendChild(ul);
    wrap.appendChild(inst);
  }

  const changes = Array.isArray(result?.changes) ? result.changes : [];
  changes.forEach(c => wrap.appendChild(renderChangeCard(c)));

  return wrap;
}

function addIssue(payload) {
  if (!isSolvable(payload)) return;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="title">Solvable Issue <span class="pill">${payload.source}</span></div>
    <div class="meta">${niceLocation(payload)}</div>
    <div class="msg">${escapeHtml(payload.message || "")}</div>
    <div class="row" id="actions-${payload.timestamp}"></div>
    <div id="result-${payload.timestamp}"></div>
  `;

  container.prepend(card);

  const actions = card.querySelector(`#actions-${payload.timestamp}`);
  const resultHost = card.querySelector(`#result-${payload.timestamp}`);

  const btnSolve = document.createElement("button");
  btnSolve.className = "solve";
  btnSolve.textContent = "SOLVE WITH AI";

  btnSolve.onclick = async () => {
    btnSolve.disabled = true;
    btnSolve.textContent = "Analyzing...";

    try {
      const res = await fetch("http://127.0.0.1:4000/ingest-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("[PANEL] Server response:", data);

      if (data.received && data.analysis) {
        resultHost.innerHTML = "";
        // שולחים לרינדור את האובייקט הפנימי analysis
        resultHost.appendChild(renderResult(data.analysis));
        btnSolve.textContent = "Solved";
      } else {
        throw new Error("Missing analysis in response");
      }
    } catch (e) {
      console.error(e);
      btnSolve.textContent = "Failed";
      btnSolve.disabled = false;
    }
  };

  actions.appendChild(btnSolve);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "NEW_EVENT") addIssue(msg.payload);
  if (msg.action === "CLEAR") container.innerHTML = "";
});