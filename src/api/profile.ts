import client from "./client";
import { SuccessResponse, ProfileResponseDto } from "./types";

export interface ProfileService {
    getMyProfile(token?: string): Promise<ProfileResponseDto>;
    updateNickname(nickname: string): Promise<void>;
    updateIntroduction(introduction: string, categoryId: number): Promise<void>;
    updateProfileImage(image: File): Promise<void>;
}

class DefaultProfileService implements ProfileService {
    async getMyProfile(token?: string): Promise<ProfileResponseDto> {
        // If token is provided (e.g. during login process), use it in headers
        // Otherwise rely on client interceptor (authenticated state)
        const config = token
            ? { headers: { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } }
            : undefined;

        const response = await client.get<SuccessResponse<ProfileResponseDto>>("/v1/profile/me", config);
        return response.data.data;
    }

    async updateNickname(nickname: string): Promise<void> {
        await client.patch<SuccessResponse<void>>("/v1/profile/me/nickname", { nickname });
    }

    async updateIntroduction(introduction: string, categoryId: number): Promise<void> {
        await client.patch<SuccessResponse<void>>("/v1/profile/me/introduction", { introduction, categoryId });
    }

    async updateProfileImage(image: File): Promise<void> {
        const formData = new FormData();
        formData.append("image", image);
        await client.patch<SuccessResponse<void>>("/v1/profile/me/image", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
}

export const profileService = new DefaultProfileService();
