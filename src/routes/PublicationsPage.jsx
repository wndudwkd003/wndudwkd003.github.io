// src/routes/PublicationsPage.jsx

import React, { useMemo } from "react";
import { Layout } from "../components/layout/Layout";
import { publications } from "../data/publications";

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
    const m = {};
    for (const p of sorted) {
      const key = p.category || "기타";
      if (!m[key]) m[key] = [];
      m[key].push(p);
    }
    return m;
  }, [sorted]);

  const categories = useMemo(() => {
    const keys = Object.keys(grouped);
    keys.sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a);
      const ib = CATEGORY_ORDER.indexOf(b);
      const ra = ia === -1 ? 999 : ia;
      const rb = ib === -1 ? 999 : ib;
      return ra - rb;
    });
    return keys;
  }, [grouped]);

  return (
    <Layout>
      <div className="publications-page">
        <header className="awards-header">
          <h2 className="awards-title">Publications</h2>
          <p className="awards-description">
            논문, 학회 발표 등 출판 이력을 정리하는 페이지입니다.
          </p>
        </header>

        <div className="awards-grid">
          {categories.map((cat) => {
            const label = CATEGORY_LABEL_MAP[cat] || cat;

            return (
              <section key={cat}>
                <div className="awards-divider" aria-hidden="true">
                  <span className="awards-divider-text">{label}</span>
                </div>

                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {grouped[cat].map((p) => (
                    <li key={p.id} className="pub-item">
                      <div style={{ fontWeight: 700 }}>
                        {p.url ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="pub-title-link"
                          >
                            {p.title}
                          </a>
                        ) : (
                          p.title
                        )}
                      </div>


                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {p.authors ? (
                          <>
                            {p.authors}
                            {" · "}
                          </>
                        ) : null}

                        {p.venue ? (
                          <>
                            {renderVenue(p.venue)}
                            {" · "}
                          </>
                        ) : null}

                        {p.date ? <>{formatDate(p.date)}</> : null}

                        {p.note && String(p.note).trim().length > 0 ? (
                          <>
                            {" · "}
                            {p.note}
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
