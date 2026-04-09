import { Layout } from "../components/layout/Layout";
import { projects } from "../data/projects";
import { ProjectCard } from "../components/portfolio/ProjectCard";
import siteText from "../data/siteText.json";

export function ProjectsPage() {
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
                    {projects.map((project, index) => (
                        <ProjectCard key={`${project.id}-${index}`} project={project} index={index} />
                    ))}
                </div>
            </div>
        </Layout>
    );
}
