import { Layout } from "../components/layout/Layout";
import siteText from "../data/siteText.json";

export function OtherPage() {
    return (
        <Layout>
            <div className="page-stack">
                <header className="page-header">
                    <h2 className="page-title">{siteText.other.title}</h2>
                    <p className="page-description">{siteText.other.description}</p>
                </header>

                <div className="other-grid">
                    <div className="other-column">
                        <section className="other-panel other-panel-about">
                            <h3 className="other-panel-title">{siteText.other.about.title}</h3>
                            <ul className="other-list">
                                {siteText.other.about.notes.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="other-panel">
                            <h3 className="other-panel-title">{siteText.other.timeline.title}</h3>
                            <div className="other-timeline">
                                {siteText.other.timeline.entries.map((entry) => (
                                    <div key={`${entry.period}-${entry.title}`} className="other-timeline-item">
                                        <p className="other-timeline-period">{entry.period}</p>
                                        <div className="other-timeline-copy">
                                            <p className="other-timeline-title">{entry.title}</p>
                                            <p className="other-timeline-description">{entry.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="other-column">
                        <section className="other-panel other-panel-contact">
                            <h3 className="other-panel-title">{siteText.other.interests.title}</h3>
                            <div className="other-chip-row">
                                {siteText.other.interests.items.map((item) => (
                                    <span key={item} className="other-chip">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="other-panel">
                            <h3 className="other-panel-title">{siteText.other.contact.title}</h3>
                            <ul className="other-facts">
                                {siteText.other.contact.items.map((item) => (
                                    <li key={`${item.label}-${item.value}`}>
                                        {item.label}:{" "}
                                        {item.href ? (
                                            <a href={item.href} className="other-contact-link">
                                                {item.value}
                                            </a>
                                        ) : (
                                            item.value
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
