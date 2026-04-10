export function ResearchStoryBridge({ item, revealRef, isVisible }) {
    return (
        <article
            ref={revealRef}
            className={`research-story-bridge reveal-slide-up${isVisible ? " is-visible" : ""}`}
        >
            {item.eyebrow ? <p className="research-story-bridge-eyebrow">{item.eyebrow}</p> : null}
            <p className="research-story-bridge-copy">{item.copy}</p>
        </article>
    );
}
