FixWhere.ai 🚀
Smart Debugging Companion 

FixWhere.ai is a high-performance developer tool that intercepts React/JS errors, analyzes them using the Gemini 3 Flash model, and provides instant code fixes directly in your browser.

🏗️ CI/CD & Production Quality
Our system is built with a robust GitHub Actions pipeline:

Automated Testing: Every change is verified via Pytest.

Dockerized Deployment: We push verified images to GitHub Container Registry (GHCR).

Instant Portability: Users can deploy the entire stack using a single docker-compose command without cloning the source code.

🚀 Quick Start Guide
Step 1: Launch Infrastructure
Download docker-compose.yml from our Latest Release.

Run the following command in your terminal:

Bash

docker-compose up -d
Backend: Running at http://localhost:4000.

Extension Server: Running at http://localhost:80.

Step 2: Implement the "Error Trap" in React
To capture errors, you must wrap your application with our ErrorBoundary.

Create a file named FixWhereWrapper.js:

JavaScript

import React from 'react';

const reportErrorToBackend = async (error, info = null) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    componentStack: info ? info.componentStack : null,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch('http://localhost:4000/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    });
  } catch (e) {
    console.error('FixWhere: Failed to send error', e);
  }
};

export class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    reportErrorToBackend(error, info);
  }
  render() { return this.props.children; }
}

// Global listeners for non-React errors
window.addEventListener('error', (event) => reportErrorToBackend(event.error));
window.addEventListener('unhandledrejection', (event) => reportErrorToBackend(event.reason));
Wrap your App.js or main.jsx:

JavaScript

import { ErrorBoundary } from './FixWhereWrapper';

function App() {
  return (
    <ErrorBoundary>
      <YourAppContent />
    </ErrorBoundary>
  );
}
Step 3: Install the Extension
Download and unzip fixwhere-extension.zip from the Release page.

Open Chrome and go to chrome://extensions/.

Enable Developer mode.

Click Load unpacked and select the unzipped folder.

👤 Authors
Hodaya Cohen,
Avigail Rothman 
