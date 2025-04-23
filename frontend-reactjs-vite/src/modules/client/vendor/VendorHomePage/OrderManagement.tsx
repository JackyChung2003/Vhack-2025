import React, { useState } from "react";
import { FaCheckCircle, FaFilter, FaBuilding, FaTruck, FaMoneyBillWave, FaBoxOpen, FaCamera } from "react-icons/fa";
import TransactionCard from "./TransactionCard";
import { mockOrganizations } from "../../../../utils/mockData";

// Define transaction status type
type TransactionStatus = 'pending' | 'shipping' | 'delivered' | 'completed' | 'rejected';

// Define a Transaction type
type Transaction = {
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
  deliveryPhoto?: string; // URL to delivery confirmation photo
};

const OrderManagement: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | TransactionStatus>('all');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Mock data for transactions with updated statuses
  const transactions: Transaction[] = [
    {
      id: 1,
      items: [
        { id: 1, name: "Water Filter X200", quantity: 100, price: 50 }
      ],
      totalPrice: 5000,
      organizationId: 1, // Global Relief
      status: 'completed',
      fundSource: "Clean Water Initiative",
      createdBy: 'charity',
      date: "2023-05-15",
      quotationId: 101 // Reference to original quotation
    },
    {
      id: 2,
      items: [
        { id: 2, name: "Water Filters", quantity: 100, price: 5 },
        { id: 3, name: "Water Testing Kits", quantity: 50, price: 10 }
      ],
      totalPrice: 1000,
      organizationId: 1, // Global Relief
      status: 'pending',
      fundSource: "Clean Water Initiative",
      createdBy: 'charity',
      date: "2023-05-15",
      quotationId: 102
    },
    {
      id: 3,
      items: [
        { id: 4, name: "School Supplies Kit", quantity: 200, price: 6 }
      ],
      totalPrice: 1200,
      organizationId: 2, // EduCare
      status: 'pending',
      fundSource: "Education for All",
      createdBy: 'vendor',
      date: "2023-05-10",
      quotationId: 103
    },
    {
      id: 4,
      items: [
        { id: 5, name: "Medical Kits", quantity: 80, price: 10 }
      ],
      totalPrice: 800,
      organizationId: 4, // Health Alliance
      status: 'shipping',
      fundSource: "General Fund",
      createdBy: 'charity',
      date: "2023-04-28",
      quotationId: 104
    },
    {
      id: 5,
      items: [
        { id: 6, name: "Food Packages", quantity: 150, price: 10 }
      ],
      totalPrice: 1500,
      organizationId: 3, // Nature First
      status: 'shipping',
      fundSource: "Hunger Relief",
      createdBy: 'vendor',
      date: "2023-04-20",
      quotationId: 105
    },
    {
      id: 6,
      items: [
        { id: 7, name: "Hygiene Kits", quantity: 120, price: 8 }
      ],
      totalPrice: 960,
      organizationId: 1, // Global Relief
      status: 'delivered',
      fundSource: "Emergency Response",
      createdBy: 'charity',
      date: "2023-04-15",
      quotationId: 106,
      deliveryPhoto: "https://placehold.co/600x400?text=Delivery+Photo"
    },
    {
      id: 7,
      items: [
        { id: 8, name: "Tent Supplies", quantity: 20, price: 150 }
      ],
      totalPrice: 3000,
      organizationId: 1, // Global Relief
      status: 'rejected',
      fundSource: "Shelter Project",
      createdBy: 'charity',
      date: "2023-04-10",
      quotationId: 107
    }
  ];

  // Sort transactions by status
  const sortTransactions = (transactions: Transaction[]) => {
    const statusOrder: Record<TransactionStatus, number> = { 
      'pending': 0, 
      'shipping': 1, 
      'delivered': 2, 
      'completed': 3,
      'rejected': 4
    };
    
    return [...transactions].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  // Filter transactions based on status
  const filteredTransactions = filter === 'all' 
    ? sortTransactions(transactions)
    : sortTransactions(transactions.filter(t => t.status === filter));

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseCard = () => {
    setSelectedTransaction(null);
  };

  const handleMarkAsShipped = () => {
    if (selectedTransaction) {
      console.log(`Started shipping for transaction ID: ${selectedTransaction.id}`);
      // Update the transaction status locally (in real app, call API)
      const updatedTransaction = {
        ...selectedTransaction,
        status: 'shipping' as TransactionStatus
      };
      setSelectedTransaction(updatedTransaction);
      
      console.log("Order marked as shipping. Waiting for delivery confirmation.");
    }
  };

  // Open the delivery confirmation modal
  const handleShowDeliveryConfirmation = () => {
    setShowDeliveryModal(true);
  };

  // Handle photo file selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDeliveryPhoto(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mark as delivered with photo proof
  const handleMarkAsDelivered = () => {
    if (selectedTransaction && deliveryPhoto) {
      console.log(`Marked as delivered transaction ID: ${selectedTransaction.id} with photo proof`);
      
      // In a real app, you would upload the photo to a server and get a URL back
      const photoUrl = URL.createObjectURL(deliveryPhoto); // For demo purposes
      
      // Update the transaction status locally (in real app, call API)
      const updatedTransaction = {
        ...selectedTransaction,
        status: 'delivered' as TransactionStatus,
        deliveryPhoto: photoUrl
      };
      
      setSelectedTransaction(updatedTransaction);
      setShowDeliveryModal(false);
      setDeliveryPhoto(null);
      setPhotoPreview(null);
      
      console.log("Order marked as delivered with photo proof. Waiting for payment release.");
    }
  };

  // Get status icon based on transaction status
  const getStatusIcon = (status: TransactionStatus) => {
    switch(status) {
      case 'pending':
        return <FaBoxOpen className="w-5 h-5 text-yellow-500" />;
      case 'shipping':
        return <FaTruck className="w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <FaCheckCircle className="w-5 h-5 text-teal-500" />;
      case 'completed':
        return <FaMoneyBillWave className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <FaCheckCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FaCheckCircle className="w-5 h-5 opacity-30 text-gray-400" />;
    }
  };

  // Function to get progress percentage based on status
  const getProgressPercentage = (status: TransactionStatus) => {
    switch(status) {
      case 'pending': return 10;
      case 'shipping': return 40;
      case 'delivered': return 70;
      case 'completed': return 100;
      case 'rejected': return 0;
      default: return 0;
    }
  };

  // Function to get step value based on status
  const getStepValue = (status: TransactionStatus): number => {
    const stepMap: Record<TransactionStatus, number> = {
      'pending': 0,
      'shipping': 1,
      'delivered': 2,
      'completed': 3,
      'rejected': -1
    };
    return stepMap[status];
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--headline)]">Organization Orders</h2>
        <div className="relative"> 
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | TransactionStatus)}
            className="pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--stroke)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending Shipment</option>
            <option value="shipping">Shipping</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => {
            const organization = mockOrganizations.find(org => org.id === transaction.organizationId);
            return (
              <div
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)}
                className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] cursor-pointer hover:bg-[var(--background)] transition-all"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-[var(--highlight)]" />
                        <p className={`text-[var(--headline)] font-semibold ${
                          transaction.status === 'completed' ? 'line-through' : ''
                        }`}>
                          {organization?.name || 'Unknown Organization'} - {transaction.items.length} item(s)
                        </p>
                      </div>
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
                    <p className="text-sm text-[var(--paragraph)]">
                      Total: RM{transaction.totalPrice.toLocaleString()} | Fund: {transaction.fundSource}
                    </p>
                    <p className="text-sm text-[var(--paragraph)]">
                      Created by: {transaction.createdBy === 'vendor' ? 'You' : organization?.name} | Date: {transaction.date}
                    </p>
                    <p className="text-sm text-[var(--paragraph)]">
                      Quotation ID: {transaction.quotationId || 'N/A'}
                    </p>
                    
                    {/* Compact step indicators */}
                    <div className="flex mt-3 space-x-1">
                      {['pending', 'shipping', 'delivered', 'completed'].map((step, index) => {
                        if (transaction.status === 'rejected') return null;

                        const currentStepValue = getStepValue(transaction.status);
                        const isActive = currentStepValue >= index;
                        const isCurrentStep = currentStepValue === index;
                        
                        return (
                          <div 
                            key={index}
                            className={`h-1.5 flex-1 rounded-full ${
                              isActive ? 
                                (isCurrentStep ? 'bg-[var(--highlight)]' : 'bg-[var(--highlight)] bg-opacity-60') : 
                                'bg-gray-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Status icon */}
                  <div className="ml-4">
                    {getStatusIcon(transaction.status)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            No orders found matching the filter.
          </div>
        )}
      </div>

      {/* Transaction Card Modal */}
      {selectedTransaction && (
        <TransactionCard
          transaction={selectedTransaction}
          onClose={handleCloseCard}
          onMarkAsShipped={selectedTransaction.status === 'pending' ? handleMarkAsShipped : undefined}
          onMarkAsDelivered={selectedTransaction.status === 'shipping' ? handleShowDeliveryConfirmation : undefined}
        />
      )}

      {/* Delivery Confirmation Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[var(--background)] p-6 rounded-lg shadow-xl border border-[var(--card-border)] max-w-md w-full">
            <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Confirm Delivery</h2>
            <p className="text-sm text-[var(--paragraph)] mb-4">
              Please upload a photo as proof of delivery to the organization.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--headline)] mb-2">
                Delivery Photo
              </label>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="delivery-photo"
                  onChange={handlePhotoChange}
                />
                <label htmlFor="delivery-photo" className="cursor-pointer w-full">
                  {photoPreview ? (
                    <div className="relative">
                      <img 
                        src={photoPreview} 
                        alt="Delivery preview" 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white font-medium rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                        Click to change
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <FaCamera className="text-[var(--highlight)] text-4xl mb-2" />
                      <p className="text-sm text-center text-[var(--paragraph)]">
                        Click to select a photo
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliveryPhoto(null);
                  setPhotoPreview(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsDelivered}
                disabled={!deliveryPhoto}
                className={`px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2 ${
                  deliveryPhoto
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaCheckCircle /> Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderManagement; 