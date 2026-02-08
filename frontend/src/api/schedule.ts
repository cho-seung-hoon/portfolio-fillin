import client from "./client";
import {
    SuccessResponse,
    PageResponse,
    ScheduleListResponse,
    ScheduleDetailResponse,
    ScheduleStatus,
    ScheduleSortType,
    ScheduleParticipantRole
} from "./types";

export interface ScheduleSearchCondition {
    keyword?: string;
    status?: ScheduleStatus;
    from: string; // ISO Instant, required for upcoming
    page: number;
    size: number;
    sortType?: ScheduleSortType;
}

export interface PastScheduleSearchCondition {
    keyword?: string;
    status?: ScheduleStatus;
    to: string; // ISO Instant, required for past
    page: number;
    size: number;
    sortType?: ScheduleSortType;
}

export interface ScheduleService {
    getUpcomingSchedules(condition: ScheduleSearchCondition): Promise<PageResponse<ScheduleListResponse>>;
    getPastSchedules(condition: PastScheduleSearchCondition): Promise<PageResponse<ScheduleListResponse>>;
    getCalendarSchedules(start: string, end: string, page?: number, size?: number): Promise<PageResponse<ScheduleListResponse>>;
    getScheduleDetail(scheduleId: string, scheduleTimeId: string): Promise<ScheduleDetailResponse>;
    searchSchedules(condition: {
        keyword?: string;
        status?: ScheduleStatus;
        participantRole?: ScheduleParticipantRole;
        page: number;
        size: number;
    }): Promise<PageResponse<ScheduleListResponse>>;
    updateStatus(scheduleId: string, status: ScheduleStatus): Promise<void>;
}

class DefaultScheduleService implements ScheduleService {
    async getUpcomingSchedules(condition: ScheduleSearchCondition): Promise<PageResponse<ScheduleListResponse>> {
        const response = await client.get<SuccessResponse<PageResponse<ScheduleListResponse>>>(
            "/v1/schedules/upcoming",
            { params: condition }
        );
        return response.data.data;
    }

    async getPastSchedules(condition: PastScheduleSearchCondition): Promise<PageResponse<ScheduleListResponse>> {
        const response = await client.get<SuccessResponse<PageResponse<ScheduleListResponse>>>(
            "/v1/schedules/past",
            { params: condition }
        );
        return response.data.data;
    }

    async getCalendarSchedules(start: string, end: string, page: number = 0, size: number = 100): Promise<PageResponse<ScheduleListResponse>> {
        const response = await client.get<SuccessResponse<PageResponse<ScheduleListResponse>>>(
            "/v1/schedules/calendar",
            { params: { start, end, page, size } }
        );
        return response.data.data;
    }

    async getScheduleDetail(scheduleId: string, scheduleTimeId: string): Promise<ScheduleDetailResponse> {
        const response = await client.get<SuccessResponse<ScheduleDetailResponse>>(
            `/v1/schedules/${scheduleId}/times/${scheduleTimeId}`
        );
        return response.data.data;
    }

    async updateStatus(scheduleId: string, status: ScheduleStatus): Promise<void> {
        await client.patch(
            `/v1/schedules/${scheduleId}/status`,
            null,
            { params: { next: status } }
        );
    }

    async searchSchedules(condition: {
        keyword?: string;
        status?: ScheduleStatus;
        participantRole?: ScheduleParticipantRole;
        page: number;
        size: number;
    }): Promise<PageResponse<ScheduleListResponse>> {
        const response = await client.get<SuccessResponse<PageResponse<ScheduleListResponse>>>(
            "/v1/schedules/search",
            { params: condition }
        );
        return response.data.data;
    }
}

export const scheduleService: ScheduleService = new DefaultScheduleService();
