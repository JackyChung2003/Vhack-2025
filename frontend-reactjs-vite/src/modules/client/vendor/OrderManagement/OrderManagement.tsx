import React from "react";
import OrderAnalytics from "./OrderAnalytics";
import OrganizationOrderList from "../VendorHomePage/OrderManagement";

const OrderManagement = () => {
  return (
    <div className="container mx-auto p-6 space-y-8 ">
      <OrderAnalytics />

      <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] p-6">
        <OrganizationOrderList />
      </div>
    </div>
  );
};

export default OrderManagement;
