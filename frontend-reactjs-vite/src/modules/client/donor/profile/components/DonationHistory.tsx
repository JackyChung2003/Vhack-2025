import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaCalendarAlt, FaExternalLinkAlt, FaSpinner, FaReceipt, FaChevronDown, FaCheck, FaHourglass, FaArrowRight, FaFilter, FaBuilding, FaHandHoldingHeart, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "../../../../../services/supabase/supabaseClient";
import { useAuth } from "../../../../../contexts/AuthContext";
import { getTransactionExplorerUrl } from "../../../../../services/blockchain/blockchainService";
import { format } from "date-fns";

interface Donation {
  id: string;
  campaign_name: string;
  campaign_id?: string | null;
  charity_id?: string | null;
  charity_name?: string;
  amount: number;
  created_at: string;
  status: string;
  transaction_hash: string;
}

interface CampaignInfo {
  id: string;
  title: string;
}

// Donation filter type
type DonationFilter = 'all' | 'campaign' | 'general';

const DonationHistory: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DonationFilter>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showCampaignFilter, setShowCampaignFilter] = useState(false);
  const { user } = useAuth();
  
  // Number of donations to show initially
  const initialDisplayCount = 3;

  useEffect(() => {
    const fetchDonations = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get all donations from the current user
        const { data: donationData, error: donationError } = await supabase
          .from('campaign_donations')
          .select(`
            id, 
            amount, 
            created_at, 
            status, 
            transaction_hash,
            campaign_id,
            charity_id,
            campaigns:campaign_id (id, title),
            charities:charity_id (id, name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (donationError) throw donationError;
        
        if (donationData) {
          // Extract unique campaigns for the filter
          const uniqueCampaigns: CampaignInfo[] = [];
          const campaignIds = new Set<string>();
          
          donationData.forEach((donation: any) => {
            if (donation.campaign_id && donation.campaigns && !campaignIds.has(donation.campaign_id)) {
              campaignIds.add(donation.campaign_id);
              uniqueCampaigns.push({
                id: donation.campaign_id,
                title: donation.campaigns.title || 'Unknown Campaign'
              });
            }
          });
          
          setCampaigns(uniqueCampaigns);
          
          const formattedDonations = donationData.map((donation: any) => {
            // Determine campaign name based on if it's a campaign donation or general fund
            let displayName = 'General Fund';
            
            if (donation.campaign_id && donation.campaigns) {
              // Campaign donation
              displayName = donation.campaigns.title || 'Unknown Campaign';
            } else if (donation.charity_id && donation.charities) {
              // General fund donation - use charity name
              displayName = `${donation.charities.name} General Fund`;
            }
            
            return {
              id: donation.id,
              campaign_name: displayName,
              campaign_id: donation.campaign_id,
              charity_id: donation.charity_id,
              charity_name: donation.charities?.name,
              amount: donation.amount,
              created_at: donation.created_at,
              status: donation.status || 'completed',
              transaction_hash: donation.transaction_hash || ''
            };
          });
          
          setDonations(formattedDonations);
        }
      } catch (err: any) {
        console.error('Error fetching donations:', err);
        setError(err.message || 'Failed to load donation history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonations();
  }, [user]);

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  // Get status icon
  const getStatusIcon = (donation: Donation) => {
    if (donation.transaction_hash) {
      return <FaCheck className="text-green-500" />;
    } else if (donation.status === 'pending') {
      return <FaHourglass className="text-amber-500" />;
    } else {
      return <FaReceipt className="text-[var(--subtext)]" />;
    }
  };
  
  // Determine if a donation is campaign or general
  const isDonationCampaign = (donation: Donation) => !!donation.campaign_id;
  const isDonationGeneral = (donation: Donation) => !donation.campaign_id && !!donation.charity_id;

  // Filter donations based on active filter
  const getFilteredDonations = () => {
    let filtered = [...donations];
    
    // Filter by donation type (campaign or general)
    if (activeFilter === 'campaign') {
      filtered = filtered.filter(isDonationCampaign);
    } else if (activeFilter === 'general') {
      filtered = filtered.filter(isDonationGeneral);
    }
    
    // Further filter by selected campaign if any
    if (selectedCampaign) {
      filtered = filtered.filter(donation => donation.campaign_id === selectedCampaign);
    }
    
    return filtered;
  };

  // Get count for each category
  const getCategoryCount = (type: DonationFilter) => {
    if (type === 'all') return donations.length;
    if (type === 'campaign') return donations.filter(isDonationCampaign).length;
    return donations.filter(isDonationGeneral).length;
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilter('all');
    setSelectedCampaign(null);
  };

  if (loading) {
    return (
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6 text-center">
        <FaSpinner className="animate-spin text-2xl text-[var(--highlight)] mx-auto mb-3" />
        <p className="text-[var(--paragraph)]">Loading donation history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6 text-center">
        <p className="text-red-500 mb-3">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredDonations = getFilteredDonations();
  
  // Determine which donations to display based on expanded state
  const visibleDonations = expanded ? filteredDonations : filteredDonations.slice(0, initialDisplayCount);
  const hasMoreToShow = filteredDonations.length > initialDisplayCount;

  return (
    <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-[var(--stroke)] bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] bg-opacity-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--headline)] flex items-center gap-2">
            <FaMoneyBillWave className="text-[var(--highlight)]" />
            Donation History
          </h2>
          
          {activeFilter === 'campaign' && (
            <button
              onClick={() => setShowCampaignFilter(!showCampaignFilter)}
              className="text-sm bg-[var(--background)] hover:bg-[var(--highlight)] hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FaFilter className="text-xs" />
              {selectedCampaign ? 'Campaign Selected' : 'Filter Campaigns'}
            </button>
          )}
          
          {(activeFilter !== 'all' || selectedCampaign) && (
            <button
              onClick={clearFilters}
              className="text-xs text-[var(--paragraph)] hover:text-[var(--highlight)]"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {showCampaignFilter && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 p-3 bg-[var(--background)] rounded-lg"
          >
            <div className="text-sm font-medium mb-2 text-[var(--headline)]">Filter by Campaign</div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedCampaign(null)}
                className={`text-xs px-2 py-1 rounded ${!selectedCampaign 
                  ? 'bg-[var(--highlight)] text-white' 
                  : 'bg-[var(--background)] text-[var(--paragraph)] hover:bg-[var(--highlight)] hover:bg-opacity-10 hover:text-white'}`}
              >
                All Campaigns
              </button>
              {campaigns.map(campaign => (
                <button 
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign.id)}
                  className={`text-xs px-2 py-1 rounded truncate max-w-[150px] ${selectedCampaign === campaign.id 
                    ? 'bg-[var(--highlight)] text-white' 
                    : 'bg-[var(--panel)] text-[var(--paragraph)] hover:bg-[var(--highlight)] hover:bg-opacity-10 hover:text-white'}`}
                >
                  {campaign.title}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Category filter tabs */}
      <div className="flex border-b border-[var(--stroke)]">
        <button
          onClick={() => {
            setActiveFilter('all');
            setShowCampaignFilter(false);
          }}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            activeFilter === 'all'
              ? 'border-b-2 border-[var(--highlight)] text-[var(--highlight)]'
              : 'text-[var(--paragraph)] hover:bg-[var(--background)]'
          }`}
        >
          <FaFilter className="text-xs" />
          All Donations
          <span className="bg-[var(--background)] px-2 py-0.5 rounded-full text-xs">
            {getCategoryCount('all')}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveFilter('campaign');
            // Show campaign filter when switching to campaign tab
            if (campaigns.length > 0) {
              setShowCampaignFilter(true);
            }
          }}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            activeFilter === 'campaign'
              ? 'border-b-2 border-[var(--highlight)] text-[var(--highlight)]'
              : 'text-[var(--paragraph)] hover:bg-[var(--background)]'
          }`}
        >
          <FaHandHoldingHeart className="text-xs" />
          Campaign
          <span className="bg-[var(--background)] px-2 py-0.5 rounded-full text-xs">
            {getCategoryCount('campaign')}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveFilter('general');
            setShowCampaignFilter(false);
            setSelectedCampaign(null);
          }}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            activeFilter === 'general'
              ? 'border-b-2 border-[var(--highlight)] text-[var(--highlight)]'
              : 'text-[var(--paragraph)] hover:bg-[var(--background)]'
          }`}
        >
          <FaBuilding className="text-xs" />
          General Fund
          <span className="bg-[var(--background)] px-2 py-0.5 rounded-full text-xs">
            {getCategoryCount('general')}
          </span>
        </button>
      </div>
      
      {filteredDonations.length > 0 ? (
        <>
      <div className="divide-y divide-[var(--stroke)]">
            <AnimatePresence>
              {visibleDonations.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="p-6 hover:bg-[var(--background)] transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center">
                        {getStatusIcon(donation)}
            </div>
                      <div>
                        <h3 className="font-semibold text-[var(--headline)]">{donation.campaign_name}</h3>
                        <div className="text-xs text-[var(--subtext)] mt-1">
                          <span className={`px-2 py-0.5 rounded-full ${
                            isDonationCampaign(donation) 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {isDonationCampaign(donation) ? 'Campaign' : 'General Fund'}
              </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-[var(--paragraph)] bg-[var(--background)] px-3 py-1 rounded-full">
                        {formatDate(donation.created_at)}
                      </div>
                      <span className="font-bold text-[var(--highlight)] text-lg">RM{donation.amount}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-[var(--stroke)]">
                    <div className="text-sm text-[var(--paragraph)]">
                      {donation.status === 'completed' ? 'Verified donation' : 'Processing donation'}
                    </div>
                    {donation.transaction_hash ? (
                      <a
                        href={getTransactionExplorerUrl(donation.transaction_hash)}
                target="_blank"
                rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[var(--background)] text-[var(--highlight)] hover:bg-[var(--highlight)] hover:text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                      >
                        Verify on Blockchain
                        <FaExternalLinkAlt className="text-xs" />
                      </a>
                    ) : (
                      <span className="text-[var(--subtext)] text-sm flex items-center gap-1 bg-[var(--background)] px-3 py-1.5 rounded-lg">
                        <FaHourglass className="animate-pulse" />
                        Transaction Processing
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {hasMoreToShow && (
            <div className="p-4 text-center border-t border-[var(--stroke)]">
              <button 
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 mx-auto text-[var(--highlight)] hover:underline transition-colors focus:outline-none"
              >
                {expanded ? 'Show Less' : `Show ${filteredDonations.length - initialDisplayCount} More`}
                <FaChevronDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-10 text-center">
          <div className="bg-[var(--highlight)] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaReceipt className="text-[var(--highlight)] text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--headline)] mb-2">
            {selectedCampaign ? 
              'No Donations for This Campaign' :
              activeFilter === 'all' ? 
                'No Donations Yet' : 
                activeFilter === 'campaign' ? 
                  'No Campaign Donations Yet' : 
                  'No General Fund Donations Yet'
            }
          </h3>
          <p className="text-[var(--paragraph)] mb-5 max-w-md mx-auto">
            {selectedCampaign ?
              'You haven\'t made any donations to this specific campaign yet.' :
              activeFilter === 'all' ? 
                'Your donation history will appear here once you make a contribution.' :
                `You haven't made any ${activeFilter === 'campaign' ? 'campaign' : 'general fund'} donations yet.`
            }
          </p>
          <a 
            href="/charity"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Browse Campaigns <FaArrowRight />
          </a>
      </div>
      )}
    </div>
  );
};

export default DonationHistory; 