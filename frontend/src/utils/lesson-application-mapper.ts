import { format, parseISO } from "date-fns";
import { LessonDetailResult, AvailableTime, Option } from "../types/service-application-data";
import { LessonApplicationUiModel, UiOption, UiSchedules } from "../types/lesson-application-ui";

export function mapApiToLesson(apiData: LessonDetailResult): LessonApplicationUiModel {
    const { lesson, mentor, options, availableTimes } = apiData;

    // 1. Map Options (minute -> duration string)
    const uiOptions: UiOption[] = options.map((opt) => ({
        optionId: opt.optionId,
        name: opt.name,
        price: opt.price,
        minute: opt.minute,
        duration: formatDuration(opt.minute),
    }));

    // 2. Map Schedules based on Lesson Type
    const schedules: UiSchedules = {};
    const lessonType = mapLessonType(lesson.lessonType);

    if (lessonType === "mentoring") {
        // 1:1 Mentoring - availableTimes to rawAvailableTimes
        // API times are UTC ISO strings. valid local Date objects are created by parseISO/new Date
        schedules["1-1"] = {
            rawAvailableTimes: availableTimes.map((t) => ({
                availableTimeId: t.availableTimeId,
                startTime: t.startTime, // Keep ISO string, UI components parse it to local Date
                endTime: t.endTime,
            })),
            bookedTimes: (apiData.bookedTimes || []).map((t) => ({
                startTime: t.startTime,
                endTime: t.endTime,
            })),
        };
    } else if (lessonType === "oneday") {
        // 1:N OneDay - availableTimes to sessions
        schedules["1-n-oneday"] = {
            sessions: availableTimes.map((t) => {
                const localDate = new Date(t.startTime);
                return {
                    date: format(localDate, "yyyy-MM-dd"),
                    time: `${format(localDate, "HH:mm")}-${format(new Date(t.endTime), "HH:mm")}`,
                    remaining: t.remainSeats ?? 0,
                    maxSeats: t.seats ?? 0,
                    price: t.price,
                    availableTimeId: t.availableTimeId,
                };
            }),
        };
    } else if (lessonType === "study") {
        // 1:N Study - availableTimes to sessions + Summary Info
        const sortedTimes = [...availableTimes].sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const sessions = sortedTimes.map((t, index) => {
            const localDate = new Date(t.startTime);
            return {
                session: index + 1,
                date: format(localDate, "yyyy-MM-dd"),
                time: `${format(localDate, "HH:mm")}-${format(new Date(t.endTime), "HH:mm")}`,
                topic: `${index + 1}회차!!!@#`, // Placeholder as requested
            };
        });

        const totalSessions = sessions.length;
        let durationStr = "";

        if (sortedTimes.length > 0) {
            const start = new Date(sortedTimes[0].startTime);
            const end = new Date(sortedTimes[sortedTimes.length - 1].startTime); // Duration usually implies date range of sessions
            durationStr = `${format(start, "yyyy.MM.dd")} - ${format(end, "yyyy.MM.dd")}`;
        }

        // Assuming remaining/maxSeats are consistent across sessions for a study (or take the first one)
        // Or if it represents the whole course capacity
        const firstSlot = sortedTimes[0];

        schedules["1-n-study"] = {
            totalSessions,
            duration: durationStr,
            sessions,
            remaining: lesson.remainSeats ?? 0,
            maxSeats: lesson.seats ?? 0,
            price: lesson.price ?? 0,
        };
    }

    return {
        title: lesson.title,
        thumbnailImage: lesson.thumbnailImage,
        lessonType: lessonType as "mentoring" | "oneday" | "study",
        mentor: {
            nickname: mentor.nickname,
            profileImage: mentor.profileImage,
        },
        options: uiOptions,
        schedules,
    };
}

function mapLessonType(apiType: string): string {
    // Simple lowercase mapping, assuming API returns "MENTORING", "ONEDAY", "STUDY" or similar
    return apiType.toLowerCase();
}

function formatDuration(minute: number): string {
    if (minute >= 60) {
        const hours = Math.floor(minute / 60);
        const mins = minute % 60;
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
    return `${minute}분`;
}
