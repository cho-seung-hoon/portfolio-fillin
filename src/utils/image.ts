import { imageService } from "../api/image";

/**
 * 이미지 URL을 반환합니다 (동기식, 기존 호환성 유지).
 * API 엔드포인트인 경우에는 getImageBlobUrl을 사용하세요.
 */
export const getImageUrl = (path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("blob:")) {
        return path;
    }
    // Remove leading slash if present to avoid double slashes if base has trailing slash
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "";

    // Ensure baseUrl ends with /
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

    return `${cleanBaseUrl}${cleanPath}`;
};

/**
 * 이미지 파일을 blob으로 다운로드하여 blob URL을 반환합니다.
 * API 엔드포인트로 이미지를 받을 때 사용하세요.
 * @param imagePath 이미지 경로 (예: "/v1/lessons/image" 또는 "/api/v1/lessons/image")
 * @param requireAuth 인증이 필요한지 여부 (기본값: false)
 * @returns Blob URL. 사용 후 URL.revokeObjectURL()을 호출하여 메모리를 해제해야 합니다.
 */
export const getImageBlobUrl = async (
    imagePath?: string | null,
    requireAuth: boolean = false
): Promise<string> => {
    if (!imagePath) return "";

    // 이미 blob URL이거나 완전한 URL인 경우 그대로 반환
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:") || imagePath.startsWith("blob:")) {
        return imagePath;
    }

    // API 엔드포인트인 경우에만 blob으로 처리
    if (imagePath.startsWith("/api/") || imagePath.startsWith("/v1/") || imagePath.startsWith("/v2/")) {
        try {
            if (requireAuth) {
                return await imageService.getImageAsBlob(imagePath);
            } else {
                return await imageService.getImageAsBlobPublic(imagePath);
            }
        } catch (error) {
            console.error("Failed to load image as blob:", error);
            // 실패 시 원래 경로 반환
            return imagePath;
        }
    }

    // API 엔드포인트가 아닌 경우 일반 URL 반환
    return getImageUrl(imagePath);
};
