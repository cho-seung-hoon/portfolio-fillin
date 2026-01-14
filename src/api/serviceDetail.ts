import client from "./client";
import { LessonDetail } from "../types/lesson";
import { LessonDetailDTO, SuccessResponse, LessonReviewListResponseDTO, LessonDetailResponseDTO } from "./types";

export interface ServiceDetailService {
  getServiceDetail(id: string): Promise<LessonDetail | null>; // Return new domain model
}

class DefaultServiceDetailService implements ServiceDetailService {
  async getServiceDetail(id: string): Promise<LessonDetail | null> {
    try {
      const [detailResponse, reviewResponse] = await Promise.all([
        client.get<SuccessResponse<LessonDetailResponseDTO>>(`/v1/lessons/${id}`),
        client.get<SuccessResponse<LessonReviewListResponseDTO>>(`/v1/lessons/${id}/reviews`)
      ]);

      const detail = this.mapDtoToModel(detailResponse.data.data);
      const reviews = reviewResponse.data.data.reviews.content.map(r => ({
        id: r.reviewId,
        userName: r.nickname, // Use nickname if available
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop", // Placeholder
        rating: r.score,
        date: r.createdAt,
        content: r.content,
        helpful: 0
      }));

      return {
        ...detail,
        reviews: reviews,
        reviewCount: reviewResponse.data.data.totalReviewCount,
        rating: reviewResponse.data.data.averageScore // Sync rating from reviews
      };
    } catch (error) {
      console.error("Failed to fetch service detail:", error);
      return null;
    }
  }

  private mapDtoToModel(dto: LessonDetailResponseDTO): LessonDetail {
    const serviceTypeMap: Record<string, "mentoring" | "oneday" | "study"> = {
      "MENTORING": "mentoring",
      "ONEDAY": "oneday",
      "STUDY": "study",
    };

    const type = serviceTypeMap[dto.lesson.lessonType] || "mentoring";

    // Mock Schedules based on type (since API only provided availableTimes for Mentoring)
    // For 1:N types, we generate test data (999) as requested
    const schedules: LessonDetail["schedules"] = {};

    if (type === "mentoring") {
      // Group available times by day
      const timesByDay: Record<string, string[]> = {};
      const dayMap: { [key: number]: string } = { 0: "일", 1: "월", 2: "화", 3: "수", 4: "목", 5: "금", 6: "토" };

      dto.availableTimes.forEach(at => {
        const date = new Date(at.startTime);
        const day = dayMap[date.getDay()];
        const formatTime = (d: Date) => d.toTimeString().slice(0, 5);
        const timeRange = `${formatTime(new Date(at.startTime))}-${formatTime(new Date(at.endTime))}`;

        if (!timesByDay[day]) {
          timesByDay[day] = [];
        }
        timesByDay[day].push(timeRange);
      });

      schedules["1-1"] = {
        availableTimes: Object.entries(timesByDay).map(([day, times]) => ({
          day,
          times
        })),
        rawAvailableTimes: dto.availableTimes // Preserve raw data for booking logic if needed
      };
    } else if (type === "oneday") {
      schedules["1-n-oneday"] = {
        sessions: (dto.availableTimes || []).map(at => {
          const startTime = new Date(at.startTime);
          const endTime = new Date(at.endTime);
          const formatTime = (d: Date) => d.toTimeString().slice(0, 5);

          return {
            date: startTime.toISOString().split('T')[0], // YYYY-MM-DD
            time: `${formatTime(startTime)}-${formatTime(endTime)}`,
            maxSeats: 99999, // Mocked as data not in API
            remaining: 99999  // Mocked as data not in API
          };
        })
      };
    } else if (type === "study") {
      // Sort availableTimes by startTime
      const sortedTimes = [...(dto.availableTimes || [])].sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      schedules["1-n-study"] = {
        duration: "4주", // MOCKED (Data not in API)
        totalSessions: sortedTimes.length,
        maxSeats: 99999, // MOCKED (Data not in API)
        remaining: 99999, // MOCKED (Data not in API)
        sessions: sortedTimes.map((at, index) => {
          const startTime = new Date(at.startTime);
          const endTime = new Date(at.endTime);
          const formatTime = (d: Date) => d.toTimeString().slice(0, 5);

          return {
            session: index + 1,
            topic: `회차 ${index + 1}`, // MOCKED (Data not in API)
            date: startTime.toISOString().split('T')[0],
            time: `${formatTime(startTime)}-${formatTime(endTime)}`
          };
        })
      };
    }

    // Calculate Price
    let displayPrice = dto.lesson.price ?? 0;

    // For ONEDAY, if price is 0 (or explicitly dependent on options/times), check availableTimes
    // But user said for STUDY, we use "Lesson's price".
    // For ONEDAY, we previously used min price of times. 
    if (type === "oneday" && dto.availableTimes && dto.availableTimes.length > 0) {
      // If lesson.price is 0 for oneday (as we set in registration), get min from times?
      // In registration we set top level price to 0. So here we should derive it.
      const minPrice = Math.min(...dto.availableTimes.map(t => t.price));
      if (displayPrice === 0) displayPrice = minPrice;
    }

    return {
      // Base Lesson fields
      id: dto.lesson.lessonId, // Convert string ID from new API
      title: dto.lesson.title,
      instructor: dto.mentor.nickname,
      price: displayPrice,
      originalPrice: undefined,
      rating: 0, // Placeholder, updated in getServiceDetail
      studentCount: 99999, // MOCKED
      thumbnail: dto.lesson.thumbnailImage,
      category: "이거바꿔야함!! (Category)", // MOCKED
      categoryId: dto.lesson.categoryId ?? 1, // Use from DTO
      level: "입문", // MOCKED to satisfy type
      tags: ["이거바꿔야함!! (Tags)"], // MOCKED
      isNew: true,
      isBest: false,
      serviceType: type,

      // Detail fields
      description: dto.lesson.description,
      mentor: {
        name: dto.mentor.nickname,
        avatar: dto.mentor.profileImage,
        introduction: dto.mentor.introduction
      },
      options: (dto.options || []).map(opt => ({
        id: opt.optionId,
        name: opt.name,
        duration: `${opt.minute}분`,
        minute: opt.minute,
        price: opt.price
      })),
      reviewCount: 0,
      schedules: schedules,
      reviews: []
    };
  }
}

export const serviceDetailService = new DefaultServiceDetailService();