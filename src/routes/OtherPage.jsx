import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import siteText from "../data/siteText.json";

function getCertificateSortValue(value) {
    const text = String(value || "").trim();
    if (!text) return 0;

    const match = text.match(/\d{4}(?:[.\-/]\d{1,2})?/);
    if (!match) return 0;

    const parts = match[0].split(/[.\-/]/).map(Number);
    const year = parts[0] || 0;
    const month = parts[1] || 0;

    return year * 100 + month;
}

export function OtherPage() {
    const showCertificates = siteText.other.certificates?.hidden !== true;
    const certificates = Array.isArray(siteText.other.certificates?.items)
        ? [...siteText.other.certificates.items].sort(
              (a, b) => getCertificateSortValue(b.date) - getCertificateSortValue(a.date)
          )
        : [];
    const [openCertificateId, setOpenCertificateId] = useState(null);

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
                        {showCertificates ? (
                            <section className="other-panel other-panel-certificates">
                                <h3 className="other-panel-title">{siteText.other.certificates.title}</h3>
                                {certificates.length > 0 ? (
                                    <ul className="other-certificate-list">
                                        {certificates.map((item, index) => {
                                            const itemId = item.id || `certificate-${index}`;
                                            const panelId = `certificate-easter-egg-${index}`;
                                            const isOpen = openCertificateId === itemId;

                                            return (
                                                <li
                                                    key={`${item.title}-${item.issuer || ""}-${item.date || ""}`}
                                                    className={`other-certificate-item${isOpen ? " is-open" : ""}`}
                                                >
                                                    <button
                                                        type="button"
                                                        className="other-certificate-trigger"
                                                        aria-expanded={isOpen}
                                                        aria-controls={panelId}
                                                        onClick={() => setOpenCertificateId((prev) => (prev === itemId ? null : itemId))}
                                                    >
                                                        <div className="other-certificate-copy">
                                                            <p className="other-certificate-title">{item.title}</p>
                                                            {item.issuer ? <p className="other-certificate-meta">{item.issuer}</p> : null}
                                                        </div>
                                                        <div className="other-certificate-side">
                                                            {item.date ? <span className="other-certificate-year">{item.date}</span> : null}
                                                            <span className={`other-certificate-toggle${isOpen ? " is-open" : ""}`} aria-hidden="true">
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    className="other-certificate-toggle-icon"
                                                                >
                                                                    <path
                                                                        d="m7.5 10 4.5 4.5 4.5-4.5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    </button>
                                                    {item.easterEgg ? (
                                                        <div
                                                            id={panelId}
                                                            className={`other-certificate-easter-egg${isOpen ? " is-open" : ""}`}
                                                        >
                                                            <p className="other-certificate-easter-egg-copy">{item.easterEgg}</p>
                                                            {item.url ? (
                                                                <a
                                                                    href={item.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="other-certificate-link"
                                                                    aria-label={`${item.title} link`}
                                                                >
                                                                    <svg
                                                                        viewBox="0 0 24 24"
                                                                        className="other-certificate-link-icon"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <path
                                                                            d="M9 7h8v8"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.8"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                        <path
                                                                            d="M15.5 8.5 8 16"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.8"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </svg>
                                                                </a>
                                                            ) : null}
                                                        </div>
                                                    ) : null}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="other-certificate-empty">{siteText.other.certificates.emptyCopy}</p>
                                )}
                            </section>
                        ) : null}

                        <section className="other-panel">
                            <h3 className="other-panel-title">{siteText.other.interests.title}</h3>
                            <div className="other-chip-row">
                                {siteText.other.interests.items.map((item) => (
                                    <span key={item} className="other-chip">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="other-panel other-panel-contact">
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

                        <section className="other-panel other-panel-music">
                            <h3 className="other-panel-title">{siteText.other.music.title}</h3>
                            {siteText.other.music.items.length > 0 ? (
                                <ul className="other-music-list">
                                    {siteText.other.music.items.map((item) => (
                                        <li key={`${item.title}-${item.artist}`} className="other-music-item">
                                            <div className="other-music-copy">
                                                <p className="other-music-title">{item.title}</p>
                                                {item.artist ? (
                                                    <p className="other-music-artist">{item.artist}</p>
                                                ) : null}
                                            </div>
                                            {item.url ? (
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="other-music-link"
                                                    aria-label={`${item.title} link`}
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        className="other-music-link-icon"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            d="M9 7h8v8"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <path
                                                            d="M15.5 8.5 8 16"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </a>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="other-music-empty">{siteText.other.music.emptyCopy}</p>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
