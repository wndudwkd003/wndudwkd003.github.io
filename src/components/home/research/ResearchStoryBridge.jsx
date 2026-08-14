export function ResearchStoryBridge({ item }) {
    return (
        <article className="research-story-bridge">
            {item.eyebrow ? <p className="research-story-bridge-eyebrow">{item.eyebrow}</p> : null}
            <p className="research-story-bridge-copy">{item.copy}</p>
        </article>
    );
}
