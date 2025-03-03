export interface OrgChartNode {
  id: string;
  name: string;
  title?: string;
  department?: string;
  parentId: string | null;
  children?: OrgChartNode[];
  imageUrl?: string;
  collapsed?: boolean;
}

export interface TreeNode {
  name: string;
  attributes?: Record<string, string>;
  children?: TreeNode[];
}

export interface CSVData {
  id: string;
  name: string;
  title?: string;
  department?: string;
  parentId: string | null;
  imageUrl?: string;
} 