/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Blog } from "./Blog";

function Router() {
  const pathname = window.location.pathname;

  if (pathname.startsWith("/blog")) {
    const slug = pathname.replace("/blog/", "").replace(/\/$/, "");
    return <Blog slug={slug || undefined} />;
  }

  return <App />;
}

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Router />
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}

// Handle browser back/forward navigation
window.addEventListener("popstate", () => {
  const root = (import.meta.hot?.data?.root ?? createRoot(elem));
  root.render(app);
});
