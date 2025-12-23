import React from "react";

export class DebugErrorBoundary extends React.Component {
  

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
  console.log("[DEBUG] componentDidCatch fired", error);

    if (window.__REPORT_ERROR__) {

      window.__REPORT_ERROR__({
        source: "react.error-boundary",
        kind: "react-runtime-error",
        message: error?.message || String(error),
        stack: error?.stack || null,
        componentStack: info?.componentStack || null,
        url: window.location.href,
        timestamp: Date.now()
      });
    } else {
    console.warn("❌ window.__REPORT_ERROR__ is missing");
  }
  }

  render() {
    if (this.state.hasError) return <h1>Something went wrong.</h1>;
    return this.props.children;
  }
}
