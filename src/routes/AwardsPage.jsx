// src/routes/AwardsPage.jsx
import { Layout } from "../components/layout/Layout";

export function AwardsPage() {
    return (
        <Layout>
            <h2 className="text-2xl font-semibold mb-4">Awards</h2>
            <p className="text-sm text-gray-600 mb-4">수상, 장학금, 대회 성적 등을 정리하는 페이지입니다.</p>

            {/* 나중에 awards 데이터를 만들어서 여기서 맵핑하면 됩니다. */}
            <ul className="text-sm">
                <li>예시) 2025 MobieSec Best Poster Award</li>
                <li>예시) 2024 대학원 장학금</li>
            </ul>
        </Layout>
    );
}
