
(function() {
  const send = (payload) => {
    // שלב קריטי: הפיכה ל-JSON כדי שהמידע לא ילך לאיבוד במעבר בין "עולמות"
    window.dispatchEvent(new CustomEvent("DEBUG_CATCHER_EVENT", {
      detail: JSON.parse(JSON.stringify(payload, (key, value) => 
        value instanceof Error ? { message: value.message, stack: value.stack } : value
      ))
    }));
  };

  window.addEventListener("error", (e) => {
    send({ source: "window.error", kind: "runtime-error", message: e.message, stack: e.error?.stack, file: e.filename, line: e.lineno });
  });

  window.addEventListener("unhandledrejection", (e) => {
    console.log("[DEBUG-HOOK] Raw rejection event:", e); // הוסיפי את זה
    send({ source: "unhandledrejection", kind: "promise-error", message: e.reason?.message || String(e.reason), stack: e.reason?.stack });
  });

  window.__REPORT_ERROR__ = (p) => send({ ...p, source: "react.error-boundary" });

  const org = console.error;
  console.error = (...args) => {
    org.apply(console, args);
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    if (!msg.includes("Vite")) {
       send({ source: "console", kind: "error", message: msg, stack: new Error().stack });
    }
  };
})();