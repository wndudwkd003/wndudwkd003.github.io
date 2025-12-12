// src/data/awards.js
export const awards = [
    {
        id: "2024-khealth-scholarship",
        title: "장학금 수여",
        org: "케이헬스",
        date: "2024-09-01",
        displayDate: "2024.09",
        description: "연구 성과",
        tags: ["장학금"],

        // ✅ 파일 목록
        fileList: [
            {
                type: "image",
                url: "/awards/a_name_number/khealth.png", // 썸네일로 쓸 이미지
                label: "증서 이미지",
            },
            {
                type: "pdf",
                url: "/awards/a_name_number/khealth.pdf", // 다운로드용 PDF
                label: "증서 PDF",
                down: true,
            },
            {
                type: "image",
                url: "/awards/a_name_number/k_tmp.png", // 썸네일로 쓸 이미지
                label: "증서 이미지",
            },
        ],
    },
];
