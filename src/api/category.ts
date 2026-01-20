import client, { publicClient } from "./client";
import { SuccessResponse, CategoryResponseDto } from "./types";

export interface CategoryService {
    getCategories(): Promise<CategoryResponseDto[]>;
}

class DefaultCategoryService implements CategoryService {
    async getCategories(): Promise<CategoryResponseDto[]> {
        // 카테고리는 비로그인 노출 가능하므로 publicClient 사용
        const response = await publicClient.get<SuccessResponse<any[]>>("/v1/categories");
        const raw = response.data.data ?? [];

        // 실제 API 응답 구조 확인을 위한 로깅
        console.log("=== Raw API Response ===");
        console.log("Total categories:", raw.length);
        if (raw.length > 0) {
            console.log("First item (raw):", raw[0]);
            console.log("First item keys:", Object.keys(raw[0]));
            console.log("First item (stringified):", JSON.stringify(raw[0], null, 2));
        }

        // 백엔드 응답이 camelCase/ snake_case / nested parent 형태 모두 올 수 있어서 여기서 정규화
        const normalized = raw.map((c: any) => {
            // 다양한 필드명 시도 (모든 가능한 변형 확인)
            const parentId =
                c.parentCategoryId ??
                c.parent_category_id ??
                c.parentCategory?.categoryId ??
                c.parent_category?.category_id ??
                c.parent?.categoryId ??
                c.parent?.category_id ??
                c.parent?.id ??
                c.parentId ??
                null;

            const categoryId = c.categoryId ?? c.category_id ?? c.id ?? c.categoryId;

            const normalizedItem = {
                categoryId: categoryId != null ? Number(categoryId) : categoryId,
                name: c.name,
                parentCategoryId: parentId != null ? Number(parentId) : null,
            };

            return normalizedItem;
        }) as CategoryResponseDto[];

        console.log("=== Normalized Categories ===");
        console.log("Total normalized:", normalized.length);
        console.log("Categories with parentCategoryId:", normalized.filter(c => c.parentCategoryId !== null).length);
        console.log("Categories without parentCategoryId:", normalized.filter(c => c.parentCategoryId === null).length);
        console.log("First 5 normalized:", normalized.slice(0, 5));

        // parentCategoryId가 있는 카테고리 샘플 출력
        const withParent = normalized.find(c => c.parentCategoryId !== null);
        if (withParent) {
            console.log("Sample category with parent:", withParent);
        }

        return normalized;
    }
}

export const categoryService = new DefaultCategoryService();
