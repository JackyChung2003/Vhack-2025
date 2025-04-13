import React from "react";

const OrderRequest: React.FC = () => {
  const requests = [
    { id: 1, name: "Milo", charity: "Global Relief Organization" },
    { id: 2, name: "Mineral Water", charity: "Helping Hands Foundation" },
    { id: 3, name: "Rice Bags", charity: "Food for All Initiative" },
    { id: 4, name: "Cooking Oil", charity: "Charity Aid Network" },
    { id: 5, name: "Sugar", charity: "Hope Foundation" },
  ];

  const handleApprove = (id: number) => {
    console.log(`Approved request ID: ${id}`);
  };

  const handleReject = (id: number) => {
    console.log(`Rejected request ID: ${id}`);
  };

  return (
    <ul className="space-y-4">
      {requests.map((request) => (
        <li
          key={request.id}
          className="flex justify-between items-center bg-[var(--card-background)] p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <div>
            <p className="font-semibold text-[var(--headline)]">{request.name}</p>
            <p className="text-sm text-[var(--paragraph)]">Charity: {request.charity}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => handleApprove(request.id)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(request.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all"
            >
              Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default OrderRequest;