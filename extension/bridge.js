window.addEventListener("DEBUG_CATCHER_EVENT", async (e) => {
  const data = e.detail;

  if (!data.file && data.stack) {
    const match = data.stack.match(/(https?:\/\/[^:\s)]+):(\d+):(\d+)/);
    if (match) {
      data.file = match[1];
      data.line = parseInt(match[2]);
    }
  }

  if (data.file && data.line && data.file.startsWith("http")) {
    try {
      const res = await fetch(data.file);
      const text = await res.text();
      const lines = text.split("\n");
      const start = Math.max(0, data.line - 5);
      data.snippet = lines.slice(start, data.line + 5)
        .map((l, i) => `${start + i + 1}: ${l}`).join("\n");
    } catch (err) { 
      data.snippet = "Code snippet unavailable"; 
    }
  }

  chrome.runtime.sendMessage({ 
    action: "NEW_EVENT", 
    payload: { ...data, timestamp: Date.now() } 
  });
});