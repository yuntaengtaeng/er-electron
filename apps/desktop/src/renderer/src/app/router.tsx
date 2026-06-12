import { Route, Routes } from "react-router-dom";
import { HomePage } from "../features/home";
import { PlayerPage } from "../features/player";
import { UIGuidePage } from "../features/ui-guide";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/player/:nickname" element={<PlayerPage />} />
      <Route path="/ui-guide" element={<UIGuidePage />} />
    </Routes>
  );
}
