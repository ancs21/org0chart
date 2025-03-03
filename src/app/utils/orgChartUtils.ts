import { OrgChartNode, TreeNode, CSVData } from '../types';

/**
 * Convert flat array of nodes to hierarchical tree structure
 */
export function buildTreeFromFlatData(flatData: CSVData[]): OrgChartNode[] {
  if (!flatData || flatData.length === 0) {
    return [];
  }

  // Create a map for quick lookup of nodes by ID
  const nodeMap: Record<string, OrgChartNode> = {};
  
  // Initialize the node map with empty children arrays
  flatData.forEach(item => {
    if (!item.id) return; // Skip items without an ID
    
    nodeMap[item.id] = {
      id: item.id,
      name: item.name || 'Unnamed',
      title: item.title || '',
      department: item.department || '',
      parentId: item.parentId,
      imageUrl: item.imageUrl || '',
      collapsed: false,
      children: []
    };
  });
  
  // Connect all children to their parents
  Object.values(nodeMap).forEach(node => {
    // If this node has a parent and that parent exists in our map
    if (node.parentId && nodeMap[node.parentId]) {
      // Add this node as a child of its parent
      nodeMap[node.parentId].children.push(node);
    }
  });
  
  // Find root nodes (nodes that don't have a parent or have a parent that doesn't exist in our data)
  const rootNodes: OrgChartNode[] = [];
  
  Object.values(nodeMap).forEach(node => {
    // If node has no parent ID or its parent doesn't exist, it's a root node
    if (!node.parentId || !nodeMap[node.parentId]) {
      rootNodes.push(node);
    }
  });

  // If we have no root nodes but have data, create a default root node
  if (rootNodes.length === 0 && Object.keys(nodeMap).length > 0) {
    // Include all nodes as roots
    return Object.values(nodeMap);
  }
  
  return rootNodes;
}

/**
 * Convert to format expected by react-d3-tree
 */
export function convertToTreeFormat(nodes: OrgChartNode[]): TreeNode[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }
  
  // No longer filtering out nodes - include all nodes regardless of parent/child status
  return nodes.map(node => ({
    name: node.name || 'Unnamed',
    attributes: {
      id: node.id,
      ...(node.title && node.title.trim() !== '' ? { title: node.title } : {}),
      ...(node.department && node.department.trim() !== '' ? { department: node.department } : {}),
      ...(node.imageUrl ? { imageUrl: node.imageUrl } : {}),
      collapsed: node.collapsed ? 'true' : 'false',
      childCount: (node.children?.length || 0).toString()
    },
    children: (node.children && node.children.length > 0 && !node.collapsed) 
      ? convertToTreeFormat(node.children) 
      : undefined
  }));
}

/**
 * Flatten hierarchical tree data to array format for CSV export
 */
export function flattenTreeData(nodes: OrgChartNode[], parentId: string | null = null): CSVData[] {
  let result: CSVData[] = [];
  
  nodes.forEach(node => {
    // Add current node
    result.push({
      id: node.id,
      name: node.name,
      title: node.title,
      department: node.department,
      parentId: parentId,
      imageUrl: node.imageUrl
    });
    
    // Add children if any
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTreeData(node.children, node.id));
    }
  });
  
  return result;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
} 