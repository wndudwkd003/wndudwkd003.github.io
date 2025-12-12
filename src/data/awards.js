// src/data/awards.js

export const awards = [
  {
    id: "2025-hclt-kli",
    title: "국립국어원 인공지능 말평 활용 연구 최우수·우수 공동수상",
    org: "국립국어원",
    date: "2025-10-01",
    description: "2025년도 HCLT-KACL 공동 학술대회 국립국어원 인공지능 말평 활용 연구",
    tags: ["학술대회", "자연어처리", "문화체육관광부장관상", "국립국어원장상"],

    dir: "/awards/hclt-kacl_2025-10-01_1",
    images: { count: 7 },
    downloads: [
      { type: "pdf", file: "상장_최우수상.pdf", down: true },
      { type: "pdf", file: "상장_우수상.pdf", down: true },
    ],
  },
  {
    id: "2024-khealth",
    title: "K-Health 의료 인공지능 해커톤 대회 최우수상",
    org: "한국스마트헬스케어협회",
    date: "2024-11-20",
    description: "맘모그래피 영상데이터 활용 유방종괴 영역 분할 AI 학습 모델 개발",
    tags: ["해커톤", "컴퓨터비전"],

    dir: "/awards/k-health_2024-11-20_1",
    images: { count: 4 },
    downloads: [
      { type: "pdf", file: "상장파일.pdf", down: true },
    ],
  },
];
