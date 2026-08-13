import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/theme/theme-provider";
import { TitleBar } from "./components/modules/title-bar";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <TitleBar />

        <main className="min-h-0 flex-1 overflow-auto">
          <App />
        </main>
      </div>
    </ThemeProvider>
  </React.StrictMode>,
);
