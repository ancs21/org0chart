import { useState, useEffect, useRef } from 'react';
import { OrgChartNode } from '../types';
import { generateId } from '../utils/orgChartUtils';

interface NodeEditorProps {
  node: OrgChartNode | null;
  allNodes: OrgChartNode[];
  onSave: (node: OrgChartNode) => void;
  onCancel: () => void;
  onDelete?: (nodeId: string) => void;
  isNew?: boolean;
}

export default function NodeEditor({ 
  node, 
  allNodes, 
  onSave, 
  onCancel, 
  onDelete,
  isNew = false 
}: NodeEditorProps) {
  const [editedNode, setEditedNode] = useState<OrgChartNode>({
    id: '',
    name: '',
    title: '',
    department: '',
    parentId: null,
    imageUrl: ''
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize form when node changes
  useEffect(() => {
    if (node) {
      // Make sure to explicitly set parentId, even if it's null
      console.log('Initializing editor with node:', node);
      setEditedNode({
        ...node,
        parentId: node.parentId
      });
      
      // Set the search text to the parent name if there is a parent
      if (node.parentId) {
        const parentNode = allNodes.find(n => n.id === node.parentId);
        if (parentNode) {
          setSearchText(parentNode.name);
        }
      } else {
        setSearchText('');
      }
    } else if (isNew) {
      setEditedNode({
        id: generateId(),
        name: '',
        title: '',
        department: '',
        parentId: null,
        imageUrl: ''
      });
      setSearchText('');
    }
  }, [node, isNew, allNodes]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'parentId') {
      console.log('Parent ID changed to:', value === '' ? null : value);
    }
    setEditedNode(prev => ({
      ...prev,
      [name]: value === '' && name === 'parentId' ? null : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedNode);
  };

  // Get all possible parent nodes (excluding self and descendants)
  const getPossibleParents = () => {
    // Simple function to check if nodeId is a descendant of the current node
    const isDescendant = (nodeId: string, parentId: string): boolean => {
      const parent = allNodes.find(n => n.id === parentId);
      if (!parent) return false;
      if (parent.id === nodeId) return true;
      if (parent.children) {
        return parent.children.some(child => isDescendant(nodeId, child.id));
      }
      return false;
    };

    return allNodes.filter(n => {
      // If we're creating a new node, include all nodes
      if (isNew) return true;
      
      // If we're editing an existing node:
      if (node) {
        // Don't include the node itself
        if (n.id === node.id) return false;
        
        // Don't include descendants of the node
        if (isDescendant(n.id, node.id)) return false;
        
        // Always include the current parent of the node
        if (node.parentId === n.id) return true;
        
        // Include all other nodes
        return true;
      }
      
      return true;
    });
  };

  if (!node && !isNew) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isNew ? 'Add New Node' : 'Edit Node'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={editedNode.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={editedNode.title || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={editedNode.department || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              value={editedNode.imageUrl || ''}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {editedNode.imageUrl && (
              <div className="mt-2 flex justify-center">
                <img 
                  src={editedNode.imageUrl} 
                  alt="Profile Preview" 
                  className="h-20 w-20 rounded-full object-cover border border-gray-300"
                  onError={(e) => {
                    // Handle image load error
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a parent..."
                value={
                  editedNode.parentId 
                    ? allNodes.find(n => n.id === editedNode.parentId)?.name || ''
                    : ''
                }
                onChange={(e) => {
                  // This only updates the search text, not the actual parentId
                  setSearchText(e.target.value);
                  setShowDropdown(true);
                }}
                onClick={() => setShowDropdown(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {showDropdown && (
                <div 
                  className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                  ref={dropdownRef}
                >
                  <div 
                    className="cursor-pointer hover:bg-gray-100 py-2 px-3"
                    onClick={() => {
                      handleChange({
                        target: { name: 'parentId', value: '' }
                      } as React.ChangeEvent<HTMLSelectElement>);
                      setShowDropdown(false);
                      setSearchText('');
                    }}
                  >
                    No Parent (Root Node)
                  </div>
                  
                  {getPossibleParents()
                    .filter(parent => 
                      parent.name.toLowerCase().includes(searchText.toLowerCase())
                    )
                    .map(parent => (
                      <div 
                        key={parent.id} 
                        className={`cursor-pointer hover:bg-gray-100 py-2 px-3 ${
                          parent.id === editedNode.parentId ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => {
                          handleChange({
                            target: { name: 'parentId', value: parent.id }
                          } as React.ChangeEvent<HTMLSelectElement>);
                          setShowDropdown(false);
                          setSearchText(parent.name);
                        }}
                      >
                        {parent.name}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <button
                type="button"
                onClick={onCancel}
                className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
            
            {!isNew && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(editedNode.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 