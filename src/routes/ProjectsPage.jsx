import { Layout } from "../components/layout/Layout";
import { projects } from "../data/projects";
import { ProjectCard } from "../components/portfolio/ProjectCard";

export function ProjectsPage() {
  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>
      <p className="text-sm text-gray-600 mb-4">
        진행했던 연구 및 프로젝트를 정리한 페이지입니다.
      </p>
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </Layout>
  );
}
