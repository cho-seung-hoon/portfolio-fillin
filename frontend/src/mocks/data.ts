import { CategoryDTO, LessonDTO, MemberDTO, ProfileDTO } from "../api/types";

// 1. Categories Data
export const categories: CategoryDTO[] = [
    { category_id: 1, name: "Programming", parent_category_id: null },
    { category_id: 2, name: "Data", parent_category_id: null },
    { category_id: 3, name: "Design", parent_category_id: null },
    { category_id: 4, name: "Marketing", parent_category_id: null },
    { category_id: 5, name: "AI", parent_category_id: null },
    { category_id: 6, name: "Business", parent_category_id: null },
    { category_id: 7, name: " ", parent_category_id: null },
];

export const categoryMap = new Map<number, CategoryDTO>(
    categories.map((c) => [c.category_id, c])
);

// Helper for random data
const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: T[]): T => arr[getRandomInt(0, arr.length - 1)];

// 2. Members Data
const generateMembers = (count: number): MemberDTO[] => {
    const members: MemberDTO[] = [];
    const domains = ["gmail.com", "naver.com", "daum.net", "kakao.com"];
    const names = ["김개발", "박데이터", "이디자인", "최마케터", "정인공지능", "윤비즈니스", "강모바일", "송풀스택",
        "한브랜드", "오데이터베이스", "조SNS", "임AI활용", "홍길동", "Alice Kim", "Steve Lee"];

    for (let i = 1; i <= count; i++) {
        // Use predefined names for first few to look nice, then random
        const baseName = i <= names.length ? names[i - 1] : `User${i}`;
        const domain = getRandomItem(domains);

        members.push({
            member_id: i,
            nickname: baseName, // In our UI we use nickname as name often
            phone_num: `010-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
            email: `${baseName.replace(/\s/g, '').toLowerCase()}${i}@${domain}`,
            password: "password123!",
            created_at: new Date(Date.now() - getRandomInt(0, 365) * 86400000).toISOString(),
            deleted_at: null,
            updated_at: null,
        });
    }

    // Test User
    members.push({
        member_id: 9999,
        nickname: "TestUser",
        phone_num: "010-1234-5678",
        email: "test@test.com",
        password: "password",
        created_at: new Date().toISOString(),
        deleted_at: null,
        updated_at: null,
    });

    return members;
};

export const membersData = generateMembers(50); // 50 members total
export const membersMap = new Map<number, MemberDTO>(
    membersData.map(m => [m.member_id, m])
);
export const membersEmailMap = new Map<string, MemberDTO>(
    membersData.map(m => [m.email, m])
);


// 3. Profiles (Mentors)
// Let's say first 20 members are mentors
export const profilesData: ProfileDTO[] = membersData.slice(0, 20).map(member => {
    const introductions = [
        "안녕하세요, 실무 10년차 개발자입니다.",
        "데이터 분석과 AI를 사랑하는 멘토입니다.",
        "사용자 중심의 디자인을 추구합니다.",
        "마케팅의 본질을 꿰뚫는 통찰력!",
        "비즈니스 성장의 파트너가 되어드립니다.",
    ];

    const avatars = [
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop"
    ];

    return {
        member_id: member.member_id,
        image: getRandomItem(avatars),
        introduce: getRandomItem(introductions),
        created_at: member.created_at,
        updated_at: null,
        deleted_at: null,
        category_id: getRandomItem(categories).category_id // Mentor's main category
    };
});

export const profileMap = new Map<number, ProfileDTO>(
    profilesData.map(p => [p.member_id, p])
);

// 4. Lessons
// Linked to members who have profiles
export const generateLessons = (count: number): LessonDTO[] => {
    const lessons: LessonDTO[] = [];
    const titles = [
        "완벽 가이드", "기초부터 실무까지", "마스터 클래스", "실전 노하우",
        "핵심 요약", "10주 완성", "취업 뿌수기", "프로젝트 만들기"
    ];
    const locations = ["강남", "판교", "성수", "홍대", "온라인 (Zoom)", "여의도"];
    const thumbnails = [
        "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=1080&q=80",
        "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?auto=format&fit=crop&w=1080&q=80",
        "https://images.unsplash.com/photo-1716703435551-4326ab111ae2?auto=format&fit=crop&w=1080&q=80",
        "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1080&q=80",
        "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?auto=format&fit=crop&w=1080&q=80"
    ];

    const mentorIds = profilesData.map(p => p.member_id);

    for (let i = 1; i <= count; i++) {
        const category = getRandomItem(categories);
        const mentorId = getRandomItem(mentorIds); // Pick a valid mentor
        const lessonType = getRandomInt(1, 3) as 1 | 2 | 3;
        const titleSuffix = getRandomItem(titles);
        const member = membersMap.get(mentorId)!; // Get mentor name for description

        lessons.push({
            lesson_id: i,
            lesson_type: lessonType,
            title: `${category.name} ${titleSuffix}`,
            description: `이 강의는 ${category.name} 분야의 ${titleSuffix} 과정입니다. ${member.nickname} 멘토와 함께 성장하세요.`,
            thumbnail_image: getRandomItem(thumbnails),
            location: getRandomItem(locations),
            price: getRandomInt(0, 10) * 10000 + (getRandomInt(0, 1) === 0 ? 0 : 5000),
            created_at: new Date().toISOString(),
            close_at: new Date(Date.now() + 86400000 * 30).toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
            mentor_id: mentorId, // Linked to Member
            category_id: category.category_id,
            rating: Number((Math.random() * 2 + 3).toFixed(1)),
            studentCount: getRandomInt(10, 5000),
        });
    }
    return lessons;
};

export const lessonsData = generateLessons(100);
export const lessonsMap = new Map<number, LessonDTO>(
    lessonsData.map((l) => [l.lesson_id, l])
);
