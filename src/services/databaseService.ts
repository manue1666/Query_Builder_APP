import type { ApiResponse, Database } from "../types/models";
import api from "./api";

export class DatabaseService {


    public async create(name: string, description: string, sqlSchema: string): Promise<ApiResponse<Database>> {
        const response = await api.post('/api/database/create', { name, description, sqlSchema }) as ApiResponse<Database>;
        return response;
    }


    public async getAll(): Promise<ApiResponse<Database[]>> {
        const response = await api.get('/api/database/all') as ApiResponse<Database[]>;
        return response;
    }


    public async getById(id: number): Promise<ApiResponse<Database>> {
        const response = await api.get(`/api/database/${id}`) as ApiResponse<Database>;
        return response;
    }

    public async update(id: number, name: string, description: string, sqlSchema: string): Promise<ApiResponse<Database>> {
        const response = await api.put(`/api/database/${id}`, { name, description, sqlSchema }) as ApiResponse<Database>;
        return response;
    }


    public async delete(id: number): Promise<ApiResponse<Database>> {
        const response = await api.delete(`/api/database/${id}`) as ApiResponse<Database>;
        return response;
    }
}
