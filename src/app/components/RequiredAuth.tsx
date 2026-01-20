import { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuthStore } from "../../stores/authStore";

interface RequiredAuthProps {
    children: ReactNode;
}

export function RequiredAuth({ children }: RequiredAuthProps) {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
