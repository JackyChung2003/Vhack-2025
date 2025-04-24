import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaBullhorn, FaHandHoldingHeart, FaChartLine, FaCreditCard, FaUsers, FaArrowRight, FaMedal, FaTrophy, FaStar, FaHeart, FaHandshake, FaUserFriends, FaLock } from 'react-icons/fa';
import { charityService, Campaign } from '../../../services/supabase/charityService';
import { useNavigate } from 'react-router-dom';
import './DonorDashboard.css';

// Badge mock data
const badges = [
  {
    id: 1,
    title: "First Donation",
    description: "Made your first donation to a campaign",
    icon: <FaMedal className="text-3xl" />,
    color: "blue",
    earned: true,
    earnedDate: "2023-04-15",
  },
  {
    id: 2,
    title: "Serial Supporter",
    description: "Donated to 5 different campaigns",
    icon: <FaTrophy className="text-3xl" />,
    color: "purple",
    earned: true,
    earnedDate: "2023-06-22",
  },
  {
    id: 3,
    title: "Monthly Hero",
    description: "Made donations for 3 consecutive months",
    icon: <FaStar className="text-3xl" />,
    color: "yellow",
    earned: true,
    earnedDate: "2023-07-30",
  },
  {
    id: 6,
    title: "Early Bird",
    description: "Donated to a campaign within 24 hours of its launch",
    icon: <FaHandshake className="text-3xl" />,
    color: "orange",
    earned: true,
    earnedDate: "2023-08-05",
  },
  {
    id: 4,
    title: "Big Heart",
    description: "Donated a total of RM1,000",
    icon: <FaHeart className="text-3xl" />,
    color: "red",
    earned: false,
    progress: 75, // Percentage progress towards earning this badge
  },
  {
    id: 5,
    title: "Community Builder",
    description: "Referred 3 friends who made donations",
    icon: <FaUserFriends className="text-3xl" />,
    color: "green",
    earned: false,
    progress: 33, // Percentage progress towards earning this badge
  },
  {
    id: 7,
    title: "Long Term Supporter",
    description: "Followed and donated to the same charity for 6 months",
    icon: <FaChartLine className="text-3xl" />,
    color: "teal",
    earned: false,
    progress: 50,
  },
];
import DonorDashboardDonationSummary from './dashboard/DonorDashboardDonationSummary';

// Mock announcements with added category and color scheme
const announcements = [
  {
    id: 1,
    title: "New Campaign Alert",
    content: "Join our latest 'Clean Water Initiative' campaign! Help provide clean water to communities in need.",
    icon: <FaBullhorn />,
    color: "blue-500",
    lightColor: "blue-100",
    borderColor: "border-blue-500",
    category: "Campaign"
  },
  {
    id: 2,
    title: "Donation Match Week",
    content: "All donations made this week will be matched by our corporate partners. Double your impact today!",
    icon: <FaHandHoldingHeart />,
    color: "purple-500",
    lightColor: "purple-100",
    borderColor: "border-purple-500",
    category: "Special Offer"
  },
  {
    id: 3,
    title: "Impact Report Released",
    content: "Our annual impact report is now available. See how your donations have made a difference in communities worldwide.",
    icon: <FaChartLine />,
    color: "green-500",
    lightColor: "green-100",
    borderColor: "border-green-500",
    category: "Report"
  },
  {
    id: 4,
    title: "New Payment Methods",
    content: "We've added new payment methods to make donating easier. Check out the options in your profile.",
    icon: <FaCreditCard />,
    color: "orange-500",
    lightColor: "orange-100",
    borderColor: "border-orange-500",
    category: "Update"
  },
  {
    id: 5,
    title: "Volunteer Opportunities",
    content: "Looking to help beyond donations? Check out our new volunteer opportunities page.",
    icon: <FaUsers />,
    color: "red-500",
    lightColor: "red-100",
    borderColor: "border-red-500",
    category: "Volunteer"
  }
];

// Mock advertisements
const advertisements = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2",
    title: "Premium Smartwatch",
    description: "Track your fitness goals with our latest smartwatch model",
    price: "$199",
    oldPrice: "$299",
    discount: "-33%",
    color: "blue",
    tag: "Limited Time Offer"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da",
    title: "Smart Home Hub",
    description: "Control all your smart devices from one central hub",
    price: "$89",
    oldPrice: "$129",
    discount: "-30%",
    color: "green",
    tag: "New Arrival"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6",
    title: "Fitness Smart Band",
    description: "Monitor your health metrics and stay fit",
    price: "$79",
    oldPrice: "$119",
    discount: "-34%",
    color: "red",
    tag: "Hot Deal"
  }
];

const DonorDashboard: React.FC = () => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [currentAd, setCurrentAd] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandBadges, setExpandBadges] = useState(false);
  const navigate = useNavigate();

  // Fetch real campaigns from backend
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await charityService.getAllCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const nextAnnouncement = () => {
    setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    setCurrentAnnouncement((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const navigateToCampaign = (id: string) => {
    navigate(`/charity/${id}`);
  };

  const nextAd = () => {
    setCurrentAd((prev) => (prev + 1) % advertisements.length);
  };

  const prevAd = () => {
    setCurrentAd((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  const goToAd = (index: number) => {
    setCurrentAd(index);
  };

  const toggleExpandBadges = () => {
    setExpandBadges(!expandBadges);
  };

  const currentItem = announcements[currentAnnouncement];

  // Calculate days left from deadline
  const getDaysLeft = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Get the badges to display
  const displayBadges = expandBadges ? badges : badges.slice(0, 5);

  return (
    <div className="container mx-auto p-6">
      {/* Colorful White Announcements Section */}
      <div className="mb-10">
        <div className="relative">
          {/* White container with colorful accents */}
          <div className={`bg-white p-6 rounded-xl shadow-lg text-black min-h-[160px] transform transition-all duration-300 hover:shadow-xl border-l-4 ${currentItem.borderColor}`}>
            {/* Colorful decorative elements */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${currentItem.lightColor} rounded-bl-full opacity-40 z-0`}></div>
            <div className={`absolute bottom-0 left-16 w-24 h-24 bg-${currentItem.lightColor} rounded-tr-full opacity-30 z-0`}></div>

            {/* Category Tag */}
            <div className={`absolute top-4 right-4 bg-${currentItem.color} bg-opacity-10 text-${currentItem.color} px-3 py-1 rounded-full text-xs font-semibold`}>
              {currentItem.category}
            </div>

            {/* Content with Icon */}
            <div className="flex items-start gap-4 relative z-10">
              <div className={`p-3 bg-${currentItem.color} bg-opacity-15 rounded-full text-${currentItem.color}`}>
                {currentItem.icon}
              </div>

              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 text-${currentItem.color}`}>
                  {currentItem.title}
                </h3>
                <p className="text-gray-700 text-lg">
                  {currentItem.content}
                </p>
              </div>
            </div>

            {/* Pagination indicator */}
            <div className="flex justify-center mt-5 gap-2 relative z-10">
              {announcements.map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${index === currentAnnouncement
                    ? `bg-${currentItem.color}`
                    : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  onClick={() => setCurrentAnnouncement(index)}
                ></div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevAnnouncement}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 text-${currentItem.color} transform transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-${currentItem.color}`}
            aria-label="Previous announcement"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextAnnouncement}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 text-${currentItem.color} transform transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-${currentItem.color}`}
            aria-label="Next announcement"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Active Campaigns Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--headline)]">Active Campaigns</h2>
          <button
            onClick={() => navigate('/donor/all-campaigns')}
            className="text-[var(--highlight)] hover:underline flex items-center gap-1 text-sm font-medium bg-transparent border-none cursor-pointer"
          >
            View all campaigns <FaArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-10 w-10 border-t-2 border-b-2 border-[var(--highlight)]"></div>
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured Campaign */}
            <div
              className="bg-white rounded-xl shadow-md overflow-hidden border border-[var(--stroke)] transition-all hover:shadow-lg hover:translate-y-[-5px] cursor-pointer"
              onClick={() => navigateToCampaign(campaigns[0].id)}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={campaigns[0].image_url || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80'}
                  alt={campaigns[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute left-0 bottom-0 p-3 text-white">
                  <span className="bg-[var(--highlight)] text-white px-2 py-1 rounded-md text-xs font-medium inline-block mb-2">
                    Featured
                  </span>
                  <h3 className="text-lg font-bold text-white">{campaigns[0].title}</h3>
                  <p className="text-white/80 text-xs">By {campaigns[0].charity?.name || 'Organization'}</p>
                </div>
              </div>

              <div className="p-4">
                <p className="text-[var(--paragraph)] mb-4 line-clamp-2 text-sm">
                  {campaigns[0].description}
                </p>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--paragraph)]">Progress</span>
                    <span className="font-medium">{Math.round(((campaigns[0].current_amount || 0) / (campaigns[0].target_amount || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[var(--highlight)] h-2 rounded-full"
                      style={{ width: `${((campaigns[0].current_amount || 0) / (campaigns[0].target_amount || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm mt-4">
                  <div>
                    <span className="text-[var(--paragraph)]">Raised</span>
                    <p className="font-semibold text-[var(--headline)]">RM{(campaigns[0].current_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[var(--paragraph)]">Goal</span>
                    <p className="font-semibold text-[var(--headline)]">RM{(campaigns[0].target_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[var(--paragraph)]">Days Left</span>
                    <p className="font-semibold text-[var(--headline)]">{getDaysLeft(campaigns[0].deadline)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Campaigns */}
            {campaigns.slice(1, 3).map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-[var(--stroke)] transition-all hover:shadow-lg hover:translate-y-[-5px] cursor-pointer"
                onClick={() => navigateToCampaign(campaign.id)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={campaign.image_url || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80'}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute left-0 bottom-0 p-3 text-white">
                    <h3 className="text-lg font-bold text-white">{campaign.title}</h3>
                    <p className="text-white/80 text-xs">By {campaign.charity?.name || 'Organization'}</p>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[var(--paragraph)] text-sm mb-3 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--paragraph)]">Progress</span>
                      <span className="font-medium">{Math.round(((campaign.current_amount || 0) / (campaign.target_amount || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[var(--highlight)] h-2 rounded-full"
                        style={{ width: `${((campaign.current_amount || 0) / (campaign.target_amount || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <FaHandHoldingHeart size={40} className="text-[var(--highlight)] opacity-50 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-[var(--headline)] mb-2">No Active Campaigns</h3>
            <p className="text-[var(--paragraph)] mb-4">There are currently no active campaigns available.</p>
          </div>
        )}
      </div>

      {/* Badge Wall Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--headline)]">Your Achievement Badges</h2>
          <button
            onClick={toggleExpandBadges}
            className="text-[var(--highlight)] hover:underline flex items-center gap-1 text-sm font-medium bg-transparent border-none cursor-pointer"
          >
            {expandBadges ? "Show Less" : "View All"} <FaArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayBadges.map((badge) => (
            <div
              key={badge.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden border border-${badge.color}-200 transition-all hover:shadow-lg text-center p-4 ${!badge.earned && 'opacity-70'}`}
            >
              <div className={`mx-auto w-16 h-16 rounded-full mb-3 flex items-center justify-center bg-${badge.color}-100 relative`}>
                <div className={`text-${badge.color}-600`}>
                  {badge.icon}
                </div>
                {!badge.earned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70 rounded-full">
                    <FaLock className="text-gray-500 text-xl" />
                  </div>
                )}
              </div>

              <h3 className="font-bold text-[var(--headline)] mb-1">{badge.title}</h3>
              <p className="text-xs text-[var(--paragraph)] mb-2">{badge.description}</p>

              {badge.earned ? (
                <div className="text-xs text-green-600 font-medium">
                  Earned {badge.earnedDate ? new Date(badge.earnedDate).toLocaleDateString() : ''}
                </div>
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className={`bg-${badge.color}-500 h-1.5 rounded-full`}
                    style={{ width: `${badge.progress}%` }}
                  ></div>
                </div>
              )}

              {!badge.earned && (
                <div className="text-xs text-[var(--paragraph)]">
                  {badge.progress}% complete
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Advertisement and Content Section */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Advertisement - 1/4 width */}
          <div className="w-full md:w-1/4">
            <div className="bg-white p-4 rounded-xl shadow-md border border-[var(--stroke)] flex flex-col items-center justify-center text-center h-full min-h-[300px] relative overflow-hidden">
              {/* Scrollable Ads */}
              <div className="w-full mb-2 relative">
                {/* Ad Content */}
                <div className="w-full">
                  <div className="relative">
                    <img
                      src={`${advertisements[currentAd].image}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80`}
                      alt={advertisements[currentAd].title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                    <div className="absolute top-2 right-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md">
                      Ad
                    </div>

                    {/* Navigation Buttons */}
                    <button
                      onClick={prevAd}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white text-gray-600 transform transition-transform hover:scale-110 focus:outline-none"
                      aria-label="Previous ad"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    <button
                      onClick={nextAd}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-white text-gray-600 transform transition-transform hover:scale-110 focus:outline-none"
                      aria-label="Next ad"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>

                  <h3 className="text-center text-lg font-bold text-gray-800 mt-2">{advertisements[currentAd].title}</h3>
                  <p className="text-center text-[var(--paragraph)] text-sm mb-2">{advertisements[currentAd].description}</p>
                  <div className="flex justify-center items-center gap-2 mb-3">
                    <span className={`text-lg font-bold text-${advertisements[currentAd].color}-600`}>{advertisements[currentAd].price}</span>
                    <span className="text-gray-500 line-through text-sm">{advertisements[currentAd].oldPrice}</span>
                    <span className="bg-red-100 text-red-600 text-xs px-1 rounded">{advertisements[currentAd].discount}</span>
                  </div>
                  <button className={`w-full py-2 bg-${advertisements[currentAd].color}-600 text-white rounded-lg text-sm hover:bg-${advertisements[currentAd].color}-700 transition-colors mb-2`}>
                    Shop Now
                  </button>
                </div>
              </div>

              {/* Ad Indicators */}
              <div className="flex justify-center gap-1.5 mb-4">
                {advertisements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToAd(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentAd
                      ? 'bg-gray-500'
                      : 'bg-gray-300'
                      }`}
                    aria-label={`Go to ad ${index + 1}`}
                  />
                ))}
              </div>

              <div className="w-full border-t border-gray-200 my-1"></div>

              {/* Second Ad - Subscription Service */}
              <div className="w-full mt-1 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-gray-800">Premium Membership</h4>
                    <p className="text-xs text-gray-600">First month free!</p>
                  </div>
                </div>
                <button className="w-full py-1.5 border border-green-600 text-green-600 rounded-lg text-xs hover:bg-green-50 transition-colors">
                  Try Free Trial
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3">Sponsored content</p>
            </div>
          </div>

          {/* Recurring Donations Summary - 3/4 width */}
          <div className="w-full md:w-3/4">
            <DonorDashboardDonationSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard; 