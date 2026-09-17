import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import AuthGate from "../app/AuthGate";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode><AuthGate><Home /></AuthGate></StrictMode>,
);
