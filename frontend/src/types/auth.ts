export interface User {
    id: number;
    email: string;
    name: string;
    profileImageUrl?: string | null;
}

export interface AuthResult {
    user: User;
    token: string;
}
