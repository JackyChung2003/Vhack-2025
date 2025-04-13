import React, { useState } from "react";
import { 
  FaMoneyBillWave, 
  FaTags, 
  FaCalendarAlt, 
  FaTimes, 
  FaPlus,
  FaCreditCard,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaBuilding,
  FaHandHoldingHeart,
  FaExternalLinkAlt,
  FaRegCreditCard
} from "react-icons/fa";
import { mockDonorAutoDonations } from "../../../../utils/mockData";
import { useNavigate } from "react-router-dom";

// Define auto donation setup modal component
const AutoDonationSetupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: (amount: number, frequency: string, categories: string[]) => void;
}> = ({ isOpen, onClose, onSetupComplete }) => {
  const [amount, setAmount] = useState<number>(25);
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly'>('monthly');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const campaignCategories = [
    "Health & Medical",
    "Education",
    "Environment",
    "Disaster Relief",
    "Poverty & Hunger",
    "Animal Welfare",
    "Human Rights",
    "Community Development"
  ];

  const handleSubmit = () => {
    if (amount > 0 && selectedCategories.length > 0) {
      onSetupComplete(amount, frequency, selectedCategories);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--main)] rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[var(--stroke)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--headline)]">
            Setup Auto Donation
          </h2>
          <button 
            onClick={onClose}
            className="text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount selection */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--headline)] mb-3">Donation Amount</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[var(--paragraph)]">RM</span>
              </div>
              <input
                type="number"
                min="1"
                className="w-full pl-8 pr-4 py-3 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
          
          {/* Frequency selection */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--headline)] mb-3">Donation Frequency</h3>
            <div className="flex rounded-lg overflow-hidden border border-[var(--stroke)]">
              <button
                className={`flex-1 py-3 px-4 ${frequency === 'monthly' ? 'bg-[var(--highlight)] text-white' : 'bg-[var(--background)]'}`}
                onClick={() => setFrequency('monthly')}
              >
                Monthly
              </button>
              <button
                className={`flex-1 py-3 px-4 ${frequency === 'quarterly' ? 'bg-[var(--highlight)] text-white' : 'bg-[var(--background)]'}`}
                onClick={() => setFrequency('quarterly')}
              >
                Quarterly
              </button>
            </div>
          </div>
          
          {/* Category selection */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--headline)] mb-3 flex items-center gap-2">
              <FaTags className="text-[var(--highlight)]" />
              Select Categories to Support
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {campaignCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategories(prev => 
                      prev.includes(category)
                        ? prev.filter(cat => cat !== category)
                        : [...prev, category]
                    );
                  }}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 ${
                    selectedCategories.includes(category)
                      ? 'bg-[var(--highlight)] text-white'
                      : 'bg-gray-100 text-[var(--paragraph)] hover:bg-gray-200'
                  }`}
                >
                  {category}
                  {selectedCategories.includes(category) && (
                    <FaTimes size={10} className="ml-1" />
                  )}
                </button>
              ))}
            </div>
            <div className="text-sm text-[var(--paragraph)] flex items-center gap-1">
              <FaInfoCircle className="text-[var(--highlight)]" />
              Select at least one category to continue
            </div>
          </div>
          
          {/* Information about auto donations */}
          <div className="bg-[var(--background)] p-4 rounded-lg text-sm text-[var(--paragraph)]">
            <p className="mb-2">
              <strong>How it works:</strong> We'll distribute your donation among verified campaigns in your selected categories.
            </p>
            <p>
              You can cancel your auto donation at any time. You'll receive monthly reports on how your donation was distributed.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-[var(--stroke)] flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={amount <= 0 || selectedCategories.length === 0}
            className={`px-4 py-2 rounded-lg bg-[var(--highlight)] text-white flex items-center gap-2 ${
              amount <= 0 || selectedCategories.length === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-opacity-90'
            }`}
          >
            <FaCreditCard />
            Setup Auto Donation
          </button>
        </div>
      </div>
    </div>
  );
};

// Component to display distribution details
const DistributionDetails: React.FC<{
  distribution: {
    date: string;
    recipients: {
      id: number;
      name: string;
      type: 'campaign' | 'organization';
      amount: number;
      category?: string;
    }[];
  };
}> = ({ distribution }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const totalAmount = distribution.recipients.reduce((sum, recipient) => sum + recipient.amount, 0);
  
  const handleRecipientClick = (recipient: {
    id: number;
    type: 'campaign' | 'organization';
  }) => {
    if (recipient.type === 'campaign') {
      navigate(`/charity/${recipient.id}`);
    } else {
      navigate(`/charity/organization/${recipient.id}`);
    }
  };

  return (
    <div className="border border-[var(--stroke)] rounded-lg overflow-hidden mb-3">
      <div 
        className="p-4 bg-[var(--background)] flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <div className="font-medium text-[var(--headline)]">
            Distribution on {new Date(distribution.date).toLocaleDateString()}
          </div>
          <div className="text-sm text-[var(--paragraph)]">
            RM{totalAmount} distributed to {distribution.recipients.length} recipient{distribution.recipients.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button className="text-[var(--paragraph)] hover:text-[var(--headline)]">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="space-y-3">
            {distribution.recipients.map((recipient, index) => (
              <div 
                key={index} 
                className="p-3 border border-[var(--stroke)] rounded-lg hover:bg-[var(--background)] transition-colors cursor-pointer"
                onClick={() => handleRecipientClick(recipient)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {recipient.type === 'campaign' ? (
                      <FaHandHoldingHeart className="text-[var(--highlight)]" />
                    ) : (
                      <FaBuilding className="text-[var(--secondary)]" />
                    )}
                    <span className="font-medium text-[var(--headline)]">
                      {recipient.name}
                    </span>
                  </div>
                  <span className="font-semibold text-[var(--highlight)]">RM{recipient.amount}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[var(--paragraph)]">
                  <div>
                    {recipient.type === 'campaign' ? 'Campaign' : 'Organization'}
                    {recipient.category && ` • ${recipient.category}`}
                  </div>
                  <div className="flex items-center gap-1 text-[var(--highlight)] hover:underline">
                    <FaExternalLinkAlt size={10} />
                    View Details
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AutoDonation: React.FC = () => {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // In a real app, this would come from an API or context
  const autoDonations = mockDonorAutoDonations;
  
  const handleSetupComplete = (amount: number, frequency: string, categories: string[]) => {
    console.log(`Auto donation setup: RM${amount} ${frequency} to categories:`, categories);
    // In a real app, this would call an API to set up the auto donation
    // For now, we'll just log it
  };
  
  const handleCancelAutoDonation = (id: number) => {
    console.log(`Cancelling auto donation with ID: ${id}`);
    // In a real app, this would call an API to cancel the auto donation
  };

  const handleViewRecipient = (recipient: {
    id: number;
    type: 'campaign' | 'organization';
  }) => {
    if (recipient.type === 'campaign') {
      navigate(`/charity/${recipient.id}`);
    } else {
      navigate(`/charity/organization/${recipient.id}`);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--headline)]">Auto Donations</h2>
          <p className="text-[var(--paragraph)]">
            Manage all your recurring donations in one place.
          </p>
        </div>
        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <FaPlus />
          Setup Auto Donation
        </button>
      </div>
      
      {/* Active auto donations */}
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden mb-8">
        <div className="p-6 border-b border-[var(--stroke)]">
          <h3 className="text-lg font-bold text-[var(--headline)] flex items-center gap-2">
            <FaMoneyBillWave className="text-[var(--highlight)]" />
            Your Active Recurring Donations
          </h3>
        </div>
        
        {autoDonations.length > 0 ? (
          <div className="divide-y divide-[var(--stroke)]">
            {autoDonations.map((donation) => (
              <div key={donation.id} className="p-6 hover:bg-[var(--background)] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-[var(--headline)]">
                        RM{donation.amount} {donation.frequency}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        donation.donationType === 'direct' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {donation.donationType === 'direct' ? 'Direct Donation' : 'Category-Based'}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--paragraph)] flex items-center gap-2 mt-1">
                      <FaCalendarAlt />
                      Started on {new Date(donation.startDate).toLocaleDateString()}
                      {donation.nextDonationDate && (
                        <span className="ml-2">
                          • Next donation on {new Date(donation.nextDonationDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelAutoDonation(donation.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
                
                {/* For category-based donations, show categories */}
                {donation.donationType === 'category-based' && donation.categories && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-[var(--headline)] mb-2">Supporting categories:</div>
                    <div className="flex flex-wrap gap-1">
                      {donation.categories.map((category) => (
                        <span 
                          key={category}
                          className="px-2 py-1 bg-[var(--highlight)] bg-opacity-10 rounded-full text-xs font-semibold text-[var(--headline)]"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* For direct donations, show the recipient */}
                {donation.donationType === 'direct' && donation.directRecipient && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-[var(--headline)] mb-2">Supporting:</div>
                    <div 
                      className="p-3 border border-[var(--stroke)] rounded-lg hover:bg-[var(--background)] transition-colors cursor-pointer"
                      onClick={() => handleViewRecipient(donation.directRecipient!)}
                    >
                      <div className="flex items-center gap-2">
                        {donation.directRecipient.type === 'campaign' ? (
                          <FaHandHoldingHeart className="text-[var(--highlight)]" />
                        ) : (
                          <FaBuilding className="text-[var(--secondary)]" />
                        )}
                        <span className="font-medium text-[var(--headline)]">
                          {donation.directRecipient.name}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--paragraph)] mt-1">
                        {donation.directRecipient.type === 'campaign' ? 'Campaign' : 'Organization'}
                        {donation.directRecipient.category && ` • ${donation.directRecipient.category}`}
                      </div>
                    </div>
                  </div>
                )}
                
                {donation.distributions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--stroke)]">
                    <div className="text-sm font-medium text-[var(--headline)] mb-3">Distribution history:</div>
                    <div>
                      {donation.distributions.map((distribution, index) => (
                        <DistributionDetails key={index} distribution={distribution} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <FaMoneyBillWave className="mx-auto text-4xl text-[var(--paragraph)] opacity-30 mb-4" />
            <p className="text-lg font-medium text-[var(--headline)]">No active recurring donations</p>
            <p className="text-[var(--paragraph)]">Set up a recurring donation to support causes you care about.</p>
          </div>
        )}
      </div>
      
      {/* How it works section */}
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
        <div className="p-6 border-b border-[var(--stroke)]">
          <h3 className="text-lg font-bold text-[var(--headline)]">How Recurring Donations Work</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--background)] p-5 rounded-lg">
              <div className="w-10 h-10 bg-[var(--highlight)] bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                <FaMoneyBillWave className="text-[var(--highlight)]" />
              </div>
              <h4 className="font-semibold text-[var(--headline)] mb-2">Two ways to donate</h4>
              <p className="text-sm text-[var(--paragraph)]">
                Set up category-based auto donations or monthly donations to specific campaigns/organizations.
              </p>
            </div>
            
            <div className="bg-[var(--background)] p-5 rounded-lg">
              <div className="w-10 h-10 bg-[var(--highlight)] bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                <FaRegCreditCard className="text-[var(--highlight)]" />
              </div>
              <h4 className="font-semibold text-[var(--headline)] mb-2">Automatic processing</h4>
              <p className="text-sm text-[var(--paragraph)]">
                Your donations are processed automatically on the same date each month or quarter.
              </p>
            </div>
            
            <div className="bg-[var(--background)] p-5 rounded-lg">
              <div className="w-10 h-10 bg-[var(--highlight)] bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                <FaCalendarAlt className="text-[var(--highlight)]" />
              </div>
              <h4 className="font-semibold text-[var(--headline)] mb-2">Manage in one place</h4>
              <p className="text-sm text-[var(--paragraph)]">
                View and cancel all your recurring donations from this dashboard at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auto donation setup modal */}
      <AutoDonationSetupModal 
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSetupComplete={handleSetupComplete}
      />
    </div>
  );
};

export default AutoDonation; 