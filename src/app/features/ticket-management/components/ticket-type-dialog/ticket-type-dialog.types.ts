export interface TicketSubCategory {
  id: string;
  name: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  statusFlowId: string;
  statusFlowName: string;
  subCategories: TicketSubCategory[];
}

export interface TicketTypeNode {
  id: string;
  name: string;
  categories: TicketCategory[];
}

export interface SelectedTicketType {
  typeId: string;
  type: string;
  categoryId: string;
  category: string;
  subCategoryId: string;
  subCategory: string;
  statusFlowId: string;
  statusFlowName: string;
  priorityId: string;
  priorityName: string;
  priorityIntervalValue: number;
  priorityIntervalUnit: string;
  positionName: string;
}
