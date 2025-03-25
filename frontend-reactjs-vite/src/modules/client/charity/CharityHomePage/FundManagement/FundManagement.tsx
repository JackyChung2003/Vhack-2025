import React from "react";
import GeneralFund from "./GeneralFund";
import SpecificFund from "./SpecificFund";
import TotalFund from "./TotalFund";
import Withdrawal from "./Withdrawal";
import { mockCampaigns, mockOrganizations } from "../../../../../utils/mockData";

// Mock current charity organization ID (Global Relief)
const CURRENT_CHARITY_ORG_ID = 1;

const FundManagement: React.FC = () => {
  // Get the current organization
  const currentOrganization = mockOrganizations.find(org => org.id === CURRENT_CHARITY_ORG_ID);
  
  // Get all campaigns for this organization
  const organizationCampaigns = mockCampaigns.filter(
    campaign => campaign.organizationId === CURRENT_CHARITY_ORG_ID
  );
  
  // Calculate total contributions across all campaigns
  const specificFundBalance = organizationCampaigns.reduce(
    (total, campaign) => total + campaign.currentContributions, 
    0
  );
  
  // Mock data
  const generalFundBalance = currentOrganization?.totalRaised || 50000; 
  const totalFundsRaised = generalFundBalance; // Total funds raised
  
  // Find campaigns that are close to deadline but haven't reached their goal
  const today = new Date();
  const withdrawalRequests = organizationCampaigns
    .filter(campaign => {
      const deadline = new Date(campaign.deadline);
      const timeLeft = deadline.getTime() - today.getTime();
      const daysLeft = timeLeft / (1000 * 3600 * 24);
      return daysLeft < 30 && campaign.currentContributions < campaign.goal;
    })
    .map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      goal: campaign.goal,
      currentContributions: campaign.currentContributions,
      deadline: campaign.deadline
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
      {/* General Fund */}
      <div className="md:col-span-3">
        <GeneralFund generalFundBalance={generalFundBalance} />
      </div>

      {/* Specific Fund */}
      <div className="md:col-span-3">
        <SpecificFund specificFundBalance={specificFundBalance} />
      </div>

      {/* Total Fund */}
      <div className="md:col-span-6">
        <TotalFund totalFundsRaised={totalFundsRaised} />
      </div>

      {/* Withdrawal Requests */}
      <div className="md:col-span-6">
        <Withdrawal withdrawalRequests={withdrawalRequests} />
      </div>
    </div>
  );
};

export default FundManagement;