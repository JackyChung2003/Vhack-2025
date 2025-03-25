import React from "react";

interface SpecificFundProps {
  specificFundBalance: number;
}

const SpecificFund: React.FC<SpecificFundProps> = ({ specificFundBalance }) => {
  return (
    <div 
      className="bg-[var(--main)] p-6 rounded-lg shadow-xl border border-[var(--stroke)] transition-all transform hover:translate-y-[-8px] hover:shadow-2xl cursor-pointer overflow-hidden"
      style={{ position: 'relative', gridColumn: 'span 3' }}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--highlight)] opacity-20 rounded-bl-full"></div>

      <h3 className="text-lg font-bold text-[var(--headline)] mb-3">Specific Fund Accumulated</h3>
      <p className="text-2xl font-semibold text-[var(--highlight)]">
        ${specificFundBalance.toLocaleString()}
      </p>
    </div>
  );
};

export default SpecificFund;