export function ProjectCard({ project, index }) {
    return (
        <article className="project-card">
            <header className="project-card-head">
                <div>
                    <p className="project-card-label">Project {String(index + 1).padStart(2, "0")}</p>
                    <h3 className="project-card-title">{project.title}</h3>
                </div>

                <p className="project-card-meta">{project.period}</p>
            </header>

            <p className="project-card-summary">{project.summary}</p>

            <p className="project-card-role">
                <span>Role</span>
                {project.role}
            </p>

            <div className="project-tag-row" aria-label="Project tags">
                {project.tags.map((tag) => (
                    <span key={tag} className="project-tag">
                        {tag}
                    </span>
                ))}
            </div>

            <ul className="project-highlight-list">
                {project.highlights.map((item, itemIndex) => (
                    <li key={`${project.id}-${itemIndex}`}>{item}</li>
                ))}
            </ul>

            {project.links && (
                <div className="project-link-row">
                    {project.links.github && (
                        <a href={project.links.github} target="_blank" rel="noreferrer" className="project-link">
                            GitHub
                        </a>
                    )}
                    {project.links.paper && (
                        <a href={project.links.paper} target="_blank" rel="noreferrer" className="project-link">
                            Paper
                        </a>
                    )}
                    {project.links.demo && (
                        <a href={project.links.demo} target="_blank" rel="noreferrer" className="project-link">
                            Demo
                        </a>
                    )}
                </div>
            )}
        </article>
    );
}
