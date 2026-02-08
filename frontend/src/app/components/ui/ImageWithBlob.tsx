import { useImageBlob } from "../../../hooks/useImageBlob";
import { getImageUrl } from "../../../utils/image";

interface ImageWithBlobProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    /**
     * 이미지 경로. API 엔드포인트인 경우 자동으로 blob으로 변환됩니다.
     */
    src?: string | null;
    /**
     * 인증이 필요한지 여부 (기본값: false)
     */
    requireAuth?: boolean;
    /**
     * 로딩 중일 때 표시할 fallback 이미지 경로
     */
    fallbackSrc?: string;
}

/**
 * 이미지 컴포넌트 - API 엔드포인트인 경우 자동으로 blob으로 변환하여 표시합니다.
 */
export function ImageWithBlob({
    src,
    requireAuth = false,
    fallbackSrc,
    alt = "",
    ...props
}: ImageWithBlobProps) {
    const { blobUrl, isLoading } = useImageBlob(src, requireAuth);

    // 로딩 중이거나 blobUrl이 없을 때 fallback 표시
    const displaySrc = isLoading ? (fallbackSrc || "") : (blobUrl || getImageUrl(src || "") || fallbackSrc || "");

    return <img src={displaySrc} alt={alt} {...props} />;
}
