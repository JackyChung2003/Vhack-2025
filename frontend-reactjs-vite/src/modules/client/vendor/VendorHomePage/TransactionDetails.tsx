import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionCard from '../../charity/Vendor/TransactionCard';

// Define transaction status type
type TransactionStatus = 'pending' | 'shipping' | 'delivered' | 'completed' | 'rejected';

// Define transaction type
interface Transaction {
  id: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  vendor: string;
  status: TransactionStatus;
  fundSource: string;
  createdBy: 'charity' | 'vendor';
  date: string;
  deliveryPhoto?: string;
}

const TransactionDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Mock transaction data based on the order ID
  const [transaction, setTransaction] = useState<Transaction>({
    id: parseInt(orderId?.replace("PO-2023-00", "") || "0"),
    items: [
      {
        id: 1,
        name: orderId === "PO-2023-001" ? "100x Water Filters" : "200x School Supplies Kit",
        quantity: orderId === "PO-2023-001" ? 100 : 200,
        price: orderId === "PO-2023-001" ? 5 : 6,
      },
      ...(orderId === "PO-2023-001" ? [
        {
          id: 2,
          name: "50x Water Testing Kits",
          quantity: 50,
          price: 10,
        }
      ] : []),
    ],
    totalPrice: orderId === "PO-2023-001" ? 1000 : 1200,
    vendor: orderId === "PO-2023-001" ? "Global Relief Fund" : "EduCare Foundation",
    status: 'pending',
    fundSource: "Campaign Funds",
    createdBy: 'charity',
    date: orderId === "PO-2023-001" ? "2023-05-15" : "2023-05-18",
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [orderId]);

  const handleClose = () => {
    navigate('/vendor/dashboard');
  };

  const handleConfirmDelivery = () => {
    setTransaction(prev => ({ ...prev, status: 'delivered' }));
  };

  const handleReleasePayment = () => {
    setTransaction(prev => ({ ...prev, status: 'completed' }));
  };

  const handleReportIssue = () => {
    alert("Issue reported. Our support team will contact you shortly.");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--highlight)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <TransactionCard
        transaction={transaction}
        onClose={handleClose}
        onConfirmDelivery={handleConfirmDelivery}
        onReleasePayment={handleReleasePayment}
        onReportIssue={handleReportIssue}
      />
    </div>
  );
};

export default TransactionDetails; 