// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage";
import { PublicationsPage } from "./routes/PublicationsPage";
import { OtherPage } from "./routes/OtherPage";
import { AwardsPage } from "./routes/AwardsPage";
import { HiddenPage } from "./routes/HiddenPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/publications" element={<PublicationsPage />} />
                <Route path="/awards" element={<AwardsPage />} />
                <Route path="/other" element={<OtherPage />} />
                <Route path="/hidden" element={<HiddenPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
