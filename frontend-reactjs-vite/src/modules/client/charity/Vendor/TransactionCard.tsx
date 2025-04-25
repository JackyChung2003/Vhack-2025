import React from "react";
import { FaTimes, FaCheck, FaBuilding, FaTruck, FaMoneyBillWave, FaBoxOpen, FaExclamationTriangle } from "react-icons/fa";

// Define transaction status type
type TransactionStatus = 'pending' | 'shipping' | 'delivered' | 'completed' | 'rejected';

interface TransactionCardProps {
  transaction: {
    id: string;
    campaign_id: string | null;
    vendor_id: string;
    vendor_name: string;
    amount: number;
    status: TransactionStatus;
    description: string;
    created_at: string;
    details: string;
    quotation_id: string;
    request_id: string;
    charity_id: string;
    campaign_name?: string;
    items?: Array<{
      id: number;
      name: string;
      quantity: number;
      price: number;
    }>;
    deliveryPhoto?: string; // URL to delivery confirmation photo
  };
  onClose: () => void;
  onConfirmDelivery?: () => void;
  onReleasePayment?: () => void; // New prop to release payment
  onReportIssue?: () => void; // New prop to report delivery issues
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  onClose, 
  onConfirmDelivery,
  onReleasePayment,
  onReportIssue
}) => {
  // Define the steps in the transaction process
  const steps = [
    { status: 'pending', label: 'Order Placed', icon: <FaBoxOpen /> },
    { status: 'shipping', label: 'Shipping', icon: <FaTruck /> },
    { status: 'delivered', label: 'Delivered', icon: <FaCheck /> },
    { status: 'completed', label: 'Payment Released', icon: <FaMoneyBillWave /> }
  ];
  
  // Find the current step index
  const currentStepIndex = steps.findIndex(step => step.status === transaction.status);
  const currentStep = currentStepIndex !== -1 ? currentStepIndex : 
                     (transaction.status === 'rejected' ? -1 : 0);
  
  // Try to parse items from details if they exist
  let items = transaction.items || [];
  if (!items.length && transaction.details) {
    try {
      const parsedDetails = JSON.parse(transaction.details);
      if (parsedDetails.items && Array.isArray(parsedDetails.items)) {
        items = parsedDetails.items;
      }
    } catch (e) {
      console.error('Error parsing transaction details:', e);
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[var(--background)] p-6 rounded-lg shadow-xl border border-[var(--card-border)] max-w-md w-full">
        <h2 className="text-2xl font-bold text-[var(--headline)] mb-4">Transaction Details</h2>
        
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <p className="text-[var(--headline)] font-semibold">{transaction.vendor_name}</p>
            <span className={`text-sm px-2 py-1 rounded-full ${
              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              transaction.status === 'shipping' ? 'bg-indigo-100 text-indigo-800' :
              transaction.status === 'delivered' ? 'bg-teal-100 text-teal-800' :
              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-[var(--paragraph)]">Date: {new Date(transaction.created_at).toLocaleDateString()}</p>
          <p className="text-sm text-[var(--paragraph)]">Fund Source: {transaction.campaign_name || 'General Fund'}</p>
          <p className="text-sm text-[var(--paragraph)]">Description: {transaction.description}</p>
        </div>
        
        {/* Delivery Photo (if available) */}
        {transaction.deliveryPhoto && transaction.status !== 'pending' && (
          <div className="mt-3 mb-4">
            <p className="text-sm font-medium text-[var(--headline)] mb-1">Delivery Confirmation Photo:</p>
            <div className="relative group cursor-pointer">
              <img 
                src={transaction.deliveryPhoto} 
                alt="Delivery confirmation" 
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 rounded-lg">
                <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
                  View Proof
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Transaction Progress Bar */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-[var(--headline)] mb-2">Transaction Progress</h3>
          <div className="relative">
            {/* Progress Bar */}
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[var(--highlight)]" 
                style={{ width: `${Math.max((currentStep / (steps.length - 1)) * 100, 5)}%` }}
              ></div>
            </div>
            
            {/* Steps */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-[var(--highlight)]' : 'text-gray-400'
                  }`}
                  style={{ width: '25%' }}
                >
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mb-1 ${
                    index <= currentStep ? 'bg-[var(--highlight)] text-white' : 'bg-gray-200'
                  }`}>
                    {step.icon}
                  </div>
                  <span className="text-xs text-center">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Items List */}
        {items.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-[var(--headline)] mb-2">Items</h3>
            <div className="bg-[var(--card-background)] rounded-lg border border-[var(--card-border)]">
              {items.map((item, index) => (
                <div key={index} className="p-3 flex justify-between">
                  <div>
                    <p className="text-[var(--headline)]">{item.name}</p>
                    <p className="text-xs text-[var(--paragraph)]">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-[var(--headline)]">RM{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
              <div className="p-3 flex justify-between font-bold">
                <p>Total</p>
                <p>RM{transaction.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-[var(--headline)] mb-2">Total Amount</h3>
            <div className="bg-[var(--card-background)] rounded-lg border border-[var(--card-border)] p-3">
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>RM{transaction.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          {/* Show Confirm Delivery button for shipping transactions */}
          {transaction.status === 'shipping' && onConfirmDelivery && (
            <button
              onClick={onConfirmDelivery}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition-all flex items-center gap-2"
            >
              <FaCheck /> Confirm Delivery
            </button>
          )}

          {/* Show Release Payment button for delivered transactions */}
          {transaction.status === 'delivered' && onReleasePayment && (
            <button
              onClick={onReleasePayment}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all flex items-center gap-2"
            >
              <FaMoneyBillWave /> Release Payment
            </button>
          )}

          {/* Show Report Issue button for delivered transactions */}
          {transaction.status === 'delivered' && onReportIssue && (
            <button
              onClick={onReportIssue}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <FaExclamationTriangle /> Report Issue
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard; 