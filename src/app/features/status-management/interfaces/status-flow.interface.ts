export interface StatusFlowRequest {
  name: string;
  processStatuses?: string[];
}

export interface StatusItemResponse {
  id: string;
  group: 'START' | 'PROCESS' | 'SUCCESS' | 'FAILED';
  name: string;
  sequence: number;
  isSystem: boolean;
}

export interface StatusFlowResponse {
  id: string;
  name: string;
  statuses: StatusItemResponse[];
  ticketCount: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedByName: string;
  updatedAt: string;
}

export interface StatusFlowPageResponse {
  content: StatusFlowResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
