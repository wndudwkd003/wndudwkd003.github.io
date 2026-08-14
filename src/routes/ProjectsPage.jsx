import { useMemo } from "react";
import { Layout } from "../components/layout/Layout";
import { projects } from "../data/projects";
import { ProjectCard } from "../components/portfolio/ProjectCard";
import siteText from "../data/siteText.json";

function getProjectStartValue(period) {
    const normalized = String(period || "").trim();
    const match = normalized.match(/(\d{4})[.\-/\s]?(\d{1,2})?/);

    if (!match) return 0;

    const year = Number(match[1]);
    const month = Number(match[2] || 1);

    return year * 100 + month;
}

export function ProjectsPage() {
    const sortedProjects = useMemo(() => {
        return [...projects].sort((a, b) => {
            if (a.id === "project_1") return 1;
            if (b.id === "project_1") return -1;
            return getProjectStartValue(b.period) - getProjectStartValue(a.period);
        });
    }, []);

    const groupedProjects = useMemo(() => {
        return [
            {
                key: "ongoing",
                label: "Ongoing",
                projects: sortedProjects.filter((project) => project.ongoing === true),
            },
            {
                key: "complete",
                label: "Complete",
                projects: sortedProjects.filter((project) => project.ongoing !== true),
            },
        ].filter((group) => group.projects.length > 0);
    }, [sortedProjects]);

    return (
        <Layout>
            <div className="page-stack">
                <header className="page-header">
                    <h2 className="page-title">{siteText.projects.title}</h2>
                    <p className="page-description">
                        {siteText.projects.description}
                    </p>
                </header>

                <div className="project-list">
                    {groupedProjects.map((group) => (
                        <section key={group.key}>
                            <div className="awards-divider" aria-hidden="true">
                                <span className="awards-divider-text">{group.label}</span>
                            </div>

                            <ul className="project-text-list">
                                {group.projects.map((project, index) => (
                                    <ProjectCard key={project.id} project={project} index={index} />
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
