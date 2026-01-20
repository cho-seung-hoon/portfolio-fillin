import { http, HttpResponse } from "msw";
import { membersMap, lessonsData, categoryMap, profileMap } from "./data"; // Import maps for joining
import {
    MemberDTO, LessonReviewListResponseDTO,
    LessonDetailResponseDTO,
    MyReviewResponseDTO,
    ReviewDTO
} from "../api/types";


// Header: {"alg":"HS256","typ":"JWT"}
const MOCK_TOKEN_HEADER = "eyJhGcioJiuUzI1NiIsInR5cCI6IkpXVCJ9";

export const handlers = [
    // Categories Handler
    http.get("/api/v1/categories", () => {
        const categoriesData = Array.from(categoryMap.values()).map(c => ({
            categoryId: c.category_id,
            name: c.name,
            parentId: c.parent_category_id
        }));
        return HttpResponse.json({
            status: 200,
            message: "OK",
            data: categoriesData
        });
    }),

    // 1. Auth Handlers
    http.post("/api/v1/auth/login", async ({ request }) => {
        const body = (await request.json()) as any;
        const { email, password } = body;

        const member = membersMap.get(email) || Array.from(membersMap.values()).find(m => m.email === email);

        if (!member || (member.password && member.password !== password)) {
            return new HttpResponse(
                JSON.stringify({ message: "이메일 또는 비밀번호가 올바르지 않습니다." }),
                { status: 401 }
            );
        }

        // Generate token with claims (Mocking the backend logic)
        // claims: email, memberId
        const claims = {
            email: member.email,
            memberId: String(member.member_id),
            name: member.nickname // Added name to match signup
        };
        const payload = window.btoa(JSON.stringify(claims)).replace(/=/g, "");
        const token = `${MOCK_TOKEN_HEADER}.${payload}.mock-signature`;

        return HttpResponse.json({
            accessToken: `Bearer ${token}`
        });
    }),

    http.post("/api/v1/members/signup", async ({ request }) => {
        const body = (await request.json()) as any;
        const { email, password, nickname, phoneNum } = body;

        // phoneNum check optional or required? User asked to add UI for it, implies required.
        // Assuming required for now.
        if (!email || !password || !nickname || !phoneNum) {
            return new HttpResponse(
                JSON.stringify({ message: "필수 정보가 누락되었습니다." }),
                { status: 400 }
            );
        }

        // Check duplicate email
        if (Array.from(membersMap.values()).some(m => m.email === email)) {
            return new HttpResponse(
                JSON.stringify({ message: "이미 존재하는 이메일입니다." }),
                { status: 409 }
            );
        }

        const newId = Math.floor(Math.random() * 100000);
        const newMember: MemberDTO = {
            member_id: newId,
            email,
            nickname,
            phone_num: phoneNum,
            password,
            created_at: new Date().toISOString(),
            deleted_at: null,
            updated_at: null,
        };

        membersMap.set(newId, newMember);

        // Generate mock token with HEADER construction
        const claims = { email, memberId: String(newId), name: nickname };
        const payload = window.btoa(JSON.stringify(claims)).replace(/=/g, "");
        const token = `${MOCK_TOKEN_HEADER}.${payload}.mock - signature`;

        return HttpResponse.json({
            accessToken: `Bearer ${token} `
        });
    }),

    // Get Current Member Profile
    http.get("/api/v1/profile/me", ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new HttpResponse(null, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        try {
            // Decoded from "HEADER.PAYLOAD.SIG" used in mock
            const payload = token.split(".")[1];
            const claims = JSON.parse(window.atob(payload));

            const member = Array.from(membersMap.values()).find(
                m => m.email === claims.email || String(m.member_id) === claims.memberId
            );

            if (!member) {
                return new HttpResponse(null, { status: 404 });
            }

            return HttpResponse.json({
                status: 200,
                message: "OK",
                data: {
                    imageUrl: "https://via.placeholder.com/150", // Mock image
                    nickname: member.nickname,
                    email: member.email,
                    phoneNum: member.phone_num,
                    introduction: "안녕하세요! " + member.nickname + "입니다.",
                    category: {
                        categoryId: 1,
                        name: "IT/Development",
                        parentId: null
                    }
                }
            });
        } catch (e) {
            return new HttpResponse(null, { status: 401 });
        }
    }),

    // 1-2. Update Nickname
    http.patch("/api/v1/profile/me/nickname", async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new HttpResponse(null, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        try {
            const payload = token.split(".")[1];
            const claims = JSON.parse(window.atob(payload));

            const member = Array.from(membersMap.values()).find(
                m => m.email === claims.email || String(m.member_id) === claims.memberId
            );

            if (!member) {
                return new HttpResponse(null, { status: 404 });
            }

            const body = await request.json() as { nickname: string };
            member.nickname = body.nickname; // Update Mock Data

            return HttpResponse.json({
                status: 200,
                message: "OK"
            });
        } catch (e) {
            return new HttpResponse(null, { status: 401 });
        }
    }),

    // 1-3. Update Introduction
    http.patch("/api/v1/profile/me/introduction", async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new HttpResponse(null, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        try {
            const payload = token.split(".")[1];
            const claims = JSON.parse(window.atob(payload));

            const member = Array.from(membersMap.values()).find(
                m => m.email === claims.email || String(m.member_id) === claims.memberId
            );

            if (!member) {
                return new HttpResponse(null, { status: 404 });
            }

            const body = await request.json() as { introduction: string };
            (member as any).introduction = body.introduction; // Update Mock Data

            return HttpResponse.json({
                status: 200,
                message: "OK"
            });
        } catch (e) {
            return new HttpResponse(null, { status: 401 });
        }
    }),

    // 2. Lesson Search Handler (New Schema)
    http.get("/api/v1/lessons/search", ({ request }) => {
        const url = new URL(request.url);
        const keyword = url.searchParams.get("keyword") || "";
        const page = Number(url.searchParams.get("page")) || 1; // 1-based in query, but Spring might be 0-based? User example had `page.getNumber()` which is usually 0-based in Spring. Let's assume input is 1-based from frontend but PageResponse logic might differ. 
        // User record has `page` as Integer. Let's assume standard behavior: API takes 0 or 1.
        // Frontend sends 1-based page.
        // Let's stick to 1-based for simplicity or convert.
        // Usually Spring Pageable is 0-based.
        // Frontend `page = 1`.

        const size = Number(url.searchParams.get("size")) || 20;
        const sortType = url.searchParams.get("sortType") || "CREATED_AT_DESC";
        // categoryId, lessonType support could be added if passed

        let filteredLessons = lessonsData;

        if (keyword) {
            const query = keyword.toLowerCase().trim();
            filteredLessons = filteredLessons.filter(
                (lesson) => {
                    const member = membersMap.get(lesson.mentor_id);
                    const mentorName = member?.nickname || "";
                    return lesson.title.toLowerCase().includes(query) ||
                        mentorName.toLowerCase().includes(query);
                }
            );
        }

        // Apply sorting
        filteredLessons.sort((a, b) => {
            switch (sortType) {
                case "PRICE_DESC":
                    return b.price - a.price;
                case "PRICE_ASC":
                    return a.price - b.price;
                case "CREATED_AT_ASC":
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case "CREATED_AT_DESC":
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        const totalElements = filteredLessons.length;
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const pagedData = filteredLessons.slice(startIndex, endIndex);

        // Map to LessonThumbnail
        const content = pagedData.map(lesson => {
            const member = membersMap.get(lesson.mentor_id)!;
            const typeMap: Record<number, "MENTORING" | "ONEDAY" | "STUDY"> = {
                1: "MENTORING",
                2: "ONEDAY",
                3: "STUDY"
            };

            return {
                lessonId: String(lesson.lesson_id),
                thumbnailImage: lesson.thumbnail_image,
                lessonTitle: lesson.title,
                lessonType: typeMap[lesson.lesson_type] || "MENTORING",
                mentorNickName: member.nickname,
                rating: lesson.rating,
                categoryId: lesson.category_id,
                location: lesson.location,
                closeAt: lesson.close_at,
                category: categoryMap.get(lesson.category_id)?.name || "Unknown",
                menteeCount: lesson.studentCount
            };
        });

        // Construct SuccessResponse<PageResponse<LessonThumbnail>>
        return HttpResponse.json({
            status: 200,
            message: "OK",
            data: {
                content,
                page: page, // Returning requested page number
                size,
                totalElements
            }
        });
    }),

    // 3. Lesson Review List Handler
    http.get("/api/lessons/:id/reviews", ({ params, request }) => {
        const { id } = params;
        const lesson = lessonsData.find(l => l.lesson_id === Number(id));

        if (!lesson) {
            return new HttpResponse(null, { status: 404 });
        }

        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page")) || 1;
        const size = Number(url.searchParams.get("size")) || 10;

        // Mock detail specific data (Reviews)
        const allReviews: ReviewDTO[] = [
            {
                reviewId: "review-1",
                score: 5,
                content: "정말 유익한 멘토링이었습니다!",
                writerId: "user-1",
                nickname: "User1",
                lessonId: String(lesson.lesson_id),
                createdAt: "2025-01-02T10:00:00",
            },
            {
                reviewId: "review-2",
                score: 5,
                content: "실무에서 바로 쓸 수 있는 팁이 많았어요.",
                writerId: "user-2",
                nickname: "User2",
                lessonId: String(lesson.lesson_id),
                createdAt: "2024-12-28T14:30:00",
            },
            {
                reviewId: "review-3",
                score: 4,
                content: "커리큘럼이 좋았습니다.",
                writerId: "user-3",
                nickname: "User3",
                lessonId: String(lesson.lesson_id),
                createdAt: "2024-12-20T09:00:00",
            }
        ];

        const totalElements = allReviews.length;
        const averageScore = allReviews.reduce((acc, curr) => acc + curr.score, 0) / totalElements || 0;

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const pagedReviews = allReviews.slice(startIndex, endIndex);

        return HttpResponse.json({
            status: 200,
            message: "OK",
            data: {
                averageScore,
                totalReviewCount: totalElements,
                reviews: {
                    content: pagedReviews,
                    page,
                    size,
                    totalElements
                }
            }
        });
    }),

    // 3. Lesson Detail Handler
    http.get("/api/v1/lessons/:id", ({ params }) => {
        const { id } = params;
        const lesson = lessonsData.find(l => l.lesson_id === Number(id));

        if (!lesson) {
            return new HttpResponse(null, { status: 404 });
        }

        const member = membersMap.get(lesson.mentor_id)!;
        const profile = profileMap.get(lesson.mentor_id)!;

        // Map lesson type number to Enum
        const typeMap: Record<number, "MENTORING" | "ONEDAY" | "STUDY"> = {
            1: "MENTORING",
            2: "ONEDAY",
            3: "STUDY"
        };
        const lessonType = typeMap[lesson.lesson_type] || "MENTORING";

        // Generate AvailableTimes Mock
        // Generate AvailableTimes Mock - 2 Weeks of data
        const today = new Date();
        const availableTimes: any[] = [];

        for (let i = 0; i < 14; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);

            // Skip weekends if desired, or just include all
            // Add Morning Slot
            availableTimes.push({
                availableTimeId: `at-${i}-1`,
                startTime: new Date(targetDate.setHours(10, 0, 0, 0)).toISOString(),
                endTime: new Date(targetDate.setHours(11, 0, 0, 0)).toISOString(),
                price: lesson.price
            });

            // Add Afternoon Slot
            availableTimes.push({
                availableTimeId: `at-${i}-2`,
                startTime: new Date(targetDate.setHours(14, 0, 0, 0)).toISOString(),
                endTime: new Date(targetDate.setHours(15, 0, 0, 0)).toISOString(),
                price: lesson.price
            });

            // Add Evening Slot
            availableTimes.push({
                availableTimeId: `at-${i}-3`,
                startTime: new Date(targetDate.setHours(19, 0, 0, 0)).toISOString(),
                endTime: new Date(targetDate.setHours(20, 0, 0, 0)).toISOString(),
                price: lesson.price
            });
        }

        return HttpResponse.json({
            status: 200,
            message: "OK",
            data: {
                mentor: {
                    mentorId: String(member.member_id),
                    nickname: member.nickname,
                    profileImage: profile.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop",
                    introduction: profile.introduce || "안녕하세요!"
                },
                lesson: {
                    lessonId: String(lesson.lesson_id),
                    description: `
    < h2 > ${lesson.title} </h2>
        < p > 이 강의는 ${member.nickname} 멘토의 경험이 녹아있는 실전 강의입니다.</p>
            < p > 본 강의를 통해 여러분은 실무에서 바로 통하는 노하우를 습득할 수 있습니다.</p>
                < h3 > 커리큘럼 </h3>
                < ul >
                <li>1주차: 기초 다지기 </li>
                    < li > 2주차: 심화 학습 </li>
                        < li > 3주차: 실전 프로젝트 </li>
                            </ul>
                                `,
                    lessonType: lessonType,
                    title: lesson.title,
                    thumbnailImage: lesson.thumbnail_image,
                    price: lesson.price,
                    location: lesson.location,
                    closeAt: lesson.close_at,
                    categoryId: lesson.category_id,
                    seats: 100, // Default or random
                    remainSeats: 90,
                    category: categoryMap.get(lesson.category_id)?.name || "Unknown",
                    menteeCount: lesson.studentCount
                },
                options: [
                    {
                        optionId: "opt-1",
                        name: "1:1 멘토링 60분",
                        minute: 60,
                        price: lesson.price
                    },
                    {
                        optionId: "opt-2",
                        name: "1:1 멘토링 90분",
                        minute: 90,
                        price: Math.floor(lesson.price * 1.5)
                    }
                ],
                availableTimes: availableTimes
            }
        });
    }),

    // 4. My Written Reviews Handler
    http.get("/api/v1/reviews/me", ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page")) || 1;
        const size = Number(url.searchParams.get("size")) || 10;

        // Mock My Reviews Data
        const myReviews: MyReviewResponseDTO[] = [
            {
                reviewId: "my-review-1",
                score: 5,
                content: "정말 유익한 시간이었습니다. 알고리즘 문제 접근법을 배울 수 있었어요!",
                lessonId: "1", // lesson-001
                scheduleId: "1-1",
                lessonName: "Spring 백엔드 1:1 멘토링",
                createdAt: "2025-12-21T10:00:00Z",
                optionName: "1:1 멘토링 60분",
                reservationDate: "2025-12-20",
                mentorNickname: "Mentor-mentor-001"
            },
            {
                reviewId: "my-review-2",
                score: 4,
                content: "기초부터 탄탄하게 배울 수 있었습니다.",
                lessonId: "2", // lesson-002
                scheduleId: "1-n-oneday",
                lessonName: "React 프론트엔드 기초",
                createdAt: "2025-12-16T09:00:00Z",
                optionName: "그룹 세션 90분",
                reservationDate: "2025-12-15",
                mentorNickname: "FrontendMaster"
            }
        ];

        const totalElements = myReviews.length;
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const content = myReviews.slice(startIndex, endIndex);

        return HttpResponse.json({
            status: 200,
            message: "OK",
            data: {
                content,
                page,
                size,
                totalElements
            }
        });
    }),
    // 5. Apply Handler
    http.post("/api/v1/schedules", async ({ request }) => {
        const body = (await request.json()) as any;
        const { lessonId, optionId, availableTimeId, startTime } = body;

        if (!lessonId) {
            return new HttpResponse(
                JSON.stringify({ message: "Lesson ID is required" }),
                { status: 400 }
            );
        }

        return HttpResponse.json({
            status: 200,
            message: "Apply success",
            data: {
                scheduleId: `sch_${Math.floor(Math.random() * 1000000)}`
            }
        });
    }),

    // 6. Checkout Handler
    http.post("/api/v1/apply/checkout", async ({ request }) => {
        const body = (await request.json()) as any;
        const { scheduleId } = body;

        if (!scheduleId) {
            return new HttpResponse(
                JSON.stringify({ message: "Schedule ID is required" }),
                { status: 400 }
            );
        }

        return HttpResponse.json({
            status: 200,
            message: "Checkout data fetched",
            data: {
                amount: 50000, // Mock amount
                orderName: "테스트 주문",
                orderId: `ORD_${scheduleId.split('_')[1] || Math.floor(Math.random() * 1000000)}`
            }
        });
    }),

    // 7. Payment Confirm Handler
    http.post("/api/v1/apply/confirm", async ({ request }) => {
        const body = (await request.json()) as any;
        const { paymentKey, scheduleId, amount } = body;

        if (!paymentKey || !scheduleId || !amount) {
            return new HttpResponse(
                JSON.stringify({ message: "Invalid payment data" }),
                { status: 400 }
            );
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return HttpResponse.json({
            status: 200,
            message: "Payment confirmed successfully",
            data: {
                paymentKey,
                scheduleId,
                amount,
                approvedAt: new Date().toISOString()
            }
        });
    }),
];
