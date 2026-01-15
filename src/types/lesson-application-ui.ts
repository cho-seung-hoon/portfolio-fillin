export interface LessonApplicationUiModel {
    title: string;
    lessonType: "mentoring" | "oneday" | "study";
    mentor: UiMentor;
    options: UiOption[];
    schedules: UiSchedules;
}

export interface UiMentor {
    nickname: string;
    profileImage: string;
}

export interface UiOption {
    optionId: string;
    name: string;
    price: number;
    duration: string; // e.g., "1시간" or "30분" - Used for display
    minute: number;   // e.g., 60 or 30 - Used for logic
}

export interface UiSchedules {
    "1-1"?: MentoringSchedule;
    "1-n-oneday"?: OneDaySchedule;
    "1-n-study"?: StudySchedule;
}

export interface MentoringSchedule {
    rawAvailableTimes: {
        startTime: string; // ISO 8601 string
        endTime: string;   // ISO 8601 string
    }[];
}

export interface OneDaySchedule {
    sessions: {
        date: string;      // "YYYY-MM-DD"
        time: string;      // "HH:mm-HH:mm"
        remaining: number;
        maxSeats: number;
    }[];
}

export interface StudySchedule {
    totalSessions: number;
    duration: string;    // "YYYY.MM.DD - YYYY.MM.DD"
    remaining: number;
    maxSeats: number;
    sessions: {
        session: number; // 회차 번호
        date: string;    // "YYYY-MM-DD"
        time: string;    // "HH:mm-HH:mm"
        topic: string;
    }[];
}
