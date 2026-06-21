export interface PositionRequest {
  name: string;
}

export interface PositionResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
