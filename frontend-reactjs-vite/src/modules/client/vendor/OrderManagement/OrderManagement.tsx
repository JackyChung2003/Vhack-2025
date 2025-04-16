import React from "react";
import OrderHistory from "./OrderHistory";
import OrderRequest from "./OrderRequest";
import OrganizationOrders from "../VendorHomePage/OrderManagement";

const OrderManagement = () => {
  return (
    <div className="container mx-auto p-6 space-y-8 ">
      <div className="border border-black rounded-xl p-4">
        <OrganizationOrders />
      </div>
      
      <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] p-6">
        <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Order History</h2>
        <OrderHistory />
      </div>

      <div className="bg-[var(--main)] rounded-xl shadow-md border border-[var(--stroke)] p-6">
        <h2 className="text-xl font-bold text-[var(--headline)] mb-4">Order Requests</h2>
        <OrderRequest />
      </div>
    </div>
  );
};

export default OrderManagement;
