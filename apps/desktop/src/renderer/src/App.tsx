import { GlobalStyle, ThemeProvider } from "@repo/ui";
import { HashRouter, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import PlayerPage from "./pages/PlayerPage";
import UIGuidePage from "./pages/UIGuidePage";

function App() {
  return (
    <ThemeProvider>
      <GlobalStyle />
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/player/:nickname" element={<PlayerPage />} />
          <Route path="/ui-guide" element={<UIGuidePage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
