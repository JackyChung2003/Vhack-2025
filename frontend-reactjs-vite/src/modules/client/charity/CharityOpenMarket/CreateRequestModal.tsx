import React, { useState } from 'react';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';

interface CreateRequestModalProps {
  onClose: () => void;
  onSubmit: (request: { title: string; description: string }) => void;
}

const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    if (isValid) {
      onSubmit({ title, description });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--main)] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-[var(--stroke)]">
          <h2 className="text-xl font-bold text-[var(--headline)]">Create New Request</h2>
          <button 
            onClick={onClose}
            className="text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-[var(--headline)] font-medium mb-2">
              Request Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., School Supplies for Education Program"
              className={`w-full p-3 rounded-lg border ${titleError ? 'border-red-500' : 'border-[var(--stroke)]'} focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]`}
            />
            {titleError && <p className="mt-1 text-red-500 text-sm">{titleError}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-[var(--headline)] font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need in detail, including quantities, specifications, and any other relevant information."
              rows={5}
              className={`w-full p-3 rounded-lg border ${descriptionError ? 'border-red-500' : 'border-[var(--stroke)]'} focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]`}
            />
            {descriptionError && <p className="mt-1 text-red-500 text-sm">{descriptionError}</p>}
          </div>
          
          <div className="bg-blue-50 text-blue-800 rounded-lg p-4 mb-6 flex items-start">
            <FaInfoCircle className="flex-shrink-0 mt-1 mr-3" />
            <p className="text-sm">
              Your request will be visible to all approved vendors who can then submit their quotations.
              Be specific about your requirements to receive the most relevant offers.
            </p>
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-medium border border-[var(--stroke)] hover:bg-[var(--background)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-medium bg-[var(--highlight)] text-white hover:bg-opacity-90 transition-colors"
            >
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal; 