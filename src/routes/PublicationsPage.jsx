import { useMemo, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { ResearchMediaCarousel } from "../components/home/research/ResearchMediaCarousel";
import { publications } from "../data/publications";
import siteText from "../data/siteText.json";
import paperImages from "virtual:paper-images";

const DEFAULT_DETAIL_LABELS = {
    overview: "Research Overview",
    contributions: "Role & Contributions",
    materials: "Demo / Materials",
};

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

function getPublicationDetails(publication, folderDetails) {
    const details = folderDetails || publication.details || {};
    const materials = (paperImages[publication.id] || []).map((image) => ({
        type: "image",
        src: image.src,
        thumbnailSrc: image.thumbnailSrc,
        fit: "contain",
    }));

    return {
        overview: String(details.overview || publication.description || "").trim(),
        contributions: Array.isArray(details.contributions)
            ? details.contributions.filter((item) => String(item || "").trim().length > 0)
            : [],
        materials,
        sections: Array.isArray(details.sections)
            ? details.sections.filter(Boolean)
            : [],
        labels: {
            ...DEFAULT_DETAIL_LABELS,
            ...(details.labels || {}),
        },
    };
}

function getPaperFolderUrl(folder, path = "") {
    const baseUrl = String(import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
    const safeFolder = encodeURIComponent(String(folder || "").trim());
    const safePath = String(path || "")
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
        .split("/")
        .filter(Boolean)
        .map(encodeURIComponent)
        .join("/");

    return `${baseUrl}papers/${safeFolder}/${safePath}`;
}

async function loadPublicationDetails(publication) {
    const folder = String(publication.id || "").trim();
    if (!folder) return null;

    const response = await fetch(getPaperFolderUrl(folder, "details.json"));
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Unable to load publication details (${response.status})`);

    return {
        data: await response.json(),
        folder,
    };
}

function getMaterialHref(material, folder) {
    const path = material?.url || material?.href || material?.src || "";
    if (!path) return "";

    const normalized = String(path).replace(/\\/g, "/").trim();
    if (/^(?:https?:|data:|blob:)/i.test(normalized) || normalized.startsWith("/")) return normalized;

    if (normalized.startsWith("public/")) {
        const baseUrl = String(import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
        return `${baseUrl}${normalized.slice("public/".length)}`;
    }

    return getPaperFolderUrl(folder, normalized);
}

function PublicationDetailSection({ section, publicationId, index }) {
    const title = String(section?.title || section?.heading || "").trim();
    const paragraphs = Array.isArray(section?.paragraphs)
        ? section.paragraphs.filter((paragraph) => String(paragraph || "").trim())
        : section?.body
          ? [section.body]
          : [];
    const bullets = Array.isArray(section?.bullets)
        ? section.bullets.filter((bullet) => String(bullet || "").trim())
        : [];

    if (!title && paragraphs.length === 0 && bullets.length === 0) return null;

    return (
        <section className="pub-detail-section">
            {title ? <h4 className="pub-detail-heading">{title}</h4> : null}
            {paragraphs.map((paragraph, paragraphIndex) => (
                <p key={`${publicationId}-section-${index}-paragraph-${paragraphIndex}`} className="project-card-summary">
                    {paragraph}
                </p>
            ))}
            {bullets.length > 0 ? (
                <ul className="pub-detail-list">
                    {bullets.map((bullet, bulletIndex) => (
                        <li key={`${publicationId}-section-${index}-bullet-${bulletIndex}`}>{bullet}</li>
                    ))}
                </ul>
            ) : null}
        </section>
    );
}

function PublicationItem({ publication }) {
    const [isOpen, setIsOpen] = useState(false);
    const [folderDetails, setFolderDetails] = useState(null);
    const [detailStatus, setDetailStatus] = useState("idle");
    const panelId = `publication-panel-${publication.id}`;
    const details = getPublicationDetails(publication, folderDetails?.data);
    const detailFolder = folderDetails?.folder || publication.id;

    const toggleDetails = () => {
        const opening = !isOpen;
        setIsOpen(opening);

        if (!opening || detailStatus !== "idle") return;

        setDetailStatus("loading");
        loadPublicationDetails(publication)
            .then((result) => {
                setFolderDetails(result);
                setDetailStatus(result ? "loaded" : "missing");
            })
            .catch(() => {
                setDetailStatus("error");
            });
    };

    return (
        <li className={`pub-item pub-accordion-item${isOpen ? " is-open" : ""}`}>
            <button
                type="button"
                className="pub-item-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={toggleDetails}
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
                    {detailStatus === "loading" ? (
                        <p className="pub-detail-loading">Loading publication details...</p>
                    ) : (
                        <div className="project-card pub-detail-card">
                            <section className="pub-detail-section">
                                <h4 className="pub-detail-heading">{details.labels.overview}</h4>
                                {details.overview ? (
                                    <p className="project-card-summary">{details.overview}</p>
                                ) : (
                                    <p className="pub-detail-placeholder">A short research overview will be added later.</p>
                                )}
                            </section>

                            <section className="pub-detail-section">
                                <h4 className="pub-detail-heading">{details.labels.contributions}</h4>

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

                            {details.sections.map((section, index) => (
                                <PublicationDetailSection
                                    key={`${publication.id}-section-${index}`}
                                    section={section}
                                    publicationId={publication.id}
                                    index={index}
                                />
                            ))}

                            <section className="pub-detail-section">
                                <h4 className="pub-detail-heading">{details.labels.materials}</h4>

                                {details.materials.length > 0 ? (
                                    <div className="pub-material-carousel">
                                        <ResearchMediaCarousel
                                            title={publication.title}
                                            autoplayMs={6500}
                                            items={details.materials.map((material, index) => ({
                                                src: getMaterialHref(
                                                    { src: material.thumbnailSrc || material.src },
                                                    detailFolder,
                                                ),
                                                fallbackSrc: getMaterialHref({ src: material.src }, detailFolder),
                                                alt: `${publication.title} figure ${index + 1}`,
                                                fit: "contain",
                                                theme: "light",
                                            }))}
                                        />
                                    </div>
                                ) : (
                                    <p className="pub-detail-placeholder">
                                        Demo, media, or presentation materials will be added later.
                                    </p>
                                )}
                            </section>
                        </div>
                    )}
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
