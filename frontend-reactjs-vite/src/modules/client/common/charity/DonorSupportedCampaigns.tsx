import React, { useState, useEffect } from "react";
import CampaignCard from "../../../../components/cards/CampaignCard";
import { FaHandHoldingHeart } from "react-icons/fa";
import { Campaign, charityService } from "../../../../services/supabase/charityService";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";

const DonorSupportedCampaigns: React.FC = () => {
  const [supportedCampaigns, setSupportedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupportedCampaigns = async () => {
      try {
        setIsLoading(true);
        const campaigns = await charityService.getDonorSupportedCampaigns();
        setSupportedCampaigns(campaigns);
      } catch (err) {
        console.error("Failed to fetch supported campaigns:", err);
        setError("Failed to load your supported campaigns. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupportedCampaigns();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  return (
    <div>
      {supportedCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportedCampaigns.map((campaign) => (
            <div key={campaign.id} className="relative h-full">
              <div className="h-full">
                <CampaignCard
                  id={campaign.id}
                  name={campaign.title}
                  description={campaign.description}
                  goal={campaign.target_amount}
                  currentContributions={campaign.current_amount}
                  deadline={campaign.deadline}
                  category={campaign.category}
                />
              </div>
              <div className="absolute top-0 right-0 bg-[var(--highlight)] text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium z-10">
                Your contribution: RM{campaign.donorContribution?.toFixed(2)}
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