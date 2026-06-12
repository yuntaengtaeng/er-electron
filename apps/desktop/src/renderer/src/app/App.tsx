import { GlobalStyle, ThemeProvider } from "@repo/ui";
import { HashRouter } from "react-router-dom";
import { Router } from "./router";

function App() {
  return (
    <ThemeProvider>
      <GlobalStyle />
      <HashRouter>
        <Router />
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
