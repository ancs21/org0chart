'use client';

import { useState, useEffect } from 'react';
import CSVImport from './components/CSVImport';
import CSVExport from './components/CSVExport';
import OrgChart from './components/OrgChart';
import NodeEditor from './components/NodeEditor';
import { OrgChartNode, CSVData, TreeNode } from './types';
import { buildTreeFromFlatData, convertToTreeFormat, flattenTreeData } from './utils/orgChartUtils';

export default function Home() {
  const [orgNodes, setOrgNodes] = useState<OrgChartNode[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<OrgChartNode | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isNewNode, setIsNewNode] = useState(false);
  const [flatData, setFlatData] = useState<CSVData[]>([]);

  // Update tree data whenever org nodes change
  useEffect(() => {
    setTreeData(convertToTreeFormat(orgNodes));
    // Also update flat data for CSV export
    setFlatData(flattenTreeData(orgNodes));
  }, [orgNodes]);

  // Handle CSV import
  const handleImport = (data: CSVData[]) => {
    // Log the imported data for debugging
    console.log('Imported CSV data:', data);
    
    // Build the tree from flat data
    const tree = buildTreeFromFlatData(data);
    console.log('Built tree structure:', tree);
    
    // Check if we have data after filtering isolated nodes
    if (tree.length === 0 && data.length > 0) {
      alert('Warning: All nodes in the imported data are isolated (no parent and no children) and will be hidden. Please check your CSV file.');
    }
    
    setOrgNodes(tree);
  };

  // Handle node click in the org chart
  const handleNodeClick = (node: OrgChartNode) => {
    // If the node has children, allow collapsing/expanding with a modifier key
    if (node.children && node.children.length > 0 && window.event && (window.event as MouseEvent).altKey) {
      toggleNodeCollapse(node.id);
      return;
    }
    
    // Regular edit behavior
    setSelectedNode(node);
    setShowEditor(true);
    setIsNewNode(false);
  };

  // Handle node save
  const handleSaveNode = (node: OrgChartNode) => {
    if (isNewNode) {
      // Add new node
      if (node.parentId) {
        // Add as child to parent
        const updatedNodes = [...orgNodes];
        
        // Helper function to find and update a node in the tree
        const updateNodeInTree = (nodes: OrgChartNode[], parentId: string, newNode: OrgChartNode): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            // Check if this is the parent node
            if (nodes[i].id === parentId) {
              // Initialize children array if it doesn't exist
              if (!nodes[i].children) {
                nodes[i].children = [];
              }
              // Now we know children is defined
              nodes[i].children?.push(newNode);
              return true;
            }
            
            // If this node has children, recursively search them
            if (nodes[i].children && nodes[i].children.length > 0) {
              const childResult = updateNodeInTree(nodes[i].children, parentId, newNode);
              if (childResult) {
                return true;
              }
            }
          }
          return false;
        };
        
        if (updateNodeInTree(updatedNodes, node.parentId, node)) {
          setOrgNodes(updatedNodes);
        }
      } else {
        // Add as root node
        setOrgNodes([...orgNodes, node]);
      }
    } else {
      // Update existing node
      // Helper function to update nodes recursively
      const updateNode = (nodes: OrgChartNode[], updatedNode: OrgChartNode): OrgChartNode[] => {
        return nodes.map(n => {
          if (n.id === updatedNode.id) {
            return { ...updatedNode, children: n.children };
          }
          if (n.children) {
            return { ...n, children: updateNode(n.children, updatedNode) };
          }
          return n;
        });
      };
      
      setOrgNodes(updateNode(orgNodes, node));
    }
    
    setShowEditor(false);
    setSelectedNode(null);
  };

  // Handle node deletion
  const handleDeleteNode = (nodeId: string) => {
    // Helper function to filter out the node and its children
    const filterNode = (nodes: OrgChartNode[]): OrgChartNode[] => {
      return nodes
        .filter(node => node.id !== nodeId)
        .map(node => ({
          ...node,
          children: node.children ? filterNode(node.children) : undefined
        }));
    };
    
    setOrgNodes(filterNode(orgNodes));
    setShowEditor(false);
    setSelectedNode(null);
  };

  const handleAddNewNode = () => {
    setSelectedNode(null);
    setIsNewNode(true);
    setShowEditor(true);
  };

  // Get all nodes in a flat array (for the node editor)
  const getAllNodes = (): OrgChartNode[] => {
    const result: OrgChartNode[] = [];
    
    const traverseNodes = (nodes: OrgChartNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children && node.children.length > 0) {
          traverseNodes(node.children);
        }
      });
    };
    
    traverseNodes(orgNodes);
    return result;
  };

  // Add handling for toggling node collapse state
  const toggleNodeCollapse = (nodeId: string) => {
    // Helper function to toggle collapse state for a specific node
    const toggleCollapseInTree = (nodes: OrgChartNode[]): OrgChartNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          // Toggle the collapsed state
          return { ...node, collapsed: !node.collapsed };
        }
        
        // Recursively check children
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: toggleCollapseInTree(node.children)
          };
        }
        
        return node;
      });
    };
    
    setOrgNodes(toggleCollapseInTree(orgNodes));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Organization Chart Editor</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Import Organization Data</h2>
        <CSVImport onImport={handleImport} />
        <div className="mt-2 text-center">
          <a 
            href="/sample.csv" 
            download
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Download Sample CSV Template
          </a>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Organization Chart</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleAddNewNode}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                />
              </svg>
              Add Node
            </button>
            <CSVExport data={flatData} />
          </div>
        </div>
        
        {orgNodes.length > 0 ? (
          <OrgChart data={treeData} onNodeClick={handleNodeClick} />
        ) : (
          <div className="border border-gray-300 rounded-lg p-8 text-center bg-white">
            <p className="text-gray-500">
              No organization data available. Import a CSV file or add nodes manually.
            </p>
          </div>
        )}
      </div>
      
      {showEditor && (
        <NodeEditor
          node={selectedNode}
          allNodes={getAllNodes()}
          onSave={handleSaveNode}
          onCancel={() => setShowEditor(false)}
          onDelete={handleDeleteNode}
          isNew={isNewNode}
        />
      )}
    </div>
  );
}
