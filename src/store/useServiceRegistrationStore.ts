
import { create } from 'zustand';

export interface StudySession {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
}

interface ServiceRegistrationState {
    // Study Session State
    studyPrice: number;
    studySeats: number;
    studySessions: StudySession[];

    // Actions
    setStudyPrice: (price: number) => void;
    setStudySeats: (seats: number) => void;
    addStudySession: (session: StudySession) => void;
    removeStudySession: (id: string) => void;
    resetStudySessions: () => void;
}

export const useServiceRegistrationStore = create<ServiceRegistrationState>((set) => ({
    studyPrice: 0,
    studySeats: 0,
    studySessions: [],

    setStudyPrice: (price) => set({ studyPrice: price }),
    setStudySeats: (seats) => set({ studySeats: seats }),
    addStudySession: (session) =>
        set((state) => ({ studySessions: [...state.studySessions, session] })),
    removeStudySession: (id) =>
        set((state) => ({
            studySessions: state.studySessions.filter((s) => s.id !== id),
        })),
    resetStudySessions: () =>
        set({ studyPrice: 0, studySeats: 0, studySessions: [] }),
}));
