// import React from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";
// import { mockCampaigns } from "../../../../utils/mockData";

// const CampaignTransactions: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
  
//   // Find the campaign
//   const campaign = mockCampaigns.find(c => c.id === Number(id));
  
//   // Mock fund allocation data
//   const fundAllocation = {
//     available: 40000, // Funds that haven't been used
//     onHold: 30000,    // Funds on hold for accepted vendor quotations
//     used: 20000,      // Funds already paid to vendors
//     remaining: 10000  // Remaining target amount
//   };

//   // Calculate total funds
//   const totalFunds = fundAllocation.available + fundAllocation.onHold + fundAllocation.used;
//   const totalTarget = totalFunds + fundAllocation.remaining;

//   // Calculate percentages
//   const percentages = {
//     available: (fundAllocation.available / totalTarget) * 100,
//     onHold: (fundAllocation.onHold / totalTarget) * 100,
//     used: (fundAllocation.used / totalTarget) * 100,
//     remaining: (fundAllocation.remaining / totalTarget) * 100
//   };

//   // Mock transactions data
//   const transactions = [
//     {
//       id: 1,
//       date: "2024-03-15",
//       type: "Donation",
//       amount: 5000,
//       status: "completed",
//       description: "Initial campaign funding",
//       donor: "John Doe"
//     },
//     {
//       id: 2,
//       date: "2024-03-20",
//       type: "Vendor Payment",
//       amount: 20000,
//       status: "completed",
//       description: "Payment to Medical Supplies Co.",
//       vendor: "Medical Supplies Co."
//     },
//     {
//       id: 3,
//       date: "2024-03-25",
//       type: "Vendor Quotation",
//       amount: 30000,
//       status: "on-hold",
//       description: "Quotation from Food Distribution Inc.",
//       vendor: "Food Distribution Inc."
//     }
//   ];

//   if (!campaign) {
//     return (
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-red-500">Campaign not found</h1>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       className="p-6 max-w-7xl mx-auto"
//     >
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8">
//         <button
//           onClick={() => navigate(-1)}
//           className="p-2 rounded-full hover:bg-gray-100 transition-colors"
//         >
//           <FaArrowLeft className="text-gray-600" />
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">{campaign.name}</h1>
//           <p className="text-gray-600">Transaction History</p>
//         </div>
//       </div>

//       {/* Fund Allocation Donut Chart */}
//       <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
//         <h2 className="text-lg font-semibold text-gray-800 mb-4">Fund Allocation</h2>
//         <div className="flex items-center justify-center gap-8">
//           {/* Donut Chart */}
//           <div className="relative w-64 h-64">
//             <svg viewBox="0 0 100 100" className="transform -rotate-90">
//               {/* Background circle */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="40"
//                 fill="none"
//                 stroke="#E5E7EB"
//                 strokeWidth="20"
//               />
//               {/* Available Funds (Green) */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="40"
//                 fill="none"
//                 stroke="#10B981"
//                 strokeWidth="20"
//                 strokeDasharray={`${percentages.available} ${100 - percentages.available}`}
//                 strokeDashoffset="0"
//               />
//               {/* On Hold Funds (Yellow) */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="40"
//                 fill="none"
//                 stroke="#F59E0B"
//                 strokeWidth="20"
//                 strokeDasharray={`${percentages.onHold} ${100 - percentages.onHold}`}
//                 strokeDashoffset={`-${percentages.available}`}
//               />
//               {/* Used Funds (Red) */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="40"
//                 fill="none"
//                 stroke="#EF4444"
//                 strokeWidth="20"
//                 strokeDasharray={`${percentages.used} ${100 - percentages.used}`}
//                 strokeDashoffset={`-${percentages.available + percentages.onHold}`}
//               />
//               {/* Remaining Target (Gray) */}
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="40"
//                 fill="none"
//                 stroke="#9CA3AF"
//                 strokeWidth="20"
//                 strokeDasharray={`${percentages.remaining} ${100 - percentages.remaining}`}
//                 strokeDashoffset={`-${percentages.available + percentages.onHold + percentages.used}`}
//               />
//             </svg>
//             <div className="absolute inset-0 flex flex-col items-center justify-center">
//               <span className="text-2xl font-bold text-gray-800">
//                 RM{totalFunds.toLocaleString()}
//               </span>
//               <span className="text-sm text-gray-600">of RM{totalTarget.toLocaleString()}</span>
//             </div>
//           </div>

//           {/* Legend */}
//           <div className="flex flex-col gap-4">
//             <div className="flex items-center gap-3">
//               <div className="w-5 h-5 rounded-full bg-green-500"></div>
//               <div>
//                 <p className="font-medium text-gray-800">Available Funds</p>
//                 <p className="text-sm text-gray-600">
//                   RM{fundAllocation.available.toLocaleString()} ({percentages.available.toFixed(1)}%)
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-5 h-5 rounded-full bg-yellow-500"></div>
//               <div>
//                 <p className="font-medium text-gray-800">On Hold</p>
//                 <p className="text-sm text-gray-600">
//                   RM{fundAllocation.onHold.toLocaleString()} ({percentages.onHold.toFixed(1)}%)
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-5 h-5 rounded-full bg-red-500"></div>
//               <div>
//                 <p className="font-medium text-gray-800">Used Funds</p>
//                 <p className="text-sm text-gray-600">
//                   RM{fundAllocation.used.toLocaleString()} ({percentages.used.toFixed(1)}%)
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-5 h-5 rounded-full bg-gray-400"></div>
//               <div>
//                 <p className="font-medium text-gray-800">Remaining Target</p>
//                 <p className="text-sm text-gray-600">
//                   RM{fundAllocation.remaining.toLocaleString()} ({percentages.remaining.toFixed(1)}%)
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Transactions List */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
//         </div>
//         <div className="divide-y divide-gray-200">
//           {transactions.map((transaction) => (
//             <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-start gap-4">
//                   <div className={`p-2 rounded-full ${
//                     transaction.status === 'completed' ? 'bg-green-100' :
//                     transaction.status === 'on-hold' ? 'bg-yellow-100' :
//                     'bg-red-100'
//                   }`}>
//                     {transaction.status === 'completed' ? (
//                       <FaCheckCircle className="text-green-500" />
//                     ) : transaction.status === 'on-hold' ? (
//                       <FaClock className="text-yellow-500" />
//                     ) : (
//                       <FaTimesCircle className="text-red-500" />
//                     )}
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-800">{transaction.description}</p>
//                     <p className="text-sm text-gray-600">
//                       {transaction.type === 'Donation' ? `Donor: ${transaction.donor}` : `Vendor: ${transaction.vendor}`}
//                     </p>
//                     <p className="text-sm text-gray-500">{transaction.date}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-medium text-gray-800">RM{transaction.amount.toLocaleString()}</p>
//                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                     transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
//                     transaction.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-red-100 text-red-800'
//                   }`}>
//                     {transaction.status === 'completed' ? 'Completed' :
//                      transaction.status === 'on-hold' ? 'On Hold' :
//                      'Failed'}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default CampaignTransactions; 