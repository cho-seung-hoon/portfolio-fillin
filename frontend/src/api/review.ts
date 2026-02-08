import client from "./client";
import { SuccessResponse, PageResponse, MyReviewResponseDTO, UnwrittenReviewResponseDTO, CreateReviewRequestDTO } from "./types";

export interface ReviewService {
    getMyReviews(page: number, size: number): Promise<PageResponse<MyReviewResponseDTO>>;
    getUnwrittenReviews(page: number, size: number): Promise<PageResponse<UnwrittenReviewResponseDTO>>;
    createReview(data: CreateReviewRequestDTO): Promise<void>;
}

class DefaultReviewService implements ReviewService {
    async getMyReviews(page: number, size: number): Promise<PageResponse<MyReviewResponseDTO>> {
        const response = await client.get<SuccessResponse<PageResponse<MyReviewResponseDTO>>>("/v1/reviews/me", {
            params: { page, size }
        });
        return response.data.data;
    }

    async getUnwrittenReviews(page: number, size: number): Promise<PageResponse<UnwrittenReviewResponseDTO>> {
        const response = await client.get<SuccessResponse<PageResponse<UnwrittenReviewResponseDTO>>>("/v1/reviews/unwritten", {
            params: { page, size }
        });
        return response.data.data;
    }

    async createReview(data: CreateReviewRequestDTO): Promise<void> {
        await client.post("/v1/reviews", data);
    }
}

export const reviewService = new DefaultReviewService();
