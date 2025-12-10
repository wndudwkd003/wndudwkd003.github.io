// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage";
import { ProjectsPage } from "./routes/ProjectsPage";
import { PublicationsPage } from "./routes/PublicationsPage";
import { OtherPage } from "./routes/OtherPage";
import { AwardsPage } from "./routes/AwardsPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/publications" element={<PublicationsPage />} />
                <Route path="/awards" element={<AwardsPage />} />
                <Route path="/other" element={<OtherPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
