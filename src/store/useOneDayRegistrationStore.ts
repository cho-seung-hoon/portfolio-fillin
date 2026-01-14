
import { create } from 'zustand';

export interface Option {
    name: string;
    minute: number;
    price: number;
}

export interface AvailableTime {
    startTime: string; // ISO String (UTC)
    endTime: string;   // ISO String (UTC)
    price: number;
    seats: number;
}

interface ServiceRegistrationState {
    // Basic Info (Shared or specific to OneDay?)
    // Usually Basic Info like Title/Desc is managed by the parent or a general store, 
    // but the user wants a separate store for OneDay. 
    // If this store is ONLY for the OneDay-specific part (sessions), then we might not need title/desc here.
    // However, adhering to the pattern requested (copy of Study store, separate), I will include them.
    title: string;
    lessonType: string;
    description: string;
    location: string;
    categoryId: number;
    closeAt: string | null;

    // Top-level Price/Seats (Not typically used for OneDay if per-session, but kept for DTO compatibility)
    price: number;
    seats: number;

    // Options (Used by Mentoring)
    optionList: Option[];

    // Available Times (Used by OneDay - Critical part)
    availableTimeList: AvailableTime[];

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

    reset: () => void;
}

export const useOneDayRegistrationStore = create<ServiceRegistrationState>((set) => ({
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
        }),
}));
