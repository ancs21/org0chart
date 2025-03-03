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
  toggleNode
}: {
  nodeDatum: NodeDatum;
  onNodeClick: (nodeData: NodeDatum) => void;
  toggleNode: () => void;
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
        height={140}
        x={-110}
        y={-70}
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
            marginTop: '10px',
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
            padding: '8px 10px 0',
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
            marginTop: 'auto'
          }}>
            {childCount > 0 && (
              <>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {childCount}
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
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Calculate dimensions and initial position
  useEffect(() => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: height / 6 });
    }
  }, [data]); // Recalculate when data changes

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (treeContainerRef.current) {
        const { width, height } = treeContainerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        setTranslate({ x: width / 2, y: height / 6 });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      const originalNode = findNodeById(data, id);
      if (originalNode) {
        onNodeClick(originalNode);
      }
    }
  };

  // Prepare the tree data structure
  const treeData = React.useMemo(() => {
    // No data case
    if (!data || data.length === 0) {
      return null;
    }
    
    // Filter out any remaining isolated nodes at this level
    const filteredData = data.filter(node => {
      // Keep nodes that have children or attributes that mark them as non-isolated
      return node.children || 
             (node.attributes?.childCount && parseInt(node.attributes.childCount) > 0) ||
             (node.attributes?.id === 'root');
    });
    
    // If after filtering we have no data, return null
    if (filteredData.length === 0) {
      return null;
    }
    
    // Single root node case
    if (filteredData.length === 1) {
      return filteredData[0];
    }
    
    // Multiple root nodes case - create virtual root
    return { 
      name: 'Organization', 
      attributes: { 
        id: 'root',
        childCount: filteredData.length.toString(),
        collapsed: 'false'
      },
      children: filteredData 
    };
  }, [data]);

  return (
    <div 
      ref={treeContainerRef} 
      className="w-full h-[650px] border border-gray-200 rounded-lg overflow-hidden bg-slate-50"
    >
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
              toggleNode: rd3tProps.toggleNode
            })
          }
          separation={{ siblings: 1.1, nonSiblings: 1.5 }}
          zoom={0.7}
          dimensions={{ width: dimensions.width, height: dimensions.height }}
          nodeSize={{ x: 240, y: 180 }}
          pathClassFunc={() => 'org-tree-path'}
          rootNodeClassName="org-tree-root"
          branchNodeClassName="org-tree-branch"
          leafNodeClassName="org-tree-leaf"
        />
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