export function ResearchVariantTimeline({ item, mediaSrc, revealRef, isVisible }) {
    return (
        <article ref={revealRef} className={`research-section research-section--timeline reveal-slide-up${isVisible ? " is-visible" : ""}`}>
            <div className="research-section-head">
                <p className="research-section-kicker">{item.eyebrow}</p>
                <h3 className="research-section-title">{item.title}</h3>
                <p className="research-section-summary">{item.summary}</p>
            </div>

            <div className="research-timeline-layout">
                <div className="research-timeline-visual">
                    <div className="research-timeline-image-shell">
                        {mediaSrc ? (
                            <img src={mediaSrc} alt={item.media?.alt || item.title} className="research-timeline-image" />
                        ) : (
                            <div className="research-timeline-image-fallback">Motion demo</div>
                        )}
                    </div>

                <div className="research-timeline-metrics">
                        {item.metrics.map((metric, index) => (
                            <div key={`${item.id}-metric-${index}`} className="research-timeline-metric">
                                <span className="research-timeline-metric-label">{metric.label}</span>
                                <span className="research-timeline-metric-value">{metric.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="research-timeline-steps">
                    {item.stages.map((stage, index) => (
                        <div key={`${item.id}-stage-${index}`} className="research-timeline-step">
                            <span className="research-timeline-step-index">{String(index + 1).padStart(2, "0")}</span>
                            <div className="research-timeline-step-copy">
                                <h4 className="research-timeline-step-title">{stage.title}</h4>
                                <p className="research-timeline-step-text">{stage.copy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="research-section-tags" aria-label={`${item.title} tags`}>
                {item.tags.map((tag) => (
                    <span key={tag} className="research-section-tag">
                        {tag}
                    </span>
                ))}
            </div>
        </article>
    );
}
