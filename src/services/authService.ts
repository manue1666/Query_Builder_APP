import type { ApiResponse, User } from "../types/models";
import api from "./api";

export class AuthService {

    public async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
        const response = await api.post('/api/auth/login', { email, password }) as ApiResponse<{ token: string; user: User }>;
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    }

    public async register(name: string, email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
        const response = await api.post('/api/auth/register', { name, email, password }) as ApiResponse<{ token: string; user: User }>;
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    }

    public logout() {
        localStorage.removeItem('token');
    }
}