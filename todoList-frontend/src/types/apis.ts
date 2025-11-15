export interface TodoDTO {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  category: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; 
}