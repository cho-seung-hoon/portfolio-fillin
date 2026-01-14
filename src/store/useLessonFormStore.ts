
import { create } from 'zustand';

interface LessonFormState {
    title: string;
    description: string;
    // Service Type is critical for deciding which other store to read
    lessonType: string;
    location: string;
    // Category might be expanded later, DTO requires it
    categoryId: number;
    closeAt: string | null;

    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setLessonType: (type: string) => void;
    setLocation: (location: string) => void;
    setCategoryId: (id: number) => void;
    setCloseAt: (date: string | null) => void;

    reset: () => void;
}

export const useLessonFormStore = create<LessonFormState>((set) => ({
    title: "",
    description: "",
    lessonType: "",
    location: "",
    categoryId: 1, // Default to 1 as per current logic
    closeAt: null,

    setTitle: (title) => set({ title }),
    setDescription: (description) => set({ description }),
    setLessonType: (lessonType) => set({ lessonType }),
    setLocation: (location) => set({ location }),
    setCategoryId: (categoryId) => set({ categoryId }),
    setCloseAt: (closeAt) => set({ closeAt }),

    reset: () => set({
        title: "",
        description: "",
        lessonType: "",
        location: "",
        categoryId: 1,
        closeAt: null
    })
}));
