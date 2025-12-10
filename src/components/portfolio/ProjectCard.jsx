export function ProjectCard({ project }) {
  return (
    <article className="border rounded-lg p-4 mb-4">
      <header className="flex items-baseline justify-between gap-4 mb-2">
        <h3 className="font-semibold text-lg">{project.title}</h3>
        <span className="text-xs text-gray-500">{project.period}</span>
      </header>

      <p className="text-sm mb-2">{project.summary}</p>

      <p className="text-xs text-gray-600 mb-2">역할: {project.role}</p>

      <div className="flex flex-wrap gap-1 mb-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs border rounded-full px-2 py-0.5 text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <ul className="list-disc list-inside text-xs text-gray-700 mb-2">
        {project.highlights.map((h, idx) => (
          <li key={idx}>{h}</li>
        ))}
      </ul>

      {project.links && (
        <div className="flex gap-3 text-xs">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              GitHub
            </a>
          )}
          {project.links.paper && project.links.paper !== "" && (
            <a
              href={project.links.paper}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Paper
            </a>
          )}
          {project.links.demo && project.links.demo !== "" && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Demo
            </a>
          )}
        </div>
      )}
    </article>
  );
}
