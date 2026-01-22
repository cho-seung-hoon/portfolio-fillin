import client, { publicClient } from "./client";
import { Lesson, LessonListResult } from "../types/lesson";
import { SuccessResponse, PageResponse, LessonThumbnail, LessonSortTypeEnum, RegisterLessonRequest, LessonSearchCondition } from "./types";
import { RegisterLessonResponse } from "./dto/lesson-creation-result";

export interface LessonService {
    getLessons(search?: string, page?: number, sort?: string, categoryId?: number): Promise<LessonListResult>;
    getOwnLessons(condition?: Partial<LessonSearchCondition>): Promise<Lesson[]>;
    createLesson(request: RegisterLessonRequest, thumbnail: File): Promise<string>;
    updateLesson(lessonId: string, request: RegisterLessonRequest, thumbnail?: File): Promise<void>;
    deleteLesson(lessonId: string): Promise<void>;
}


class DefaultLessonService implements LessonService {
    async getLessons(search?: string, page: number = 1, sort?: string, categoryId?: number, lessonType?: string): Promise<LessonListResult> {
        // Map UI sort to API Enum
        let sortType: LessonSortTypeEnum = "CREATED_AT_DESC";
        switch (sort) {
            case "price-high": sortType = "PRICE_DESC"; break;
            case "price-low": sortType = "PRICE_ASC"; break;
            case "latest": sortType = "CREATED_AT_DESC"; break; // or created_at_asc depending on requirement
            case "popular": sortType = "POPULARITY"; break;
            default: sortType = "POPULARITY"; break;
        }

        const params: Record<string, any> = {
            keyword: search,
            page,
            size: 20,
            sortType
        };

        if (categoryId !== undefined && categoryId !== null && !isNaN(categoryId)) {
            params.categoryId = categoryId;
        }

        if (lessonType && lessonType !== "all") {
            // Map frontend "mentoring" | "oneday" | "study" to backend "MENTORING" | "ONEDAY" | "STUDY"
            params.lessonType = lessonType.toUpperCase();
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

    async getOwnLessons(condition?: Partial<LessonSearchCondition>): Promise<Lesson[]> {
        const response = await client.get<SuccessResponse<PageResponse<LessonThumbnail>>>("/v1/lessons/mine", {
            params: condition
        });
        return response.data.data.content.map(this.mapThumbnailToModel.bind(this));
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
            price: dto.price ?? null, // Use API price or null
            originalPrice: undefined,
            rating: dto.rating,
            studentCount: dto.menteeCount ?? 0, // Guard against undefined
            thumbnail: dto.thumbnailImage,
            category: dto.category, // Updated from placeholder string
            categoryId: dto.categoryId,
            level: "초급", // Default
            tags: [],
            isNew: false, // simplified
            isBest: dto.rating >= 4.5,
            serviceType: serviceTypeMap[dto.lessonType] || "mentoring",
            location: dto.location,
            closeAt: dto.closeAt,
            status: new Date(dto.closeAt) > new Date() ? "active" : "inactive",
            createdAt: dto.createdAt,
        };
    }
    async createLesson(request: RegisterLessonRequest, thumbnail: File): Promise<string> {
        const formData = new FormData();
        formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
        formData.append("thumbnail", thumbnail);

        const response = await client.post<SuccessResponse<RegisterLessonResponse>>("/v1/lessons", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data.data.lessonId;
    }

    async updateLesson(lessonId: string, request: any, thumbnail?: File): Promise<void> {
        const formData = new FormData();
        formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }

        await client.patch(`/v1/lessons/${lessonId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    async deleteLesson(lessonId: string): Promise<void> {
        await client.delete(`/v1/lessons/${lessonId}`);
    }
}

export const lessonService = new DefaultLessonService();
export type { Lesson };
