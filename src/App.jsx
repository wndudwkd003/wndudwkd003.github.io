import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage";
import { ProjectsPage } from "./routes/ProjectsPage";
import { PublicationsPage } from "./routes/PublicationsPage";
import { TalksPage } from "./routes/TalksPage";
import { AboutPage } from "./routes/AboutPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/publications" element={<PublicationsPage />} />
        <Route path="/talks" element={<TalksPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
