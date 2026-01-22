
import { create } from 'zustand';

export interface Option {
    name: string;
    minute: number;
    price: number;
}

export interface AvailableTime {
    startTime: string; // ISO String or similar
    endTime: string;   // ISO String or similar
    price: number;
    seats: number;
}

interface ServiceRegistrationState {
    // Basic Info
    title: string;
    lessonType: string;
    description: string;
    location: string;
    categoryId: number;
    closeAt: string | null;

    // Top-level Price/Seats (Used by Study, maybe OneDay)
    price: number;
    seats: number;

    // Options (Used by Mentoring)
    optionList: Option[];

    // Available Times (Used by Mentoring, OneDay, Study)
    availableTimeList: AvailableTime[];

    // Study-specific: Start/End dates and recurring option
    studyStartDate: string | null;
    studyEndDate: string | null;
    isRecurring: boolean;
    selectedWeekdays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Actions
    setTitle: (title: string) => void;
    setLessonType: (type: string) => void;
    setDescription: (description: string) => void;
    setLocation: (location: string) => void;
    setCategoryId: (id: number) => void;
    setCloseAt: (date: string | null) => void;

    setPrice: (price: number) => void;
    setSeats: (seats: number) => void;

    setOptionList: (options: Option[]) => void;
    setAvailableTimeList: (times: AvailableTime[]) => void;
    addAvailableTime: (time: AvailableTime) => void;
    removeAvailableTime: (index: number) => void;

    setStudyStartDate: (date: string | null) => void;
    setStudyEndDate: (date: string | null) => void;
    setIsRecurring: (isRecurring: boolean) => void;
    setSelectedWeekdays: (weekdays: number[]) => void;
    toggleWeekday: (weekday: number) => void;

    reset: () => void;
}

export const useStudyRegistrationStore = create<ServiceRegistrationState>((set) => ({
    title: "",
    lessonType: "",
    description: "",
    location: "",
    categoryId: 0,
    closeAt: null,
    price: 0,
    seats: 0,
    optionList: [],
    availableTimeList: [],
    studyStartDate: null,
    studyEndDate: null,
    isRecurring: false,
    selectedWeekdays: [],

    setTitle: (title) => set({ title }),
    setLessonType: (lessonType) => set({ lessonType }),
    setDescription: (description) => set({ description }),
    setLocation: (location) => set({ location }),
    setCategoryId: (categoryId) => set({ categoryId }),
    setCloseAt: (closeAt) => set({ closeAt }),

    setPrice: (price) => set({ price }),
    setSeats: (seats) => set({ seats }),

    setOptionList: (optionList) => set({ optionList }),
    setAvailableTimeList: (availableTimeList) => set({ availableTimeList }),
    addAvailableTime: (time) =>
        set((state) => ({ availableTimeList: [...state.availableTimeList, time] })),
    removeAvailableTime: (index) =>
        set((state) => ({
            availableTimeList: state.availableTimeList.filter((_, i) => i !== index),
        })),

    setStudyStartDate: (studyStartDate) => set({ studyStartDate }),
    setStudyEndDate: (studyEndDate) => set({ studyEndDate }),
    setIsRecurring: (isRecurring) => set({ isRecurring }),
    setSelectedWeekdays: (selectedWeekdays) => set({ selectedWeekdays }),
    toggleWeekday: (weekday) => set((state) => {
        const weekdays = state.selectedWeekdays.includes(weekday)
            ? state.selectedWeekdays.filter(w => w !== weekday)
            : [...state.selectedWeekdays, weekday].sort();
        return { selectedWeekdays: weekdays };
    }),

    reset: () =>
        set({
            title: "",
            lessonType: "",
            description: "",
            location: "",
            categoryId: 0,
            closeAt: null,
            price: 0,
            seats: 0,
            optionList: [],
            availableTimeList: [],
            studyStartDate: null,
            studyEndDate: null,
            isRecurring: false,
            selectedWeekdays: [],
        }),
}));
