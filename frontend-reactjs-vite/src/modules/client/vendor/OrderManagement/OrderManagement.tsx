import React from "react";
import OrderAnalytics from "./OrderAnalytics";
import OrganizationOrderList from "../VendorHomePage/OrderManagement";

const OrderManagement = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4">
          <OrderAnalytics />
        </div>
        
        <div className="w-full lg:w-3/4 bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] p-6">
          <OrganizationOrderList />
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
