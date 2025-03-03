import { useRef, useState, useEffect } from 'react';
import React from 'react';
import Tree from 'react-d3-tree';
import { TreeNode, OrgChartNode } from '../types';

// Define types for the react-d3-tree node datum
interface NodeDatum {
  name: string;
  attributes?: {
    id?: string;
    title?: string;
    department?: string;
    imageUrl?: string;
    childCount?: string;
    collapsed?: string;
    [key: string]: string | number | boolean | undefined;
  };
  children?: NodeDatum[];
}

// Custom node renderer
const renderNodeWithCustomEvents = ({
  nodeDatum,
  onNodeClick,
  toggleNode,
  onExplainChildren
}: {
  nodeDatum: NodeDatum;
  onNodeClick: (nodeData: NodeDatum) => void;
  toggleNode: () => void;
  onExplainChildren: (nodeData: NodeDatum) => void;
}) => {
  const childCount = nodeDatum.attributes?.childCount ? parseInt(nodeDatum.attributes.childCount) : 0;
  const isCollapsed = nodeDatum.attributes?.collapsed === 'true';
  const imageUrl = nodeDatum.attributes?.imageUrl || '';
  const isCEO = nodeDatum.attributes?.title?.includes('Chief Executive Officer');
  const isVacant = nodeDatum.name.includes('not filled');
  
  // Determine if the node is an executive level (has "Chief" in the title)
  const isExecutive = nodeDatum.attributes?.title?.includes('Chief');
  
  // Get background color for the header based on role
  const getHeaderBgColor = () => {
    if (isVacant) return '#e5e7eb'; // Light gray for vacant positions
    if (isCEO) return '#86c55c';    // Green for CEO
    if (isExecutive) return '#4a90e2'; // Blue for executives
    return '#6c757d';              // Default gray for other positions
  };
  
  return (
    <g>
      {/* Main node card */}
      <foreignObject
        width={220}
        height={170}
        x={-110}
        y={-85}
        className="node-container"
      >
        <div 
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={() => onNodeClick(nodeDatum)}
        >
          {/* Role icon at top-left corner */}
          <div style={{ 
            position: 'absolute', 
            top: '8px', 
            left: '8px', 
            zIndex: 10,
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
          }}>
            {isCEO ? '👑' : '🔔'}
          </div>
          
          {/* Colored header section */}
          <div style={{ 
            backgroundColor: getHeaderBgColor(),
            color: 'white', 
            textAlign: 'center',
            padding: '2px 0',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {isVacant ? 'Vacant Position' : (isCEO ? 'Leadership' : nodeDatum.attributes?.department || '')}
          </div>
          
          {/* Profile image centered */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '15px',
            position: 'relative'
          }}>
            {imageUrl ? (
              <img 
                src={imageUrl}
                alt={nodeDatum.name}
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
            ) : (
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%',
                backgroundColor: isVacant ? '#e5e7eb' : '#6c757d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                {isVacant ? '?' : nodeDatum.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Name and Title */}
          <div style={{ 
            textAlign: 'center', 
            padding: '10px 10px 0',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '14px',
              color: '#333',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {nodeDatum.name}
            </div>
            
            {nodeDatum.attributes?.title && (
              <div style={{ 
                fontSize: '12px',
                color: '#666',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '2px'
              }}>
                {nodeDatum.attributes.title}
              </div>
            )}
          </div>
          
          {/* Expand/collapse control and child count at bottom */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '5px 0',
            position: 'relative',
            borderTop: '1px solid #f0f0f0',
            marginTop: 'auto',
            minHeight: '28px'
          }}>
            {childCount > 0 && (
              <>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{childCount}</span>
                  <span>{childCount === 1 ? 'Direct Report' : 'Direct Reports'}</span>
                </div>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode();
                  }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {isCollapsed ? '▼' : '▲'}
                </div>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onExplainChildren(nodeDatum);
                  }}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '12px'
                  }}
                  title="Explain Children"
                >
                  ℹ️
                </div>
              </>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

interface OrgChartProps {
  data: TreeNode[];
  onNodeClick: (node: OrgChartNode) => void;
}

export default function OrgChart({ data, onNodeClick }: OrgChartProps) {
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 100, y: 50 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationContent, setExplanationContent] = useState<{title: string, content: string}>({
    title: '',
    content: ''
  });
  const [treeState, setTreeState] = useState<TreeNode[]>([]);
  const [zoom, setZoom] = useState<number>(0.7);

  // Initialize tree state from data with collapsed non-top-level nodes
  useEffect(() => {
    // Deep copy the data
    const processedData = JSON.parse(JSON.stringify(data));
    
    // Collapse all non-top-level nodes
    const collapseNonTopLevel = (nodes: TreeNode[], level: number = 0): TreeNode[] => {
      return nodes.map(node => {
        // Deep copy the node
        const newNode = { ...node };
        
        // For nodes below top level (level > 1), set collapsed to true
        if (level > 0) {
          if (!newNode.attributes) {
            newNode.attributes = {};
          }
          newNode.attributes.collapsed = 'true';
        }
        
        // Process children recursively
        if (newNode.children && newNode.children.length > 0) {
          newNode.children = collapseNonTopLevel(newNode.children, level + 1);
        }
        
        return newNode;
      });
    };
    
    setTreeState(collapseNonTopLevel(processedData));
  }, [data]);

  // Calculate dimensions only (without auto-centering)
  useEffect(() => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [treeState]);

  // Handle window resize (dimensions only, not position)
  useEffect(() => {
    const handleResize = () => {
      if (treeContainerRef.current) {
        const { width, height } = treeContainerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle panning with mouse drag
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only initiate drag if not clicking on a node
    if ((e.target as HTMLElement).closest('.node-container')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setTranslate(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom with buttons
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.3));
  };

  // Handle node click and pass back the original node data
  const handleNodeClick = (nodeData: NodeDatum) => {
    // Find the original node by ID from the tree data
    const findNodeById = (nodes: TreeNode[], id: string): OrgChartNode | null => {
      for (const node of nodes) {
        if (node.attributes?.id === id) {
          return {
            id: node.attributes.id,
            name: node.name,
            title: node.attributes?.title,
            department: node.attributes?.department,
            imageUrl: node.attributes?.imageUrl,
            parentId: null, // We don't have this in the tree format
            collapsed: node.attributes?.collapsed === 'true',
            children: node.children && node.children.length > 0
              ? node.children.map(child => ({
                  id: child.attributes?.id || '',
                  name: child.name,
                  title: child.attributes?.title,
                  department: child.attributes?.department,
                  imageUrl: child.attributes?.imageUrl,
                  parentId: node.attributes?.id || null
                }))
              : []
          };
        }
        
        if (node.children && node.children.length > 0) {
          const found = findNodeById(node.children, id);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    const id = nodeData.attributes?.id;
    if (id) {
      const originalNode = findNodeById(treeState, id);
      if (originalNode) {
        onNodeClick(originalNode);
      }
    }
  };

  // Handle explain children button click
  const handleExplainChildren = (nodeData: NodeDatum) => {
    // Get the children of this node
    const children = nodeData.children || [];
    const childCount = nodeData.attributes?.childCount ? parseInt(nodeData.attributes.childCount) : 0;
    
    if (childCount === 0) {
      setExplanationContent({
        title: `${nodeData.name}'s Team`,
        content: `${nodeData.name} doesn't have any direct reports.`
      });
    } else {
      // Create a summary of the children
      const childrenSummary = children.map(child => {
        const title = child.attributes?.title || 'No title';
        return `${child.name} (${title})`;
      }).join('\n• ');
      
      // Create department grouping if available
      const departmentGroups: Record<string, string[]> = {};
      children.forEach(child => {
        const dept = child.attributes?.department || 'Other';
        if (!departmentGroups[dept]) {
          departmentGroups[dept] = [];
        }
        departmentGroups[dept].push(`${child.name} (${child.attributes?.title || 'No title'})`);
      });
      
      // Format department summary
      let deptSummary = '';
      if (Object.keys(departmentGroups).length > 1) {
        deptSummary = '\n\nTeam by Department:\n';
        Object.entries(departmentGroups).forEach(([dept, members]) => {
          deptSummary += `\n${dept}:\n• ${members.join('\n• ')}`;
        });
      }
      
      setExplanationContent({
        title: `${nodeData.name}'s Team`,
        content: `${nodeData.name} has ${childCount} direct report${childCount > 1 ? 's' : ''}:\n\n• ${childrenSummary}${deptSummary}`
      });
    }
    
    setShowExplanation(true);
  };

  // Prepare the tree data structure
  const treeData = React.useMemo(() => {
    // No data case
    if (!treeState || treeState.length === 0) {
      return null;
    }
    
    // Use all nodes without filtering - remove logic that hides nodes with null parents/children
    const allData = treeState;
    
    // Single root node case
    if (allData.length === 1) {
      return allData[0];
    }
    
    // Multiple root nodes case - create virtual root
    return { 
      name: 'Organization', 
      attributes: { 
        id: 'root',
        childCount: allData.length.toString(),
        collapsed: 'false'
      },
      children: allData 
    };
  }, [treeState]);

  return (
    <div 
      ref={treeContainerRef} 
      className="w-full h-[650px] border border-gray-200 rounded-lg overflow-hidden bg-slate-50 relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        <button
          className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-100"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button
          className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-100"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {dimensions.width > 0 && dimensions.height > 0 && treeData && (
        <Tree
          data={treeData}
          translate={translate}
          orientation="vertical"
          pathFunc="step"
          renderCustomNodeElement={(rd3tProps) => 
            renderNodeWithCustomEvents({
              nodeDatum: rd3tProps.nodeDatum as unknown as NodeDatum,
              onNodeClick: (nodeData: NodeDatum) => handleNodeClick(nodeData),
              toggleNode: rd3tProps.toggleNode,
              onExplainChildren: handleExplainChildren
            })
          }
          separation={{ siblings: 1.1, nonSiblings: 1.5 }}
          zoom={zoom}
          dimensions={{ width: dimensions.width, height: dimensions.height }}
          nodeSize={{ x: 240, y: 220 }}
          pathClassFunc={() => 'org-tree-path'}
          rootNodeClassName="org-tree-root"
          branchNodeClassName="org-tree-branch"
          leafNodeClassName="org-tree-leaf"
          enableLegacyTransitions={false}
        />
      )}
      
      {/* Explanation Modal */}
      {showExplanation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowExplanation(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">{explanationContent.title}</h3>
            <div className="whitespace-pre-line">{explanationContent.content}</div>
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowExplanation(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .org-tree-path {
          stroke: #94a3b8;
          stroke-width: 2;
        }
        .rd3t-link {
          stroke: #94a3b8 !important;
          stroke-width: 2 !important;
        }
        .node-container {
          transition: all 0.3s ease;
        }
        
        /* Improve path appearance */
        .rd3t-link-diagonal path, .rd3t-link-step path {
          fill: none;
        }
      `}</style>
    </div>
  );
} 