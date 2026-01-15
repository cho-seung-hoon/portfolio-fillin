import client from "./client";
import { SuccessResponse, LessonDetailResult } from "../types/service-application-data";

export const applicationService = {
    /**
     * Fetch raw service detail data from API.
     * Returns the data as-is, to be processed by a separate mapper.
     */
    async getLessonApplicationData(lessonId: string): Promise<LessonDetailResult | null> {
        try {
            const response = await client.get<SuccessResponse<LessonDetailResult>>(`/v1/lessons/${lessonId}`);
            return response.data.data;
        } catch (error) {
            console.error("Failed to fetch application data:", error);
            return null;
        }
    },
};
