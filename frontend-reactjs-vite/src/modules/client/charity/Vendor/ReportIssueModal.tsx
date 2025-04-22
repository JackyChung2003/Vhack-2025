import React, { useState } from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

interface ReportIssueModalProps {
  transactionId: number;
  vendor: string;
  onClose: () => void;
  onSubmit: (issueDetails: string) => void;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ 
  transactionId, 
  vendor, 
  onClose, 
  onSubmit 
}) => {
  const [issueDetails, setIssueDetails] = useState<string>('');
  const [issueType, setIssueType] = useState<string>('damaged');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (issueDetails.trim()) {
      onSubmit(`Issue Type: ${issueType} - ${issueDetails}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[var(--background)] p-6 rounded-lg shadow-xl border border-[var(--card-border)] max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <h2 className="text-xl font-bold text-[var(--headline)]">Report Delivery Issue</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-[var(--paragraph)]">
            Transaction #{transactionId} with {vendor}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">
              Issue Type
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            >
              <option value="damaged">Damaged Items</option>
              <option value="incomplete">Incomplete Delivery</option>
              <option value="wrong">Wrong Items</option>
              <option value="quality">Quality Issues</option>
              <option value="other">Other Issues</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">
              Issue Details
            </label>
            <textarea
              value={issueDetails}
              onChange={(e) => setIssueDetails(e.target.value)}
              placeholder="Please describe the issue in detail..."
              className="w-full px-3 py-2 border border-[var(--card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] min-h-[120px]"
              required
            />
          </div>
          
          <div className="flex items-center mt-6 justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!issueDetails.trim()}
              className={`px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2 ${
                issueDetails.trim() 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaExclamationTriangle /> Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssueModal; 