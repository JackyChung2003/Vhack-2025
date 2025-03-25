import React, { useState } from "react";
import { FaSearch, FaFilter, FaBuilding } from "react-icons/fa";
import OrganizationCard from "../../../../components/cards/OrganizationCard";
import { mockOrganizations, mockCampaigns } from "../../../../utils/mockData";

// Define organization categories based on campaign categories
const organizationCategories = [
  "All Categories",
  "Health & Medical",
  "Education",
  "Environment",
  "Disaster Relief",
  "Poverty & Hunger",
  "Animal Welfare",
  "Human Rights",
  "Community Development"
];

const CharitySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Filter organizations based on search term and selected category
  const filteredOrganizations = mockOrganizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          org.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If "All Categories" is selected, only filter by search term
    if (selectedCategory === "All Categories") {
      return matchesSearch;
    }

    // Check if the organization has any campaigns in the selected category
    const hasMatchingCampaigns = mockCampaigns.some(
      campaign => campaign.organizationId === org.id && campaign.category === selectedCategory
    );

    return matchesSearch && hasMatchingCampaigns;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--headline)] mb-1">Find Organizations</h2>
        <p className="text-[var(--paragraph-light)]">Connect with organizations and view their active campaigns.</p>
      </div>
      
      {/* Search and filter section */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--paragraph-light)]" />
          <input
            type="text"
            placeholder="Search for organizations..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative min-w-[180px]">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--paragraph-light)]" />
          <select
            className="w-full appearance-none pl-10 pr-8 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {organizationCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 fill-current text-[var(--paragraph-light)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.length > 0 ? (
          filteredOrganizations.map((org) => (
            <OrganizationCard
              key={org.id}
              id={org.id}
              name={org.name}
              description={org.description}
              logo={org.logo}
              campaigns={org.campaigns}
              totalRaised={org.totalRaised}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <FaBuilding className="mx-auto text-4xl text-[var(--paragraph-light)] mb-4" />
            <p className="text-[var(--paragraph-light)]">No organizations found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharitySearch; 