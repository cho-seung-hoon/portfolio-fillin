
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

async function enableMocking() {
  // Check if mocking is enabled via environment variable
  // Default to true in development if not specified, OR force false if specified
  const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  const isDev = import.meta.env.MODE === "development";

  if (!isDev || !useMock) {
    return;
  }

  const { worker } = await import("./mocks/browser");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
