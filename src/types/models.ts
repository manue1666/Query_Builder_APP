// data models
export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

export interface Database {
    id: number;
    userId: number;
    name: string;
    description: string;
    sqlSchema: string;
    createdAt: string;
}

export interface Query {
    id: number;
    description: string;
    generatedSql: string;
    databaseId: number;
    createdAt: string;
}

// Generic API response type
export interface ApiResponse<T>{
    success: boolean;
    message: string;
    data: T;
}