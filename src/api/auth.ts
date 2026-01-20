import { publicClient } from "./client";
import { profileService } from "./profile";
import { User, AuthResult } from "../types/auth";
import { LoginResponseDTO, SignupResponseDTO, SuccessResponse, ProfileResponseDto, SignupRequestDTO } from "./types";

export interface AuthService {
    login(email: string, password: string): Promise<AuthResult>;
    signup(memberData: SignupRequestDTO): Promise<void>;
    me(token: string): Promise<User>;
}

class DefaultAuthService implements AuthService {
    async login(email: string, password: string): Promise<AuthResult> {
        const response = await publicClient.post<LoginResponseDTO>("/v1/auth/login", {
            email,
            password,
        });

        const accessToken = response.data.accessToken.replace(/^Bearer\s+/, "");

        // 1. Extract ID from Token (since Profile API doesn't return ID)
        const { memberId } = this.decodeTokenPayload(accessToken);

        // 2. Fetch Profile
        const profile = await profileService.getMyProfile(accessToken);

        return {
            user: {
                id: Number(memberId),
                email: profile.email,
                name: profile.nickname,
                profileImageUrl: profile.imageUrl
            },
            token: accessToken
        };
    }

    async signup(memberData: SignupRequestDTO): Promise<void> {
        await publicClient.post<SignupResponseDTO>("/v1/members/signup", memberData);
    }

    async me(token: string): Promise<User> {
        const { memberId } = this.decodeTokenPayload(token);
        const profile = await profileService.getMyProfile(token);
        return {
            id: Number(memberId),
            email: profile.email,
            name: profile.nickname,
            profileImageUrl: profile.imageUrl
        };
    }

    private decodeTokenPayload(token: string): { memberId: string, email: string } {
        try {
            const jwt = token.replace("Bearer ", "");
            const parts = jwt.split(".");
            // Handle both mock format and real format if possible, 
            // but standard is parts[1] is payload.
            const payloadIndex = 1;

            const base64Url = parts[payloadIndex];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Failed to decode token", error);
            throw new Error("Failed to decode token");
        }
    }
}

export const authService = new DefaultAuthService();
export type { User, AuthResult };
