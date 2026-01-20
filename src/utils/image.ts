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
