export function ResearchVariantEditorial({ item }) {
    return (
        <article className="research-section research-section--editorial">
            <div className="research-section-head">
                <p className="research-section-kicker">{item.eyebrow}</p>
                <h3 className="research-section-title">{item.title}</h3>
                <p className="research-section-summary">{item.summary}</p>
            </div>

            <div className="research-editorial-grid">
                <div className="research-editorial-compare">
                    <div className="research-editorial-compare-card">
                        <span className="research-editorial-compare-label">{item.comparison.leftLabel}</span>
                        <h4 className="research-editorial-compare-title">{item.comparison.leftTitle}</h4>
                    </div>
                    <div className="research-editorial-compare-card">
                        <span className="research-editorial-compare-label">{item.comparison.rightLabel}</span>
                        <h4 className="research-editorial-compare-title">{item.comparison.rightTitle}</h4>
                    </div>
                </div>

                <div className="research-editorial-callouts">
                    {item.callouts.map((callout, index) => (
                        <article key={`${item.id}-callout-${index}`} className="research-editorial-callout">
                            <h4 className="research-editorial-callout-title">{callout.title}</h4>
                            <p className="research-editorial-callout-copy">{callout.copy}</p>
                        </article>
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
