import researchHighlights from "../../data/researchHighlights.json";
import { ResearchSectionRenderer } from "./research/ResearchSectionRenderer";
import { useRevealOnScroll } from "./research/useRevealOnScroll";
import "./research/ResearchShowcase.css";

export const RESEARCH_STAGE_ID = "selected-research-stage";

export function ResearchShowcase() {
    const hasItems = Array.isArray(researchHighlights.items) && researchHighlights.items.length > 0;
    const introReveal = useRevealOnScroll({
        threshold: 0.12,
        rootMargin: "0px 0px -12% 0px",
    });

    return (
        <section id={RESEARCH_STAGE_ID} className="home-research-stage" aria-labelledby="selected-research-title">
            <div className="home-research">
                <div
                    ref={introReveal.ref}
                    className={`home-research-intro reveal-slide-up${introReveal.isVisible ? " is-visible" : ""}`}
                >
                    <p className="section-label">{researchHighlights.sectionLabel}</p>
                    <h2 id="selected-research-title" className="home-research-title">
                        {researchHighlights.title}
                    </h2>
                    <p className="home-research-description">{researchHighlights.description}</p>
                </div>

                {hasItems ? (
                    <div className="home-research-list">
                        {researchHighlights.items.map((item) => (
                            <ResearchSectionRenderer key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="research-fallback-card">
                        <p className="research-fallback-copy">No research variants are configured yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
