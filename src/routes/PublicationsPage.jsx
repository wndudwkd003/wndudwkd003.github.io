import { useMemo, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { publications } from "../data/publications";
import siteText from "../data/siteText.json";

const CATEGORY_LABEL_MAP = {
    "국제 저널": "International Journals",
    "국제 학회": "International Conferences",
    "국내 저널": "Domestic Journals",
    "국내 학회": "Domestic Conferences",
};

const CATEGORY_ORDER = ["국제 저널", "국제 학회", "국내 저널", "국내 학회"];

function formatDate(dateStr) {
    if (!dateStr) return "";
    return dateStr.slice(0, 7).replace("-", ".");
}

function renderBreakableText(value, italic = false) {
    const text = String(value || "").trim();
    if (!text) return null;

    const content = text.split(/(,\s*)/).map((part, index) => {
        if (!part) return null;

        if (part.includes(",")) {
            return (
                <span key={`${text}-${index}`}>
                    {part}
                    <wbr />
                </span>
            );
        }

        return <span key={`${text}-${index}`}>{part}</span>;
    });

    return italic ? <em>{content}</em> : content;
}

function getPublicationDetails(publication) {
    const details = publication.details || {};

    return {
        overview: String(details.overview || publication.description || "").trim(),
        contributions: Array.isArray(details.contributions)
            ? details.contributions.filter((item) => String(item || "").trim().length > 0)
            : [],
        materials: Array.isArray(details.materials)
            ? details.materials.filter(Boolean)
            : [],
    };
}

function getMaterialHref(material) {
    return material?.url || material?.href || material?.src || "";
}

function MaterialItem({ material }) {
    const href = getMaterialHref(material);
    const label = String(material?.label || material?.title || material?.type || "Material").trim();
    const type = String(material?.type || "").toLowerCase();

    if (!href) return null;

    if (type === "image" || type === "gif") {
        return (
            <figure className="pub-material-frame">
                <img className="pub-material-image" src={href} alt={label} loading="lazy" />
            </figure>
        );
    }

    if (type === "video") {
        return (
            <figure className="pub-material-frame">
                <video className="pub-material-video" src={href} controls preload="metadata" />
            </figure>
        );
    }

    return (
        <a href={href} target="_blank" rel="noreferrer" className="pub-material-link">
            {label}
        </a>
    );
}

function PublicationItem({ publication }) {
    const [isOpen, setIsOpen] = useState(false);
    const panelId = `publication-panel-${publication.id}`;
    const details = getPublicationDetails(publication);

    return (
        <li className={`pub-item pub-accordion-item${isOpen ? " is-open" : ""}`}>
            <button
                type="button"
                className="pub-item-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <div className="pub-item-title-row">
                    <div className="pub-item-title-group">
                        <div className="pub-item-title">{publication.title}</div>

                        <span className={`pub-toggle-icon${isOpen ? " is-open" : ""}`} aria-hidden="true">
                            <svg viewBox="0 0 24 24" className="pub-toggle-icon-svg">
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

                    {publication.url && (
                        <a
                            href={publication.url}
                            target="_blank"
                            rel="noreferrer"
                            className="pub-inline-link"
                            aria-label="Open publication"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <svg viewBox="0 0 24 24" className="pub-inline-link-icon" aria-hidden="true">
                                <path
                                    d="M7 17 17 7"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M10 7h7v7"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>
                    )}
                </div>

                <div className="pub-item-meta">
                    {publication.authors ? (
                        <>
                            {renderBreakableText(publication.authors)}
                            {" · "}
                        </>
                    ) : null}

                    {publication.venue ? (
                        <>
                            {renderBreakableText(publication.venue, true)}
                            {" · "}
                        </>
                    ) : null}

                    {publication.date ? <>{formatDate(publication.date)}</> : null}

                    {publication.note && String(publication.note).trim().length > 0 ? (
                        <>
                            {" · "}
                            {renderBreakableText(publication.note)}
                        </>
                    ) : null}
                </div>
            </button>

            <div id={panelId} className="pub-accordion-panel">
                <div className="pub-accordion-panel-inner">
                    <div className="project-card pub-detail-card">
                        <section className="pub-detail-section">
                            <h4 className="pub-detail-heading">Research Overview</h4>
                            {details.overview ? (
                                <p className="project-card-summary">{details.overview}</p>
                            ) : (
                                <p className="pub-detail-placeholder">A short research overview will be added later.</p>
                            )}
                        </section>

                        <section className="pub-detail-section">
                            <h4 className="pub-detail-heading">Role & Contributions</h4>

                            {details.contributions.length > 0 ? (
                                <ul className="pub-detail-list">
                                    {details.contributions.map((item, index) => (
                                        <li key={`${publication.id}-contribution-${index}`}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="pub-detail-placeholder">
                                    Role and contributions will be added later.
                                </p>
                            )}
                        </section>

                        <section className="pub-detail-section">
                            <h4 className="pub-detail-heading">Demo / Materials</h4>

                            {details.materials.length > 0 ? (
                                <div className="pub-material-grid">
                                    {details.materials.map((material, index) => (
                                        <MaterialItem key={`${publication.id}-material-${index}`} material={material} />
                                    ))}
                                </div>
                            ) : (
                                <p className="pub-detail-placeholder">
                                    Demo, media, or presentation materials will be added later.
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </li>
    );
}

export function PublicationsPage() {
    const sorted = useMemo(() => {
        return [...publications].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }, []);

    const grouped = useMemo(() => {
        const map = {};

        for (const publication of sorted) {
            const key = publication.category || "기타";
            if (!map[key]) map[key] = [];
            map[key].push(publication);
        }

        return map;
    }, [sorted]);

    const categories = useMemo(() => {
        const keys = Object.keys(grouped);

        keys.sort((a, b) => {
            const aIndex = CATEGORY_ORDER.indexOf(a);
            const bIndex = CATEGORY_ORDER.indexOf(b);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });

        return keys;
    }, [grouped]);

    return (
        <Layout>
            <div className="publications-page page-stack">
                <header className="awards-header">
                    <h2 className="awards-title">{siteText.publications.title}</h2>
                    <p className="awards-description">{siteText.publications.description}</p>
                </header>

                <div className="awards-grid">
                    {categories.map((category) => {
                        const label = CATEGORY_LABEL_MAP[category] || category;

                        return (
                            <section key={category}>
                                <div className="awards-divider" aria-hidden="true">
                                    <span className="awards-divider-text">{label}</span>
                                </div>

                                <ul className="pub-text-list">
                                    {grouped[category].map((publication) => (
                                        <PublicationItem key={publication.id} publication={publication} />
                                    ))}
                                </ul>
                            </section>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
}
