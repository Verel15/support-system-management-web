export interface TicketSubCategory {
  id: string;
  name: string;
  team: string;
  level: string;
  resolutionTime: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  subCategories: TicketSubCategory[];
}

export interface TicketTypeNode {
  id: string;
  name: string;
  categories: TicketCategory[];
}

export interface SelectedTicketType {
  type: string;
  category: string;
  subCategory: string;
  team: string;
  level: string;
  resolutionTime: string;
}
