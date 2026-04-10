import { useMemo, useState } from "react";

function getProjectImageSources(project) {
    const candidates = [];

    if (Array.isArray(project.images)) {
        candidates.push(...project.images);
    }

    if (project.image) {
        candidates.push(project.image);
    }

    return candidates
        .map((image, imageIndex) => {
            const normalized = String(image || "").trim();
            if (!normalized) return null;

            const src =
                normalized.startsWith("/") || /^https?:\/\//.test(normalized)
                    ? normalized
                    : `/projects/${project.id}/${normalized.replace(/^\.?\//, "")}`;

            return {
                src,
                alt: `${project.title} image ${imageIndex + 1}`,
            };
        })
        .filter(Boolean);
}

export function ProjectCard({ project, index }) {
    const [isOpen, setIsOpen] = useState(false);
    const imageSources = useMemo(() => getProjectImageSources(project), [project]);
    const panelId = `project-panel-${project.id}-${index}`;
    const metaItems = [project.institution, project.type, project.period].filter(Boolean);
    const hasDetailContent =
        Boolean(project.summary) ||
        Boolean(project.role) ||
        imageSources.length > 0 ||
        (Array.isArray(project.tags) && project.tags.length > 0) ||
        (Array.isArray(project.highlights) && project.highlights.length > 0);

    return (
        <li className={`project-accordion-item${isOpen ? " is-open" : ""}`}>
            <button
                type="button"
                className="project-accordion-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <div className="project-accordion-trigger-head">
                    <div className="project-accordion-title-row">
                        <h3 className="project-accordion-title">{project.title}</h3>

                        {metaItems.length > 0 && (
                            <p className="project-accordion-meta">
                                {metaItems.map((item) => (
                                    <span key={item}>{item}</span>
                                ))}
                            </p>
                        )}
                    </div>
                </div>
            </button>

            <div id={panelId} className="project-accordion-panel">
                <div className="project-accordion-panel-inner">
                    <div className="project-card project-accordion-card">
                        {Array.isArray(project.tags) && project.tags.length > 0 && (
                            <div className="project-tag-row" aria-label="Project tags">
                                {project.tags.map((tag) => (
                                    <span key={tag} className="project-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {project.summary && <p className="project-card-summary">{project.summary}</p>}

                        {project.role && (
                            <p className="project-card-role">
                                <span>Role</span>
                                {project.role}
                            </p>
                        )}

                        {imageSources.length > 0 && (
                            <div className="project-image-grid" aria-label={`${project.title} images`}>
                                {imageSources.map((image) => (
                                    <figure key={image.src} className="project-image-frame">
                                        <img className="project-image" src={image.src} alt={image.alt} loading="lazy" />
                                    </figure>
                                ))}
                            </div>
                        )}

                        {Array.isArray(project.highlights) && project.highlights.length > 0 && (
                            <ul className="project-highlight-list">
                                {project.highlights.map((item, itemIndex) => (
                                    <li key={`${project.id}-${itemIndex}`}>{item}</li>
                                ))}
                            </ul>
                        )}

                        {!hasDetailContent && <p className="project-card-summary">Detailed content will appear here.</p>}
                    </div>
                </div>
            </div>
        </li>
    );
}
