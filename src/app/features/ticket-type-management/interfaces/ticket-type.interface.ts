export interface TicketTypeRequest {
  name: string;
  categoryIds: string[];
}

export interface TicketTypeResponse {
  id: string;
  name: string;
  categories: CategoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketTypePageResponse {
  content: TicketTypeResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface SubCategoryItem {
  id: string;
  name: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  statusFlowId: string;
  statusFlowName: string;
  subCategories: SubCategoryItem[];
}

export interface TicketTypeSelectorResponse {
  id: string;
  name: string;
  categories: CategoryItem[];
}

export interface TicketCategoryRequest {
  name: string;
  statusFlowId: string;
  subCategoryIds: string[];
}

export interface TicketCategoryResponse {
  id: string;
  name: string;
  statusFlowId: string;
  statusFlowName: string;
  subCategories: SubCategoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketCategoryPageResponse {
  content: TicketCategoryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TicketSubCategoryRequest {
  name: string;
  priorityLevelId: string;
  positionId: string;
}

export interface TicketSubCategoryResponse {
  id: string;
  name: string;
  priorityLevelId: string;
  priorityLevelName: string;
  positionId: string;
  positionName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketSubCategoryPageResponse {
  content: TicketSubCategoryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TicketSummaryResponse {
  id: string;
  title: string;
  projectName: string;
  assigneeName: string;
  teamName: string;
}

export interface TicketSummaryPageResponse {
  content: TicketSummaryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
