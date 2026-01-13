import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Check for stored theme preference, default to dark
const storedTheme = localStorage.getItem("crispr-theme");
if (storedTheme === "light") {
  document.documentElement.classList.remove("dark");
  document.documentElement.classList.add("light");
} else {
  document.documentElement.classList.add("dark");
  document.documentElement.classList.remove("light");
}

createRoot(document.getElementById("root")!).render(<App />);
