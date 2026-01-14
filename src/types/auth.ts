export interface User {
    id: number;
    email: string;
    name: string;
}

export interface AuthResult {
    user: User;
    token: string;
}
