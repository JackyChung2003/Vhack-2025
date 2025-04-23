import React from "react";
import { FaTimes, FaCheck, FaBuilding, FaTruck, FaMoneyBillWave, FaBoxOpen, FaFileAlt, FaCamera } from "react-icons/fa";
import { mockOrganizations } from "../../../../utils/mockData";

// Define transaction status type
type TransactionStatus = 'pending' | 'shipping' | 'delivered' | 'completed' | 'rejected';

interface TransactionCardProps {
  transaction: {
    id: number;
    items: Array<{
      id: number;
      name: string;
      quantity: number;
      price: number;
    }>;
    totalPrice: number;
    organizationId: number;
    status: TransactionStatus;
    fundSource: string;
    createdBy: 'charity' | 'vendor';
    date: string;
    quotationId?: number; // Reference to original quotation
    requestId?: number; // Optional reference to original request
    deliveryPhoto?: string; // URL to delivery confirmation photo
  };
  onClose: () => void;
  onMarkAsShipped?: () => void;
  onMarkAsDelivered?: () => void; // New prop for confirming delivery
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  onClose,
  onMarkAsShipped,
  onMarkAsDelivered
}) => {
  const organization = mockOrganizations.find(org => org.id === transaction.organizationId);
  
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[var(--background)] p-6 rounded-lg shadow-xl border border-[var(--card-border)] max-w-md w-full">
        <h2 className="text-2xl font-bold text-[var(--headline)] mb-4">Transaction Details</h2>
        
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <p className="text-[var(--headline)] font-semibold">{organization?.name || 'Unknown Organization'}</p>
            <span className={`text-sm px-2 py-1 rounded-full ${
              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              transaction.status === 'shipping' ? 'bg-indigo-100 text-indigo-800' :
              transaction.status === 'delivered' ? 'bg-teal-100 text-teal-800' :
              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {transaction.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </div>
          <p className="text-sm text-[var(--paragraph)]">Created by: {transaction.createdBy === 'vendor' ? 'You' : organization?.name}</p>
          <p className="text-sm text-[var(--paragraph)]">Date: {transaction.date}</p>
          <p className="text-sm text-[var(--paragraph)]">Fund Source: {transaction.fundSource}</p>
          
          {/* Quotation Reference Info */}
          {transaction.quotationId && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100 flex items-center gap-2">
              <FaFileAlt className="text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-800">From Accepted Quotation #{transaction.quotationId}</p>
                {transaction.requestId && (
                  <p className="text-xs text-blue-600">Original Request: #{transaction.requestId}</p>
                )}
              </div>
            </div>
          )}

          {/* Delivery Photo (if available) */}
          {transaction.deliveryPhoto && transaction.status !== 'pending' && (
            <div className="mt-3">
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
        </div>
        
        {/* Transaction Progress Bar */}
        {transaction.status !== 'rejected' && (
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
        )}
        
        {/* Items List */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-[var(--headline)] mb-2">Items</h3>
          <div className="bg-[var(--card-background)] rounded-lg border border-[var(--stroke)] divide-y divide-[var(--stroke)]">
            {transaction.items.map((item) => (
              <div key={item.id} className="p-3 flex justify-between">
                <div>
                  <p className="text-[var(--headline)]">{item.name}</p>
                  <p className="text-xs text-[var(--paragraph)]">Quantity: {item.quantity}</p>
                </div>
                <p className="text-[var(--headline)]">RM{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="p-3 flex justify-between font-bold">
              <p>Total</p>
              <p>RM{transaction.totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */} 
        <div className="mt-6 flex justify-end space-x-4">
          {/* Show Mark as Shipping button for pending transactions */}
          {transaction.status === 'pending' && onMarkAsShipped && (
            <button
              onClick={onMarkAsShipped}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-all flex items-center gap-2"
            >
              <FaTruck /> Start Shipping
            </button>
          )}

          {/* Show Mark as Delivered button for shipping transactions */}
          {transaction.status === 'shipping' && onMarkAsDelivered && (
            <button
              onClick={onMarkAsDelivered}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition-all flex items-center gap-2"
            >
              <FaCamera /> Confirm Delivery
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