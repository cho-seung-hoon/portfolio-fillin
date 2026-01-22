let hasNavigatedInternal = false;

export const setHasNavigatedInternal = () => {
    hasNavigatedInternal = true;
};

export const handleSmartBack = (navigate: (opts: { to: string; params?: any }) => void, fallbackPath: string = '/', fallbackParams?: any) => {
    // Check if there is a referrer and it comes from the same origin
    const hasExternalReferrer = document.referrer && document.referrer.startsWith(window.location.origin);

    if (hasExternalReferrer || hasNavigatedInternal || window.history.length > 1) {
        // Safe to go back if we have history
        // Note: window.history.length > 1 includes external history, but it is standard browser "Back" behavior.
        // If users strictly want to avoid "Back to Google", we should rely on hasNavigatedInternal.
        // However, standard expectation is "Back" goes back.
        // We will prioritize internal navigation flag for strictly internal back behavior if desired,
        // but robustly, checking history length is safer than always failing.
        // Given user request: "If NOT our service site, go Home".
        // This implies avoiding external back.

        if (hasExternalReferrer || hasNavigatedInternal) {
            window.history.back();
        } else {
            // If history exists but we don't know if it's ours, we fallback to home to be safe
            // as per user request to avoid exiting the app context unexpectedly
            navigate({ to: fallbackPath, params: fallbackParams });
        }
    } else {
        // Fallback to home if no referrer or external referrer
        navigate({ to: fallbackPath, params: fallbackParams });
    }
};
