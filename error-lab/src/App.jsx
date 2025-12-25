

  
import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [crashApp, setCrashApp] = useState(false);

  const triggerRefError = () => { const res = globalConfig.db_port; };
  const triggerTypeError = () => { const items = null; items.forEach(i => i); };
  const triggerAsyncError = async () => { await fetch("https://api.internal.logs/v1/sync"); };
  const triggerLogicError = () => { const auth = {}; auth.verify(); };

  if (crashApp) {
    return <div className="main-content"><h2>Critical Failure: {system_kernel.id}</h2></div>;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-brand">CORE_OS v2.5</div>
        <nav style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <div style={{color: '#64748b', fontSize: '0.8rem', marginBottom: '10px'}}>MAIN MENU</div>
          <button className="nav-btn active" style={{width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'}}>Instrument Panel</button>
          <button className="nav-btn" style={{width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer'}}>Network Logs</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div className="badge">SYSTEM_STATUS: STABLE</div>
          <h2>Control Terminal</h2>
          <p style={{color: '#64748b'}}>Simulate low-level system exceptions to verify agent response.</p>
        </header>

        <div className="error-grid">
          {/* Card 1 */}
          <div className="system-card">
            <div className="card-info">
              <div className="badge">MODULE: MEMORY_SCOPE</div>
              <h3>01. Reference Context Trace</h3>
              <p>Attempts to access uninitialized global pointers in the system kernel.</p>
            </div>
            <button className="run-btn" onClick={triggerRefError}>Run Process</button>
          </div>

          {/* Card 2 */}
          <div className="system-card" style={{"--accent": "#fbbf24"}}>
            <div className="card-info">
              <div className="badge">MODULE: IO_NETWORK</div>
              <h3>02. Async Data Synchronization</h3>
              <p>Triggers unhandled rejection during remote handshake protocol.</p>
            </div>
            <button className="run-btn" onClick={triggerAsyncError}>Run Process</button>
          </div>

          {/* Card 3 */}
          

          {/* Card 4 */}
          <div className="system-card" style={{"--accent": "#34d399"}}>
            <div className="card-info">
              <div className="badge">MODULE: DATA_PARSER</div>
              <h3>04. Pointer De-referencing</h3>
              <p>Executes map operations on non-iterable null response objects.</p>
            </div>
            <button className="run-btn" onClick={triggerTypeError}>Run Process</button>
          </div>

          {/* Card 5 */}
          <div className="system-card" style={{"--accent": "#a78bfa"}}>
            <div className="card-info">
              <div className="badge">MODULE: AUTH_SERVICE</div>
              <h3>05. Method Invocation Leak</h3>
              <p>Calls non-existent authentication methods on undefined user prototypes.</p>
            </div>
            <button className="run-btn" onClick={triggerLogicError}>Run Process</button>
          </div>

          
        </div>
      </main>
    </div>
  );
}