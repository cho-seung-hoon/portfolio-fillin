import client, { publicClient } from "./client";

export interface ImageService {
    /**
     * 이미지 파일을 blob으로 다운로드합니다.
     * @param imagePath 이미지 경로 (예: "/v1/lessons/image" 또는 상대 경로)
     * @returns Blob URL을 반환합니다. 사용 후 URL.revokeObjectURL()을 호출하여 메모리를 해제해야 합니다.
     */
    getImageAsBlob(imagePath: string): Promise<string>;

    /**
     * 이미지 파일을 blob으로 다운로드합니다 (인증 불필요).
     * @param imagePath 이미지 경로
     * @returns Blob URL을 반환합니다.
     */
    getImageAsBlobPublic(imagePath: string): Promise<string>;
}

class DefaultImageService implements ImageService {
    async getImageAsBlob(imagePath: string): Promise<string> {
        // Ensure path starts with /
        const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

        const response = await client.get(cleanPath, {
            responseType: "blob",
        });

        // Create blob URL from response
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);

        return url;
    }

    async getImageAsBlobPublic(imagePath: string): Promise<string> {
        // Ensure path starts with /
        const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

        const response = await publicClient.get(cleanPath, {
            responseType: "blob",
        });

        // Create blob URL from response
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);

        return url;
    }
}

export const imageService = new DefaultImageService();
