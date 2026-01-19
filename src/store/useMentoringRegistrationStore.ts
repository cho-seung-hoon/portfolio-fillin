
import { create } from 'zustand';

// UI-Specific Option Structure (Nested)
export interface PriceOption {
    id: string;
    duration: string; // "30", "60" etc.
    price: string;
}

export interface ServiceOption {
    id: string;
    name: string;
    priceOptions: PriceOption[];
}

// API-Aligned Time Structure
export interface AvailableTime {
    startTime: string; // ISO String (UTC)
    endTime: string;   // ISO String (UTC)
    price: number; // usually 0 for mentoring slots if price is in option
    seats: number; // usually 1
}

interface ServiceRegistrationState {
    // Basic Info 
    title: string;
    lessonType: string;
    description: string;
    location: string;
    categoryId: number;
    closeAt: string | null;

    // Mentoring Specific Logic
    mentoringOptions: ServiceOption[];
    availableTimeList: AvailableTime[];

    // Actions
    setTitle: (title: string) => void;
    setLessonType: (type: string) => void;
    setDescription: (description: string) => void;
    setLocation: (location: string) => void;
    setCategoryId: (id: number) => void;
    setCloseAt: (date: string | null) => void;

    // Option Actions
    setMentoringOptions: (options: ServiceOption[]) => void;
    addMentoringOption: () => void;
    removeMentoringOption: (id: string) => void;
    updateMentoringOptionName: (id: string, name: string) => void;

    addPriceOption: (optionId: string) => void;
    removePriceOption: (optionId: string, priceOptionId: string) => void;
    updatePriceOption: (optionId: string, priceOptionId: string, field: keyof PriceOption, value: string) => void;

    // Schedule Actions
    setAvailableTimeList: (times: AvailableTime[]) => void;
    addAvailableTime: (time: AvailableTime) => void;
    removeAvailableTime: (index: number) => void; // Using index for now as primitive identifiers might be duplicated or complex

    reset: () => void;
}

export const useMentoringRegistrationStore = create<ServiceRegistrationState>((set) => ({
    title: "",
    lessonType: "",
    description: "",
    location: "",
    categoryId: 0,
    closeAt: null,

    mentoringOptions: [{ id: "1", name: "", priceOptions: [] }],
    availableTimeList: [],

    setTitle: (title) => set({ title }),
    setLessonType: (lessonType) => set({ lessonType }),
    setDescription: (description) => set({ description }),
    setLocation: (location) => set({ location }),
    setCategoryId: (categoryId) => set({ categoryId }),
    setCloseAt: (closeAt) => set({ closeAt }),

    setMentoringOptions: (mentoringOptions) => set({ mentoringOptions }),

    addMentoringOption: () => set((state) => ({
        mentoringOptions: [
            ...state.mentoringOptions,
            { id: Date.now().toString(), name: "", priceOptions: [] }
        ]
    })),

    removeMentoringOption: (id) => set((state) => ({
        mentoringOptions: state.mentoringOptions.filter(opt => opt.id !== id)
    })),

    updateMentoringOptionName: (id, name) => set((state) => ({
        mentoringOptions: state.mentoringOptions.map(opt =>
            opt.id === id ? { ...opt, name } : opt
        )
    })),

    addPriceOption: (optionId) => set((state) => ({
        mentoringOptions: state.mentoringOptions.map(opt =>
            opt.id === optionId ? {
                ...opt,
                priceOptions: [
                    ...opt.priceOptions,
                    { id: Date.now().toString(), duration: "", price: "" }
                ]
            } : opt
        )
    })),

    removePriceOption: (optionId, priceOptionId) => set((state) => ({
        mentoringOptions: state.mentoringOptions.map(opt =>
            opt.id === optionId ? {
                ...opt,
                priceOptions: opt.priceOptions.filter(po => po.id !== priceOptionId)
            } : opt
        )
    })),

    updatePriceOption: (optionId, priceOptionId, field, value) => set((state) => ({
        mentoringOptions: state.mentoringOptions.map(opt =>
            opt.id === optionId ? {
                ...opt,
                priceOptions: opt.priceOptions.map(po =>
                    po.id === priceOptionId ? { ...po, [field]: value } : po
                )
            } : opt
        )
    })),

    setAvailableTimeList: (availableTimeList) => set({ availableTimeList }),

    addAvailableTime: (time) => set((state) => {
        // Helper to convert time string to minutes
        const getMinutes = (iso: string) => new Date(iso).getTime() / 60000;

        // Combine existing and new time
        const allTimes = [...state.availableTimeList, time];

        // Sort by start time
        allTimes.sort((a, b) => getMinutes(a.startTime) - getMinutes(b.startTime));

        const merged: AvailableTime[] = [];
        if (allTimes.length > 0) {
            let current = allTimes[0];

            for (let i = 1; i < allTimes.length; i++) {
                const next = allTimes[i];

                // If overlap or contiguous (current.endTime >= next.startTime)
                if (getMinutes(next.startTime) <= getMinutes(current.endTime)) {
                    // Merge: Extend current end time if next ends later
                    if (getMinutes(next.endTime) > getMinutes(current.endTime)) {
                        current = { ...current, endTime: next.endTime };
                    }
                    // If next ends before current, it's fully contained, so stick with current
                } else {
                    // No overlap/touch, push and start new
                    merged.push(current);
                    current = next;
                }
            }
            merged.push(current);
        }

        return { availableTimeList: merged };
    }),

    removeAvailableTime: (index) => set((state) => ({
        availableTimeList: state.availableTimeList.filter((_, i) => i !== index)
    })),

    reset: () =>
        set({
            title: "",
            lessonType: "",
            description: "",
            location: "",
            categoryId: 0,
            closeAt: null,
            mentoringOptions: [{ id: "1", name: "", priceOptions: [] }],
            availableTimeList: [],
        }),
}));
