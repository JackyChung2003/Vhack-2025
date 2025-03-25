import React from "react";
import CampaignCard from "../../../../components/cards/CampaignCard";
import { FaHandHoldingHeart } from "react-icons/fa";
import { mockDonorContributions } from "../../../../utils/mockData";

const DonorSupportedCampaigns: React.FC = () => {
  // Use the mock data from our shared mock data source
  const supportedCampaigns = mockDonorContributions.supportedCampaigns;

  return (
    <div>
      {supportedCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportedCampaigns.map((campaign) => (
            <div key={campaign.id} className="relative">
              <CampaignCard
                id={campaign.id}
                name={campaign.name}
                description={campaign.description}
                goal={campaign.goal}
                currentContributions={campaign.currentContributions}
                deadline={campaign.deadline}
              />
              <div className="absolute top-0 right-0 bg-[var(--highlight)] text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                Your contribution: ${campaign.donorContribution}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-[var(--main)] rounded-xl border border-[var(--stroke)]">
          <FaHandHoldingHeart className="mx-auto text-4xl text-[var(--paragraph)] opacity-30 mb-4" />
          <p className="text-lg">You haven't supported any campaigns yet.</p>
          <p className="text-[var(--paragraph)]">Browse campaigns and make a difference today!</p>
        </div>
      )}
    </div>
  );
};

export default DonorSupportedCampaigns; 