import client from "./client";
import { SuccessResponse, LessonDetailResult } from "../types/service-application-data";

export interface ScheduleCreateRequest {
    lessonId: string;
    optionId: string | null;
    availableTimeId: string | null;
    startTime: string | null; // ISOString
    message: string;
}

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

    /**
     * Create a schedule (Apply for a lesson).
     * Returns scheduleId on success, null on failure.
     */
    async createSchedule(request: ScheduleCreateRequest): Promise<string | null> {
        try {
            const response = await client.post<SuccessResponse<{ scheduleId: string }>>("/v1/schedules", request);
            return response.data.data.scheduleId;
        } catch (error) {
            console.error("Failed to create schedule:", error);
            return null;
        }
    }
};
