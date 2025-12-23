import { useEffect } from "react";    
import React from "react";

export default function App() {
  // 1️⃣ React render error

  // 1️⃣ JS runtime
  window.runJsError = () => {
    throw new Error("JS ERROR");
  };

  // 2️⃣ Promise
  window.runPromiseError = () => {
    Promise.reject(new Error("PROMISE ERROR"));
  };

  // 3️⃣ React render
  window.runReactError = () => {
    setShow(true);
  };

  const [show, setShow] = React.useState(false);

  if (show) {
    throw new Error("REACT RENDER ERROR");
  }

  // 4️⃣ Effect
  React.useEffect(() => {
    if (window.__RUN_EFFECT_ERROR__) {
      throw new Error("EFFECT ERROR");
    }
  }, []);

  return (
    <div>
      <button onClick={runJsError}>JS Error</button>
      <button onClick={runPromiseError}>Promise Error</button>
      <button onClick={runReactError}>React Render Error</button>
      <button onClick={() => (window.__RUN_EFFECT_ERROR__ = true)}>
        Effect Error
      </button>
    </div>
  );
}

  
