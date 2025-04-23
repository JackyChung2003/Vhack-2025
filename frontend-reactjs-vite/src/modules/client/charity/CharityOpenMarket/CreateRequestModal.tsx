import React, { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';
import { charityService, Campaign } from '../../../../services/supabase/charityService';

interface CreateRequestModalProps {
  onClose: () => void;
  onSubmit: (request: { 
    title: string; 
    description: string; 
    deadline?: string;
    fund_type: 'general' | 'campaign';
    campaign_id?: string;
  }) => void;
}

const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [fundType, setFundType] = useState<'general' | 'campaign'>('general');
  const [campaignId, setCampaignId] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [fundTypeError, setFundTypeError] = useState('');
  const [campaignIdError, setCampaignIdError] = useState('');

  // Fetch campaigns for dropdown
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const campaignsData = await charityService.getCharityCampaigns();
        setCampaigns(campaignsData);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

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

    if (!fundType) {
      setFundTypeError('Fund type is required');
      isValid = false;
    } else {
      setFundTypeError('');
    }

    if (fundType === 'campaign' && !campaignId) {
      setCampaignIdError('Campaign selection is required');
      isValid = false;
    } else {
      setCampaignIdError('');
    }
    
    if (isValid) {
      onSubmit({ 
        title, 
        description,
        deadline: deadline || undefined,
        fund_type: fundType,
        campaign_id: fundType === 'campaign' ? campaignId : undefined
      });
    }
  };

  // Format date for min attribute (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-green-500 text-white py-2 px-4">
          <h2 className="text-lg font-bold">Create New Request</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-3">
            <label className="block text-[var(--headline)] text-sm font-medium mb-1">
              Request Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., School Supplies for Education Program"
              className={`w-full p-2 text-sm rounded-lg border ${titleError ? 'border-red-500' : 'border-[var(--stroke)]'} focus:outline-none focus:ring-1 focus:ring-green-500`}
            />
            {titleError && <p className="mt-1 text-red-500 text-xs">{titleError}</p>}
          </div>
          
          <div className="mb-3">
            <label className="block text-[var(--headline)] text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need in detail..."
              rows={3}
              className={`w-full p-2 text-sm rounded-lg border ${descriptionError ? 'border-red-500' : 'border-[var(--stroke)]'} focus:outline-none focus:ring-1 focus:ring-green-500`}
            />
            {descriptionError && <p className="mt-1 text-red-500 text-xs">{descriptionError}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-[var(--headline)] text-sm font-medium mb-1">
              Deadline
            </label>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaCalendarAlt size={14} />
              </div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today}
                className={`w-full p-2 pl-8 text-sm rounded-lg border border-[var(--stroke)] focus:outline-none focus:ring-1 focus:ring-green-500`}
              />
            </div>
            <p className="mt-0.5 text-gray-500 text-xs">If not specified, defaults to 30 days from today</p>
          </div>
          
          <div className="mb-3">
            <label className="block text-[var(--headline)] text-sm font-medium mb-1">
              Fund Source
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="fundType"
                  checked={fundType === 'general'}
                  onChange={() => setFundType('general')}
                  className="w-3.5 h-3.5 text-green-500 focus:ring-green-500"
                />
                <span>General Fund</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="fundType"
                  checked={fundType === 'campaign'}
                  onChange={() => setFundType('campaign')}
                  className="w-3.5 h-3.5 text-green-500 focus:ring-green-500"
                />
                <span>Campaign Fund</span>
              </label>
            </div>
            {fundTypeError && <p className="mt-1 text-red-500 text-xs">{fundTypeError}</p>}
          </div>
          
          {fundType === 'campaign' && (
            <div className="mb-3">
              <label className="block text-[var(--headline)] text-sm font-medium mb-1">
                Select Campaign
              </label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className={`w-full p-2 text-sm rounded-lg border ${campaignIdError ? 'border-red-500' : 'border-[var(--stroke)]'} focus:outline-none focus:ring-1 focus:ring-green-500`}
                disabled={loading}
              >
                <option value="">Select a campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
              {campaignIdError && <p className="mt-1 text-red-500 text-xs">{campaignIdError}</p>}
              {loading && <p className="mt-0.5 text-gray-500 text-xs">Loading campaigns...</p>}
            </div>
          )}
          
          <div className="bg-blue-50 text-blue-800 rounded-lg p-2 mb-3 flex items-start text-xs">
            <FaInfoCircle className="flex-shrink-0 mt-1 mr-2" />
            <p>
              Your request will be visible to all approved vendors who can then submit their quotations.
              Be specific about your requirements.
            </p>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm rounded-lg font-medium border border-[var(--stroke)] hover:bg-[var(--background)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
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