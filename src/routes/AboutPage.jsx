import { Layout } from "../components/layout/Layout";

export function AboutPage() {
  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-4">About</h2>
      <p className="text-sm text-gray-600">
        자기소개, 연구 관심사, 연락처 등을 정리하는 페이지입니다.
      </p>
    </Layout>
  );
}
