import React, { useState } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

interface AddCampaignModalProps {
  onClose: () => void;
}

const AddCampaignModal: React.FC<AddCampaignModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "",
    deadline: "",
    image: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call here to create the campaign
    console.log("Campaign data:", formData);
    alert("Campaign created successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--main)] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[var(--stroke)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--headline)]">Create New Campaign</h2>
          <button 
            onClick={onClose}
            className="text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--headline)] mb-2">Campaign Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--headline)] mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--headline)] mb-2">Funding Goal (USD) *</label>
                <input
                  type="number"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--headline)] mb-2">Deadline *</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--headline)] mb-2">Campaign Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
              />
              <p className="mt-1 text-sm text-[var(--paragraph)]">Recommended size: 1200x630 pixels</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-[var(--stroke)] rounded-lg hover:bg-[var(--background)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--highlight)] text-white rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
            >
              <FaSave /> Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCampaignModal;