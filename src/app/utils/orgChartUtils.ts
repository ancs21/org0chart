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
  
  // Track which nodes have children
  const nodesWithChildren = new Set<string>();
  
  // First, connect all children to their parents
  Object.values(nodeMap).forEach(node => {
    // If this node has a parent and that parent exists in our map
    if (node.parentId && nodeMap[node.parentId]) {
      // Add this node as a child of its parent
      nodeMap[node.parentId].children.push(node);
      // Mark the parent as having children
      nodesWithChildren.add(node.parentId);
    }
  });
  
  // Find root nodes (nodes without parents or with non-existent parents)
  // Filter out nodes with no parent AND no children
  const rootNodes: OrgChartNode[] = [];
  
  Object.values(nodeMap).forEach(node => {
    const hasParent = node.parentId && nodeMap[node.parentId];
    const hasChildren = nodesWithChildren.has(node.id);
    
    // Only include the node if:
    // 1. It has a valid parent (it's a child node), OR
    // 2. It has children (even if it's a root node), OR
    // 3. It's an intentional root node (parentId is explicitly null or empty)
    if (hasParent || hasChildren || node.parentId === null || node.parentId === '') {
      // If it doesn't have a parent in our data, it's a root node
      if (!hasParent) {
        rootNodes.push(node);
      }
    }
    // Nodes with no parent and no children will be excluded
  });

  // If we have no root nodes but have data, something is wrong with the parent-child relationships
  if (rootNodes.length === 0 && Object.keys(nodeMap).length > 0) {
    // Find nodes that might be orphaned due to broken parent references
    // But only include nodes that have children
    const nodesWithChildrenArray = Object.values(nodeMap).filter(node => 
      nodesWithChildren.has(node.id)
    );
    
    return nodesWithChildrenArray.length > 0 ? nodesWithChildrenArray : [];
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
  
  // Filter out nodes that have no parent and no children
  const filteredNodes = nodes.filter(node => {
    const hasParent = node.parentId !== null && node.parentId !== '';
    const hasChildren = node.children && node.children.length > 0;
    
    // Keep nodes that have a parent, have children, or are explicitly marked as root nodes
    return hasParent || hasChildren || node.parentId === null;
  });
  
  return filteredNodes.map(node => ({
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