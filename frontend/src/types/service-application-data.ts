export interface SuccessResponse<T> {
    data: T;
    status: number;
    message: string;
}

export interface LessonDetailResult {
    mentor: Mentor;
    lesson: Lesson;
    options: Option[];
    availableTimes: AvailableTime[];
    bookedTimes: BookedTime[];
}

export interface BookedTime {
    startTime: string; // ISO 8601 string
    endTime: string; // ISO 8601 string
}

export interface Mentor {
    mentorId: string;
    nickname: string;
    profileImage: string;
    introduction: string;
}

export interface Lesson {
    lessonId: string;
    description: string;
    lessonType: string;
    title: string;
    thumbnailImage: string;
    price: number;
    seats: number | null;
    remainSeats: number | null;
    categoryId: number;
}

export interface Option {
    optionId: string;
    name: string;
    minute: number;
    price: number;
}

export interface AvailableTime {
    availableTimeId: string;
    startTime: string; // ISO 8601 string
    endTime: string; // ISO 8601 string
    price: number;
    seats: number | null;
    remainSeats: number | null;
}
