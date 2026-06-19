import { Route, Routes } from "react-router-dom";
import { HomePage } from "../features/home";
import { PlayerPage } from "../features/player";
import { UIGuidePage } from "../features/ui-guide";
import { RankingPage } from "../features/ranking";
import { ComparePage } from "../features/compare";
import { ItemAnalysisPage } from "../features/item-analysis";
import { VisionSourcePage } from "../features/vision-source";
import { PhaseCombatPage } from "../features/phase-combat";
import { RankerDataPage } from "../features/ranker-data";
import { TeamComboPage } from "../features/team-combo";
import { CharacterAnalysisPage } from "../features/character-analysis";
import { PatchNotesPage, PatchNotesDetailPage } from "../features/patch-notes";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/player/:nickname" element={<PlayerPage />} />
      <Route path="/ranking" element={<RankingPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/item-analysis" element={<ItemAnalysisPage />} />
      <Route path="/vision-source" element={<VisionSourcePage />} />
      <Route path="/phase-combat" element={<PhaseCombatPage />} />
      <Route path="/team-combo" element={<TeamComboPage />} />
      <Route path="/character-analysis" element={<CharacterAnalysisPage />} />
      <Route path="/ranker-data" element={<RankerDataPage />} />
      <Route path="/ui-guide" element={<UIGuidePage />} />
      <Route path="/patch-notes" element={<PatchNotesPage />} />
      <Route path="/patch-notes/:version" element={<PatchNotesDetailPage />} />
    </Routes>
  );
}
