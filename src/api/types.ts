export interface CategoryDTO {
    category_id: number;
    name: string;
    parent_category_id: number | null;
}

export interface MentorDTO {
    mentor_id: number;
    name: string;
}

export interface LessonDTO {
    lesson_id: number;
    lesson_type: 1 | 2 | 3;
    title: string;
    description: string;
    thumbnail_image: string;
    location: string;
    price: number;
    created_at: string;
    close_at: string;
    updated_at: string;
    deleted_at: string | null;
    mentor_id: number;
    category_id: number;
    rating: number;
    studentCount: number;
}

export interface MemberDTO {
    member_id: number;
    nickname: string;
    phone_num: string;
    email: string;
    password?: string;
    created_at: string;
    deleted_at: string | null;
    updated_at: string | null;
}

export interface ProfileDTO {
    member_id: number;
    image: string | null;
    introduce: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
    category_id: number;
}

export interface LoginResponseDTO {
    accessToken: string;
}

export type SignupResponseDTO = SuccessResponse<null>;


// Flattened LessonResponseDTO
export interface LessonResponseDTO {
    lesson_id: number;
    lesson_type: 1 | 2 | 3;
    title: string;
    description: string;
    thumbnail_image: string;
    location: string;
    price: number;
    created_at: string;
    close_at: string;
    updated_at: string;
    deleted_at: string | null;
    mentor_id: number;
    category_id: number;
    rating: number;
    studentCount: number;
    // Joined fields
    mentor: MentorDTO;
    category: CategoryDTO;
}

export interface ReviewDTO {
    reviewId: string;
    score: number;
    content: string;
    writerId: string;
    nickname: string; // Renamed from writerNickname
    lessonId: string;
    createdAt: string;
}

export interface ScheduleDTO {
    "1-1"?: {
        available_times: { day: string; times: string[] }[];
    };
    "1-n-oneday"?: {
        sessions: { date: string; time: string; remaining: number; max_seats: number }[];
    };
    "1-n-study"?: {
        total_sessions: number;
        duration: string;
        sessions: { session: number; date: string; time: string; topic: string }[];
        remaining: number;
        max_seats: number;
    };
}

// Flattened LessonDetailDTO
export interface LessonDetailDTO {
    lesson_id: number;
    lesson_type: 1 | 2 | 3;
    title: string;
    description: string;
    thumbnail_image: string;
    location: string;
    price: number;
    created_at: string;
    close_at: string;
    updated_at: string;
    deleted_at: string | null;
    mentor_id: number;
    category_id: number;
    rating: number;
    studentCount: number;
    // Joined fields
    mentor: MentorDTO & {
        avatar: string;
        introduction: string;
    };
    category: CategoryDTO;
    // Detail specific fields
    reviews: ReviewDTO[];
    schedules: ScheduleDTO;
}

export interface SuccessResponse<T> {
    data: T;
    status: number;
    message: string;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
}

export type LessonTypeEnum = "MENTORING" | "ONEDAY" | "STUDY";

export interface LessonThumbnail {
    lessonId: string;
    thumbnailImage: string;
    lessonTitle: string;
    lessonType: LessonTypeEnum;
    mentorNickName: string;
    rating: number;
    categoryId: number;
    category: string;
    location: string;
    closeAt: string;
    createdAt: string;
    menteeCount: number;
}

export type LessonSortTypeEnum = "CREATED_AT_ASC" | "CREATED_AT_DESC" | "PRICE_ASC" | "PRICE_DESC";

export interface LessonSearchCondition {
    keyword?: string;
    lessonType?: LessonTypeEnum;
    categoryId?: number;
    sortType?: LessonSortTypeEnum;
    page: number;
    size: number;
}

export interface LessonReviewListResponseDTO {
    averageScore: number;
    totalReviewCount: number;
    reviews: PageResponse<ReviewDTO>;
}

// New Lesson Detail API DTOs
export interface MentorInfoDTO {
    mentorId: string;
    nickname: string;
    profileImage: string;
    introduction: string;
}

export interface LessonInfoDTO {
    lessonId: string;
    description: string;
    lessonType: LessonTypeEnum;
    title: string;
    thumbnailImage: string;
    price: number;
    seats?: number;
    remainSeats?: number;
    categoryId: number;
    location: string;
    closeAt: string;
    category: string;
    menteeCount: number;
}

export interface AvailableTimeDTO {
    availableTimeId: string;
    startTime: string;
    endTime: string;
    price: number;
    seats?: number;
    remainSeats?: number;
}

export interface LessonOptionDTO {
    optionId: string;
    name: string;
    minute: number;
    price: number;
}

export interface LessonDetailResponseDTO {
    mentor: MentorInfoDTO;
    lesson: LessonInfoDTO;
    options: LessonOptionDTO[];
    availableTimes: AvailableTimeDTO[];
}

export interface MyReviewResponseDTO {
    reviewId: string;
    score: number;
    content: string;
    lessonId: string;
    scheduleId: string;
    lessonName: string;
    createdAt: string; // Instant
    optionName: string;
    reservationDate: string; // LocalDate
    mentorNickname: string;
}

export interface CategoryResponseDto {
    categoryId: number;
    name: string;
    parentCategoryId: number | null;
}

export interface ProfileResponseDto {
    imageUrl: string;
    nickname: string;
    email: string;
    phoneNum: string;
    introduction: string;
    category: CategoryResponseDto;
}

export interface SignupRequestDTO {
    email: string;
    nickname: string;
    password: string;
    phoneNum: string;
}

export interface UnwrittenReviewResponseDTO {
    scheduleId: string;
    lessonName: string;
    lessonId: string;
    optionName: string;
    reservationDate: string; // LocalDate string (YYYY-MM-DD)
    mentorNickname: string;
}

export interface CreateReviewRequestDTO {
    scheduleId: string;
    score: number;
    content: string;
}

export interface LessonOptionRequest {
    name: string;
    minute: number;
    price: number;
}

export interface AvailableTimeRequest {
    startTime: string; // Instant ISO string
    endTime: string; // Instant ISO string
    price: number;
    seats: number;
}

export interface RegisterLessonRequest {
    title: string;
    description: string;
    lessonType: LessonTypeEnum;
    categoryId: number;
    location: string;
    closeAt: string; // Instant ISO string
    price?: number; // Top level price for OneDay/Study
    seats?: number; // Top level seats
    optionList: LessonOptionRequest[];
    availableTimeList: AvailableTimeRequest[];
}

export interface EditLessonRequest {
    title: string;
    description: string;
    location: string;
    categoryId: number;
    closeAt: string; // Instant ISO string
}

export interface EditLessonResponse {
    lessonId: string;
}
