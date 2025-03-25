import React from "react";
import { motion } from "framer-motion";

const VendorProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--highlight)] to-[var(--tertiary)] text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Vendor Profile</h1>
          <p className="mt-2 opacity-90">Manage your vendor account settings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--main)] rounded-lg p-6 shadow-sm"
        >
          <p className="text-[var(--paragraph)]">Profile content will be added here.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorProfile; 