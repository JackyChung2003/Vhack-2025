import React from "react";

interface WithdrawalRequest {
  id: number;
  name: string;
  goal: number;
  currentContributions: number;
  deadline: string;
}

interface WithdrawalProps {
  withdrawalRequests: WithdrawalRequest[];
}

const Withdrawal: React.FC<WithdrawalProps> = ({ withdrawalRequests }) => {
  const handleWithdraw = (id: number) => {
    console.log(`Withdraw action triggered for request ID: ${id}`);
    // Add your withdrawal logic here
  };

  return (
    <div
      className="bg-[var(--main)] p-6 rounded-lg shadow-xl border border-[var(--stroke)] transition-all transform hover:translate-y-[-8px] hover:shadow-2xl cursor-pointer overflow-hidden"
      style={{ position: "relative" }}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--highlight)] opacity-20 rounded-bl-full"></div>

      <h3 className="text-lg font-bold text-[var(--headline)] mb-4">Withdrawal Requests</h3>
      {withdrawalRequests.length > 0 ? (
        <ul className="space-y-4">
          {withdrawalRequests.map((request) => (
            <li
              key={request.id}
              className="bg-[var(--card-background)] p-4 rounded-lg shadow-md border border-[var(--card-border)] flex justify-between items-center"
            >
              <div>
                <p className="text-[var(--card-headline)] font-semibold">{request.name}</p>
                <p className="text-sm text-[var(--card-paragraph)]">
                  Goal: ${request.goal.toLocaleString()} | Contributions: ${request.currentContributions.toLocaleString()}
                </p>
                <p className="text-sm text-[var(--card-paragraph)]">Deadline: {request.deadline}</p>
              </div>
              <button
                onClick={() => handleWithdraw(request.id)}
                className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all"
              >
                Withdraw
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--paragraph)] mt-4">No withdrawal requests at the moment.</p>
      )}
    </div>
  );
};

export default Withdrawal;