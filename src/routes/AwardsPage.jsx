// src/routes/AwardsPage.jsx
import { Layout } from "../components/layout/Layout";
import { awards } from "../data/awards";

function getThumbnailUrl(award) {
  if (!award.fileList || award.fileList.length === 0) return null;
  for (const file of award.fileList) {
    if (file.type === "image") return file.url;
  }
  return null;
}

function getFileLabel(file) {
  if (file.label && file.label.trim().length > 0) return file.label;
  if (file.type === "pdf") return "PDF 다운로드";
  if (file.type === "image") return "이미지 보기";
  return "파일 열기";
}

export function AwardsPage() {
  const sortedAwards = [...awards].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });

  return (
    <Layout>
      <h2 className="awards-title">Awards</h2>
      <p className="awards-description">
        수상, 장학금, 대회 성적 등을 정리한 페이지입니다.
      </p>

      <div className="awards-grid">
        {sortedAwards.map((award) => {
          const thumbUrl = getThumbnailUrl(award);

          return (
            <article key={award.id} className="award-card">
              <div className="award-thumb-wrapper">
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={`${award.title} 썸네일`}
                    className="award-thumb"
                  />
                ) : (
                  <span className="award-thumb-placeholder">FILE</span>
                )}
              </div>

              <div className="award-content">
                <div className="award-meta">
                  {award.displayDate}
                  {award.org && ` · ${award.org}`}
                </div>

                <h3 className="award-title">{award.title}</h3>

                {award.description && award.description.trim().length > 0 && (
                  <p className="award-text">{award.description}</p>
                )}

                {award.tags && award.tags.length > 0 && (
                  <div className="award-tags">
                    {award.tags.map((tag) => (
                      <span key={tag} className="award-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {award.fileList && award.fileList.length > 0 && (
                  <div className="award-files">
                    {award.fileList.map((file, idx) => (
                      <a
                        key={`${award.id}-${idx}`}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="award-file-link"
                      >
                        {getFileLabel(file)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </Layout>
  );
}
