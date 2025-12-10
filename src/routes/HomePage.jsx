import { Layout } from "../components/layout/Layout";

export function HomePage() {
  return (
    <Layout>
      <section>
        <h1 className="text-2xl font-semibold mb-2">안녕하세요.</h1>
        <p className="text-sm text-gray-600">
          이 사이트는 연구 및 프로젝트 포트폴리오를 정리하기 위한 페이지입니다.
        </p>
      </section>
    </Layout>
  );
}
