export function ResearchVariantCommandCenter({ item, revealRef, isVisible }) {
    return (
        <article
            ref={revealRef}
            className={`research-section research-section--command-center reveal-slide-up${isVisible ? " is-visible" : ""}`}
        >
            <div className="research-section-head">
                <p className="research-section-kicker">{item.eyebrow}</p>
                <h3 className="research-section-title">{item.title}</h3>
                <p className="research-section-summary">{item.summary}</p>
            </div>

            <div className="research-command-layout">
                <div className="research-command-board">
                    <div className="research-command-panels">
                        {item.panels.map((panel, index) => (
                            <div key={`${item.id}-panel-${index}`} className="research-command-panel">
                                <span className="research-command-panel-label">{panel.label}</span>
                                <span className="research-command-panel-value">{panel.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="research-command-feed">
                        {item.messages.map((message, index) => (
                            <div key={`${item.id}-message-${index}`} className="research-command-message">
                                <span className="research-command-message-dot" />
                                <span>{message}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="research-command-agents">
                    {item.agents.map((agent, index) => (
                        <article key={`${item.id}-agent-${index}`} className="research-command-agent">
                            <div className="research-command-agent-head">
                                <h4 className="research-command-agent-name">{agent.name}</h4>
                                <span className="research-command-agent-state">{agent.state}</span>
                            </div>
                            <p className="research-command-agent-role">{agent.role}</p>
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
