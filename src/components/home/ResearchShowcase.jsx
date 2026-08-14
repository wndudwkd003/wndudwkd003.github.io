import researchHighlights from "../../data/researchHighlights.json";
import { ResearchSectionRenderer } from "./research/ResearchSectionRenderer";
import "./research/ResearchShowcase.css";

export const RESEARCH_STAGE_ID = "selected-research-stage";

export function ResearchShowcase() {
    const baseItems = Array.isArray(researchHighlights.items)
        ? [...researchHighlights.items].sort((a, b) => (b.displayOrder ?? 0) - (a.displayOrder ?? 0))
        : [];
    const storyBridges = Array.isArray(researchHighlights.researchStoryBridges) ? researchHighlights.researchStoryBridges : [];
    const hasItems = baseItems.length > 0;
    const displayItems = hasItems
        ? baseItems.flatMap((item) => {
              const bridgesBeforeItem = storyBridges
                  .filter((bridge) => bridge.beforeItemId === item.id)
                  .map((bridge) => ({
                      id: bridge.id,
                      type: "story",
                      eyebrow: bridge.eyebrow,
                      copy: bridge.copy,
                  }));
              const bridgesAfterItem = storyBridges
                  .filter((bridge) => bridge.afterItemId === item.id)
                  .map((bridge) => ({
                      id: bridge.id,
                      type: "story",
                      eyebrow: bridge.eyebrow,
                      copy: bridge.copy,
                  }));

              return [...bridgesBeforeItem, item, ...bridgesAfterItem];
          })
        : [];
    return (
        <section id={RESEARCH_STAGE_ID} className="home-research-stage" aria-labelledby="selected-research-title">
            <div className="home-research">
                <div className="home-research-intro">
                    <p className="section-label">{researchHighlights.sectionLabel}</p>
                    <h2 id="selected-research-title" className="home-research-title">
                        {researchHighlights.title}
                    </h2>
                    <p className="home-research-description">{researchHighlights.description}</p>
                </div>

                {hasItems ? (
                    <div className="home-research-list">
                        {displayItems.map((item) => (
                            <ResearchSectionRenderer key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="research-fallback-card">
                        <p className="research-fallback-copy">No research projects are configured yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
