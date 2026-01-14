import client from "./client";
import { SuccessResponse, CategoryResponseDto } from "./types";

export interface CategoryService {
    getCategories(): Promise<CategoryResponseDto[]>;
}

class DefaultCategoryService implements CategoryService {
    async getCategories(): Promise<CategoryResponseDto[]> {
        const response = await client.get<SuccessResponse<CategoryResponseDto[]>>("/v1/categories");
        return response.data.data;
    }
}

export const categoryService = new DefaultCategoryService();
