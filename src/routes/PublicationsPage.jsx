import { useMemo } from "react";
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

function renderVenue(venue) {
    if (!venue) return null;
    return <em>{String(venue).trim()}</em>;
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

                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {grouped[category].map((publication) => (
                                        <li key={publication.id} className="pub-item">
                                            <div style={{ fontWeight: 700 }}>
                                                {publication.url ? (
                                                    <a href={publication.url} target="_blank" rel="noreferrer" className="pub-title-link">
                                                        {publication.title}
                                                    </a>
                                                ) : (
                                                    publication.title
                                                )}
                                            </div>

                                            <div style={{ fontSize: 13, color: "#6b7280" }}>
                                                {publication.authors ? (
                                                    <>
                                                        {publication.authors}
                                                        {" · "}
                                                    </>
                                                ) : null}

                                                {publication.venue ? (
                                                    <>
                                                        {renderVenue(publication.venue)}
                                                        {" · "}
                                                    </>
                                                ) : null}

                                                {publication.date ? <>{formatDate(publication.date)}</> : null}

                                                {publication.note && String(publication.note).trim().length > 0 ? (
                                                    <>
                                                        {" · "}
                                                        {publication.note}
                                                    </>
                                                ) : null}
                                            </div>
                                        </li>
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
