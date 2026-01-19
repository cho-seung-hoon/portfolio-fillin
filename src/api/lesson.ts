import client, { publicClient } from "./client";
import { Lesson, LessonListResult } from "../types/lesson";
import { SuccessResponse, PageResponse, LessonThumbnail, LessonSortTypeEnum, RegisterLessonRequest } from "./types";

export interface LessonService {
    getLessons(search?: string, page?: number, sort?: string, categoryId?: number): Promise<LessonListResult>;
    createLesson(request: RegisterLessonRequest, thumbnail: File): Promise<void>;
}

class DefaultLessonService implements LessonService {
    async getLessons(search?: string, page: number = 1, sort?: string, categoryId?: number): Promise<LessonListResult> {
        // Map UI sort to API Enum
        let sortType: LessonSortTypeEnum = "CREATED_AT_DESC";
        switch (sort) {
            case "price-high": sortType = "PRICE_DESC"; break;
            case "price-low": sortType = "PRICE_ASC"; break;
            case "latest": sortType = "CREATED_AT_DESC"; break; // or created_at_asc depending on requirement
            case "popular": sortType = "CREATED_AT_DESC"; break; // Fallback as popular isn't in Enum yet? User only gave created/price.
            // User provided: CREATED_AT_ASC, CREATED_AT_DESC, PRICE_ASC, PRICE_DESC.
            // "popular" (student count) is NOT in the new Enum. 
            // I will default "popular" to CREATED_AT_DESC for now as user didn't provide POPOULAR sort type.
            default: sortType = "CREATED_AT_DESC"; break;
        }

        const params: Record<string, any> = {
            keyword: search,
            page,
            size: 20,
            sortType
        };

        if (categoryId !== undefined) {
            params.categoryId = categoryId;
        }

        // 목록 조회는 비로그인도 가능하도록 publicClient 사용
        const response = await publicClient.get<SuccessResponse<PageResponse<LessonThumbnail>>>("/v1/lessons/search", {
            params
        });

        const mappedLessons = response.data.data.content.map(this.mapThumbnailToModel);

        return {
            lessons: mappedLessons,
            totalCount: response.data.data.totalElements
        };
    }

    // Mapper function
    private mapThumbnailToModel(dto: LessonThumbnail): Lesson {
        const serviceTypeMap: Record<string, "mentoring" | "oneday" | "study"> = {
            "MENTORING": "mentoring",
            "ONEDAY": "oneday",
            "STUDY": "study",
        };

        return {
            id: dto.lessonId,
            title: dto.lessonTitle,
            instructor: dto.mentorNickName,
            price: 999999, // Hardcoded as requested
            originalPrice: undefined,
            rating: dto.rating,
            studentCount: 999, // Hardcoded as requested
            thumbnail: dto.thumbnailImage,
            category: "카테고리 " + dto.categoryId, // Placeholder as Name is missing
            categoryId: dto.categoryId,
            level: "초급", // Default
            tags: ["신규"],
            isNew: true, // simplified
            isBest: dto.rating >= 4.5,
            serviceType: serviceTypeMap[dto.lessonType] || "mentoring",
        };
    }
    async createLesson(request: RegisterLessonRequest, thumbnail: File): Promise<void> {
        const formData = new FormData();
        formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
        formData.append("thumbnail", thumbnail);

        await client.post("/v1/lessons", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
}

export const lessonService = new DefaultLessonService();
export type { Lesson };
