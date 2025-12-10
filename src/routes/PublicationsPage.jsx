import { Layout } from "../components/layout/Layout";

export function PublicationsPage() {
  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">Publications</h2>
      <p className="text-sm text-gray-600">
        논문, 학회 발표 등 출판 이력을 정리하는 페이지입니다.
      </p>
    </Layout>
  );
}
