import { useState, useEffect } from "react";
import { getImageBlobUrl } from "../utils/image";

/**
 * 이미지 경로를 blob URL로 변환하는 Hook
 * API 엔드포인트인 경우 자동으로 blob으로 변환합니다.
 */
export function useImageBlob(imagePath?: string | null, requireAuth: boolean = false) {
    const [blobUrl, setBlobUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!imagePath) {
            setBlobUrl("");
            return;
        }

        // 이미 blob URL이거나 완전한 URL인 경우
        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://") ||
            imagePath.startsWith("data:") ||
            imagePath.startsWith("blob:")
        ) {
            setBlobUrl(imagePath);
            return;
        }

        // API 엔드포인트인 경우에만 blob으로 변환
        if (imagePath.startsWith("/api/") || imagePath.startsWith("/v1/") || imagePath.startsWith("/v2/")) {
            setIsLoading(true);
            setError(null);

            getImageBlobUrl(imagePath, requireAuth)
                .then((url) => {
                    setBlobUrl(url);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to load image as blob:", err);
                    setError(err);
                    setBlobUrl(imagePath); // Fallback to original path
                    setIsLoading(false);
                });
        } else {
            // 일반 경로인 경우 그대로 사용
            setBlobUrl(imagePath);
        }

        // Cleanup: revoke blob URL when component unmounts or imagePath changes
        return () => {
            if (blobUrl && blobUrl.startsWith("blob:")) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [imagePath, requireAuth]);

    return { blobUrl, isLoading, error };
}
