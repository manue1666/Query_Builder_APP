import type { ApiResponse, Query } from "../types/models";
import api from "./api";

export class QueryService {

    public async generate(databaseId: number, description: string): Promise<ApiResponse<Query>> {
        const response = await api.post('/api/query/generate', { databaseId, description }) as ApiResponse<Query>;
        return response;
    }


    public async getAll(databaseId: number): Promise<ApiResponse<Query[]>> {
        const response = await api.get(`/api/query/all/${databaseId}`) as ApiResponse<Query[]>;
        return response;
    }


    public async getById(id: number): Promise<ApiResponse<Query>> {
        const response = await api.get(`/api/query/${id}`) as ApiResponse<Query>;
        return response;
    }


    public async delete(id: number): Promise<ApiResponse<Query>> {
        const response = await api.delete(`/api/query/${id}`) as ApiResponse<Query>;
        return response;
    }
}
