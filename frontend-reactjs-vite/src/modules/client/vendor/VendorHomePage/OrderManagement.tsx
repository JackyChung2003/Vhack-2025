import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaFilter, FaBuilding, FaTruck, FaMoneyBillWave, FaBoxOpen, FaCamera, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import TransactionCard from "./TransactionCard";
import { charityService } from "../../../../services/supabase/charityService";
import { toast } from "react-toastify";
import supabase from "../../../../services/supabase/supabaseClient";
import { mockOrganizations } from "../../../../utils/mockData"; // Keep for organization data

// Define transaction status type
type TransactionStatus = 'pending' | 'shipping' | 'delivered' | 'completed' | 'rejected';

// Define a Transaction type matching our database structure
type DatabaseTransaction = {
  id: string;
  campaign_id: string | null;
  vendor_id: string;
  vendor_name: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  details: string;
  quotation_id: string;
  request_id: string;
  charity_id: string;
  charity_name?: string;
  campaign_name?: string;
};

// Define the TransactionCard props type that matches what the component expects
type TransactionCardType = {
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
  quotationId?: number;
  requestId?: number;
  deliveryPhoto?: string;
};

const OrderManagement: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionCardType | null>(null);
  const [filter, setFilter] = useState<'all' | TransactionStatus>('all');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<DatabaseTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<number | null>(null);

  // Fetch transactions when component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        console.log("Fetching vendor transactions...");
        
        // Check if the campaign_expenses table exists by making a test query
        try {
          const { count, error: tableError } = await supabase
            .from('campaign_expenses')
            .select('*', { count: 'exact', head: true });
          
          if (tableError) {
            console.error("Error checking campaign_expenses table:", tableError);
            toast.error(`Table error: ${tableError.message}`);
            setLoading(false);
            return;
          }
          
          console.log(`campaign_expenses table exists with ${count} records`);
        } catch (tableCheckError) {
          console.error("Exception checking table:", tableCheckError);
          toast.error("Failed to verify database table: " + 
            (tableCheckError instanceof Error ? tableCheckError.message : String(tableCheckError)));
          setLoading(false);
          return;
        }
        
        // Now try to fetch the transactions
        const data = await charityService.getVendorTransactions();
        console.log("Vendor transaction data received:", data);
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        
        // More detailed error information
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          toast.error(`Failed to load transactions: ${error.message}`);
        } else {
          toast.error('Failed to load transactions: Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  // Transform database transaction to the format expected by TransactionCard component
  const transformTransaction = (tx: DatabaseTransaction): TransactionCardType => {
    // Parse items from details if present
    let items: Array<{id: number; name: string; quantity: number; price: number;}> = [];
    let deliveryPhoto: string | undefined = undefined;
    let parsedDetails: any = {}; // Initialize parsedDetails
    
    try {
      if (tx.details && tx.details !== '{}') {
        // Attempt to parse JSON only if details looks like it might be JSON
        if (tx.details.trim().startsWith('{') && tx.details.trim().endsWith('}')) {
          parsedDetails = JSON.parse(tx.details);
          if (parsedDetails.items && Array.isArray(parsedDetails.items)) {
            items = parsedDetails.items;
          }
          // Extract delivery photo URL if it exists
          if (parsedDetails.deliveryPhoto) {
            deliveryPhoto = parsedDetails.deliveryPhoto;
          }
        } else {
           console.warn(`Transaction details for ID ${tx.id} might not be JSON:`, tx.details);
        }
      }
    } catch (e) {
      console.error(`Error parsing transaction details for ID ${tx.id}:`, e, 'Details:', tx.details);
      // Reset items and deliveryPhoto if parsing fails
      items = []; 
      deliveryPhoto = undefined;
    }

    // If no items were parsed, use a default item based on the description
    if (items.length === 0) {
      items = [{
        id: 1,
        name: tx.description || 'Unlisted items',
        quantity: 1,
        price: tx.amount
      }];
    }

    // Generate a numeric ID by taking the last segment of the UUID
    const numericId = parseInt(tx.id.split('-').pop() || '0', 16);
    
    // Check localStorage for a saved delivery photo if not found in details
    if (!deliveryPhoto) {
      const storedPhoto = localStorage.getItem(`delivery-photo-${numericId}`);
      if (storedPhoto) {
        deliveryPhoto = storedPhoto;
      }
    }
    
    // Find a mock organization ID to match the charity
    let orgId = 1; // Default organization ID
    if (tx.charity_name) {
      const matchingOrg = mockOrganizations.find(
        org => org.name.toLowerCase().includes(tx.charity_name?.toLowerCase() || '')
      );
      if (matchingOrg) {
        orgId = matchingOrg.id;
      }
    }

    return {
      id: numericId,
      items: items,
      totalPrice: tx.amount,
      organizationId: orgId,
      status: tx.status as TransactionStatus,
      fundSource: tx.campaign_name || 'General Fund',
      createdBy: 'charity',
      date: new Date(tx.created_at).toLocaleDateString(),
      quotationId: tx.quotation_id ? parseInt(tx.quotation_id) : undefined,
      requestId: tx.request_id ? parseInt(tx.request_id) : undefined,
      deliveryPhoto: deliveryPhoto
    };
  };

  // Sort transactions by status
  const sortTransactions = (transactions: DatabaseTransaction[]) => {
    const statusOrder: Record<string, number> = { 
      'pending': 0, 
      'shipping': 1, 
      'delivered': 2, 
      'completed': 3,
      'rejected': 4
    };
    
    return [...transactions].sort((a, b) => {
      const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  // Filter transactions based on status
  const filteredTransactions = filter === 'all' 
    ? sortTransactions(transactions)
    : sortTransactions(transactions.filter(t => t.status === filter));

  const handleTransactionClick = (transaction: DatabaseTransaction) => {
    const transformedTransaction = transformTransaction(transaction);
    setSelectedTransaction(transformedTransaction);
  };

  const handleCloseCard = () => {
    setSelectedTransaction(null);
  };

  const handleMarkAsShipped = async () => {
    if (selectedTransaction) {
      try {
        // Get original transaction ID from database transactions
        const originalTx = transactions.find(
          tx => parseInt(tx.id.split('-').pop() || '0', 16) === selectedTransaction.id
        );
        
        if (!originalTx) {
          toast.error("Could not find the original transaction");
          return;
        }
        
        // Update transaction status to shipping
        await charityService.updateTransactionStatus(originalTx.id, 'shipping');
        
        toast.success('Order marked as shipped');
        
        // Update transaction in state
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === originalTx.id 
              ? { ...tx, status: 'shipping' } 
              : tx
          )
        );
        
        // Close the transaction card
        setSelectedTransaction(null);
      } catch (error) {
        console.error('Error updating transaction:', error);
        toast.error('Failed to update transaction status');
      }
    }
  };

  const handleShowDeliveryConfirmation = () => {
    // Save current transaction ID before closing the card
    if (selectedTransaction) {
      setCurrentTransactionId(selectedTransaction.id);
    }
    setShowDeliveryModal(true);
    handleCloseCard();
  };

  const handleDeliveryPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDeliveryPhoto(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!deliveryPhoto) {
      toast.error('Please upload a delivery confirmation photo');
      return;
    }
    
    try {
      // Get original transaction ID from database transactions using currentTransactionId
      const originalTx = transactions.find(
        tx => parseInt(tx.id.split('-').pop() || '0', 16) === currentTransactionId
      );
      
      if (!originalTx) {
        toast.error("Could not find the original transaction");
        return;
      }
      
      // FAKE UPLOAD: Instead of uploading to Supabase, just use the local preview URL
      // This creates an object URL that will persist until page reload
      const fakePhotoUrl = photoPreview || URL.createObjectURL(deliveryPhoto);
      
      // Save to localStorage for persistence between reloads
      localStorage.setItem(`delivery-photo-${currentTransactionId}`, fakePhotoUrl);
      
      // Safely parse existing details
      let existingDetails = {};
      try {
         if (originalTx.details && originalTx.details !== '{}' && originalTx.details.trim().startsWith('{') && originalTx.details.trim().endsWith('}')) {
          existingDetails = JSON.parse(originalTx.details);
        } else if (originalTx.details) {
           console.warn(`Original transaction details for ID ${originalTx.id} might not be JSON:`, originalTx.details);
        }
      } catch(e) {
         console.error(`Error parsing original transaction details for ID ${originalTx.id}:`, e, 'Details:', originalTx.details);
      }

      // Create a fake details object with the photo URL, merging safely
      const detailsObj = {
        ...existingDetails,
        deliveryPhoto: fakePhotoUrl
      };
      
      // Skip actual database update, just update local state
      console.log('FAKE UPLOAD: Would have updated database with:', {
        id: originalTx.id,
        status: 'delivered',
        details: JSON.stringify(detailsObj)
      });
      
      toast.success('Delivery confirmed successfully (DEMO MODE - not saved to database)');
      
      // Update transaction in local state only
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === originalTx.id 
            ? { 
                ...tx, 
                status: 'delivered', 
                details: JSON.stringify(detailsObj) // Ensure details is stringified here
              } 
            : tx
        )
      );
      
      // Reset state and close modal
      setDeliveryPhoto(null);
      setPhotoPreview(null);
      setShowDeliveryModal(false);
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error('Failed to confirm delivery: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Helper function to get the step number for status display
  const getStatusStep = (status: string): number => {
    const stepMap: Record<string, number> = {
      'pending': 0,
      'shipping': 1,
      'delivered': 2,
      'completed': 3,
      'rejected': -1
    };
    return stepMap[status] || 0;
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
        {loading ? (
          <div className="text-center py-8">
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 bg-[var(--card-background)] rounded-lg border border-[var(--card-border)]">
            <FaExclamationTriangle className="mx-auto text-4xl text-yellow-500 mb-2" />
            <p className="font-medium text-[var(--headline)]">No Orders Found</p>
            <p className="text-sm text-[var(--paragraph)]">You don't have any orders from organizations yet.</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
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
                        {transaction.charity_name || 'Unknown Organization'} - {transaction.description}
                      </p>
                    </div>
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
                  <p className="text-sm text-[var(--paragraph)]">
                    Total: RM{transaction.amount.toLocaleString()} | Fund: {transaction.campaign_name || 'General Fund'}
                  </p>
                  <p className="text-xs text-[var(--paragraph)]">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
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
              <div className="border-2 border-dashed border-[var(--stroke)] rounded-lg p-4 flex flex-col items-center justify-center">
                {photoPreview ? (
                  <div className="relative w-full">
                    <img 
                      src={photoPreview} 
                      alt="Delivery preview" 
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <button
                      onClick={() => {
                        setPhotoPreview(null);
                        setDeliveryPhoto(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <FaCamera className="text-4xl text-[var(--stroke)] mb-2" />
                    <p className="text-sm text-[var(--paragraph)] mb-2">Upload a delivery photo</p>
                    <p className="text-xs text-[var(--paragraph)] mb-4">PNG, JPG or JPEG (max. 5MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="delivery-photo"
                      onChange={handleDeliveryPhotoChange}
                    />
                    <label
                      htmlFor="delivery-photo"
                      className="px-4 py-2 bg-[var(--highlight)] text-white rounded-md cursor-pointer hover:bg-opacity-90 transition-all"
                    >
                      Select Photo
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setPhotoPreview(null);
                  setDeliveryPhoto(null);
                }}
                className="px-4 py-2 border border-[var(--stroke)] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelivery}
                disabled={!deliveryPhoto}
                className={`px-4 py-2 rounded-md text-white ${
                  deliveryPhoto 
                    ? 'bg-[var(--highlight)] hover:bg-opacity-90' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderManagement; 