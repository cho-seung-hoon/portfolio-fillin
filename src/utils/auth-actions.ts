import { useAuthStore } from "../stores/authStore";
import { useLessonFormStore } from "../store/useLessonFormStore";
import { useMentoringRegistrationStore } from "../store/useMentoringRegistrationStore";
import { useOneDayRegistrationStore } from "../store/useOneDayRegistrationStore";
import { useStudyRegistrationStore } from "../store/useStudyRegistrationStore";

export const handleLogout = () => {
    // 1. Reset all registration form data
    useLessonFormStore.getState().reset();
    useMentoringRegistrationStore.getState().reset();
    useOneDayRegistrationStore.getState().reset();
    useStudyRegistrationStore.getState().reset();

    // 2. Clear Auth State
    useAuthStore.getState().logout();
};
