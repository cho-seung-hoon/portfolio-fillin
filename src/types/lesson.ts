export interface Lesson {
    id: string;
    title: string;
    instructor: string;
    price: number | null;
    originalPrice?: number;
    rating: number | null;
    studentCount: number;
    thumbnail: string;
    category: string;
    categoryId: number;
    level: "입문" | "초급" | "중급" | "고급";
    tags: string[];
    isNew?: boolean;
    isBest?: boolean;
    serviceType?: "mentoring" | "oneday" | "study";
    location?: string;
    closeAt?: string;
    status: "active" | "inactive";
    createdAt: string;
}

export interface LessonListResult {
    lessons: Lesson[];
    totalCount: number;
}

// Detail Domain Models
export interface MentorProfile {
    name: string;
    avatar: string;
    introduction: string;
}

export interface Review {
    id: string | number; // Support both for flexibility or migration
    userName: string;
    avatar: string;
    rating: number;
    date: string;
    content: string;
    helpful: number;
}

export interface Schedule {
    "1-1"?: {
        availableTimes: { day: string; times: string[] }[];
        rawAvailableTimes?: { // Added raw data for easier logic handling
            availableTimeId: string;
            startTime: string;
            endTime: string;
            price: number;
        }[];
    };
    "1-n-oneday"?: {
        sessions: { availableTimeId: string; startTime: string; date: string; time: string; remaining: number; maxSeats: number; price: number }[];
    };
    "1-n-study"?: {
        totalSessions: number;
        duration: string;
        sessions: { session: number; date: string; time: string; topic: string }[];
        remaining: number;
        maxSeats: number;
    };
}

export interface LessonOption {
    id: string;
    name: string;
    duration: string; // Display string e.g. "60분"
    minute: number;
    price: number;
}

export interface LessonDetail extends Lesson {
    description: string;
    mentor: MentorProfile; // Override simple string instructor from Lesson
    reviewCount: number;
    options: LessonOption[]; // Added options
    schedules: Schedule;
    reviews: Review[];
}
