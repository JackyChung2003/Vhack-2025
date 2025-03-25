// Define the Campaign interface to match our service
export interface Campaign {
  id: number;
  name: string;
  description: string;
  goal: number;
  currentContributions: number;
  deadline: string;
  organizationId: number;
  category: string;
}

// Mock data for all campaigns and donor contributions
export const mockCampaigns: Campaign[] = [
  { id: 1, name: "Clean Water Initiative", description: "Providing clean water to communities in need through sustainable infrastructure projects.", goal: 10000, currentContributions: 5000, deadline: "2025-08-31", organizationId: 1, category: "Health & Medical" },
  { id: 2, name: "Education for All", description: "Supporting education programs for underprivileged children around the world.", goal: 20000, currentContributions: 15000, deadline: "2025-03-31", organizationId: 2, category: "Education" },
  { id: 3, name: "Wildlife Conservation", description: "Protecting endangered species and their habitats through conservation efforts.", goal: 30000, currentContributions: 25000, deadline: "2025-06-27", organizationId: 3, category: "Environment" },
  { id: 4, name: "Hunger Relief", description: "Providing meals and food security to communities facing food insecurity.", goal: 40000, currentContributions: 35000, deadline: "2025-07-27", organizationId: 5, category: "Poverty & Hunger" },
  { id: 5, name: "Medical Aid", description: "Delivering essential medical supplies and healthcare to underserved regions.", goal: 50000, currentContributions: 45000, deadline: "2025-08-27", organizationId: 4, category: "Health & Medical" },
  { id: 6, name: "Disaster Relief", description: "Providing immediate assistance to communities affected by natural disasters.", goal: 60000, currentContributions: 55000, deadline: "2025-09-27", organizationId: 1, category: "Disaster Relief" },
  { id: 7, name: "Renewable Energy", description: "Implementing renewable energy solutions in developing communities.", goal: 70000, currentContributions: 65000, deadline: "2025-10-27", organizationId: 6, category: "Environment" },
  { id: 8, name: "Women Empowerment", description: "Supporting programs that empower women through education and economic opportunities.", goal: 80000, currentContributions: 75000, deadline: "2025-11-27", organizationId: 2, category: "Community Development" },
  { id: 9, name: "Mental Health Support", description: "Providing mental health resources and support to those in need.", goal: 90000, currentContributions: 85000, deadline: "2025-12-27", organizationId: 4, category: "Health & Medical" },
  { id: 10, name: "Ocean Cleanup", description: "Removing plastic and pollution from oceans to protect marine life.", goal: 100000, currentContributions: 95000, deadline: "2026-01-27", organizationId: 6, category: "Environment" },
  { id: 100, name: "Global Relief Campaign 1", description: "This is a campaign by Global Relief focused on addressing specific needs in target communities.", goal: 20000, currentContributions: 15000, deadline: "2025-08-31", organizationId: 1, category: "Community Development" },
  { id: 101, name: "Global Relief Campaign 2", description: "This is a campaign by Global Relief focused on addressing specific needs in target communities.", goal: 30000, currentContributions: 20000, deadline: "2025-08-31", organizationId: 1, category: "Human Rights" }
];

// Define the Organization interface
export interface Organization {
  id: number;
  name: string;
  description: string;
  logo: string;
  campaigns: number;
  totalRaised: number;
}

export const mockOrganizations: Organization[] = [
  { id: 1, name: "Global Relief", description: "A worldwide organization dedicated to providing humanitarian aid in crisis situations.", logo: "", campaigns: 5, totalRaised: 250000 },
  { id: 2, name: "EduCare", description: "Focused on providing quality education to underprivileged children around the world.", logo: "", campaigns: 3, totalRaised: 180000 },
  { id: 3, name: "Nature First", description: "Committed to protecting wildlife and natural habitats through conservation efforts.", logo: "", campaigns: 4, totalRaised: 320000 },
  { id: 4, name: "Health Alliance", description: "Delivering essential healthcare services to communities with limited access to medical care.", logo: "", campaigns: 6, totalRaised: 420000 },
  { id: 5, name: "Food for All", description: "Working to eliminate hunger and food insecurity in vulnerable communities.", logo: "", campaigns: 2, totalRaised: 150000 },
  { id: 6, name: "Clean Earth Initiative", description: "Focused on environmental conservation and sustainable practices to protect our planet.", logo: "", campaigns: 4, totalRaised: 280000 },
];

// Define interfaces for donor contributions
export interface SupportedCampaign extends Campaign {
  donorContribution: number;
}

export interface ContributionDetail {
  amount: number;
  date: string;
  transactionHash: string;
  donationPolicy?: 'always-donate' | 'campaign-specific';
}

export interface SupportedOrganization {
  id: number;
  name: string;
  totalContribution: number;
}

export const mockDonorContributions = {
  // Campaigns the donor has supported
  supportedCampaigns: [
    { 
      id: 1, 
      name: "Clean Water Initiative", 
      description: "Providing clean water to communities in need through sustainable infrastructure projects.", 
      goal: 10000, 
      currentContributions: 5000, 
      deadline: "2025-08-31",
      donorContribution: 500,
      organizationId: 1,
      category: "Health & Medical"
    },
    { 
      id: 3, 
      name: "Wildlife Conservation", 
      description: "Protecting endangered species and their habitats through conservation efforts.", 
      goal: 30000, 
      currentContributions: 25000, 
      deadline: "2025-06-27",
      donorContribution: 1200,
      organizationId: 3,
      category: "Environment"
    },
    { 
      id: 100, 
      name: "Global Relief Campaign 1", 
      description: "This is a campaign by Global Relief focused on addressing specific needs in target communities.", 
      goal: 20000, 
      currentContributions: 15000, 
      deadline: "2025-08-31",
      donorContribution: 1500,
      organizationId: 1,
      category: "Community Development"
    },
    { 
      id: 101, 
      name: "Global Relief Campaign 2", 
      description: "This is a campaign by Global Relief focused on addressing specific needs in target communities.", 
      goal: 30000, 
      currentContributions: 20000, 
      deadline: "2025-08-31",
      donorContribution: 1000,
      organizationId: 1,
      category: "Human Rights"
    }
  ] as SupportedCampaign[],
  
  // Detailed contribution history for each campaign
  contributionDetails: {
    1: [
      { amount: 300, date: "2024-03-15", transactionHash: "0x123...", donationPolicy: 'always-donate' },
      { amount: 200, date: "2024-02-10", transactionHash: "0x456...", donationPolicy: 'always-donate' },
    ],
    3: [
      { amount: 700, date: "2024-02-20", transactionHash: "0x789...", donationPolicy: 'always-donate' },
      { amount: 500, date: "2024-01-05", transactionHash: "0xabc...", donationPolicy: 'always-donate' }
    ],
    100: [
      { amount: 1000, date: "2024-03-10", transactionHash: "0xdef...", donationPolicy: 'always-donate' },
      { amount: 500, date: "2024-02-15", transactionHash: "0xghi...", donationPolicy: 'always-donate' }
    ],
    101: [
      { amount: 1000, date: "2024-02-15", transactionHash: "0xjkl...", donationPolicy: 'always-donate' }
    ]
  } as Record<number, ContributionDetail[]>,
  
  // Organizations the donor has supported
  supportedOrganizations: [
    { id: 1, name: "Global Relief", totalContribution: 2500 },
    { id: 3, name: "Nature First", totalContribution: 1200 }
  ] as SupportedOrganization[]
};

// Update the AutoDonation interface to include direct recurring donations
export interface AutoDonation {
  id: number;
  amount: number;
  frequency: string;
  startDate: string;
  nextDonationDate: string;
  // New field to distinguish between category-based and direct donations
  donationType: 'category-based' | 'direct';
  // For category-based donations
  categories?: string[];
  // For direct donations
  directRecipient?: {
    id: number;
    name: string;
    type: 'campaign' | 'organization';
    category?: string;
  };
  distributions: {
    date: string;
    recipients: {
      id: number;
      name: string;
      type: 'campaign' | 'organization';
      amount: number;
      category?: string;
    }[];
  }[];
}

export const mockDonorAutoDonations: AutoDonation[] = [
  {
    id: 1,
    amount: 50,
    frequency: "monthly",
    donationType: "category-based",
    categories: ["Health & Medical"],
    startDate: "2024-01-15",
    nextDonationDate: "2024-05-15",
    distributions: [
      {
        date: "2024-04-15",
        recipients: [
          { 
            id: 1, 
            name: "Clean Water Initiative", 
            type: "campaign", 
            amount: 25, 
            category: "Health & Medical" 
          },
          { 
            id: 2, 
            name: "Medical Research Fund", 
            type: "campaign", 
            amount: 25, 
            category: "Health & Medical" 
          }
        ]
      },
      {
        date: "2024-03-15",
        recipients: [
          { 
            id: 1, 
            name: "Clean Water Initiative", 
            type: "campaign", 
            amount: 25, 
            category: "Health & Medical" 
          },
          { 
            id: 9, 
            name: "Mental Health Support", 
            type: "campaign", 
            amount: 25, 
            category: "Health & Medical" 
          }
        ]
      }
    ]
  },
  {
    id: 2,
    amount: 100,
    frequency: "quarterly",
    donationType: "category-based",
    categories: ["Environment"],
    startDate: "2024-02-20",
    nextDonationDate: "2024-05-20",
    distributions: [
      {
        date: "2024-02-20",
        recipients: [
          { 
            id: 3, 
            name: "Wildlife Conservation", 
            type: "campaign", 
            amount: 50, 
            category: "Environment" 
          },
          { 
            id: 7, 
            name: "Renewable Energy", 
            type: "campaign", 
            amount: 50, 
            category: "Environment" 
          }
        ]
      }
    ]
  },
  {
    id: 3,
    amount: 25,
    frequency: "monthly",
    donationType: "direct",
    directRecipient: {
      id: 1,
      name: "Clean Water Initiative",
      type: "campaign",
      category: "Health & Medical"
    },
    startDate: "2024-03-10",
    nextDonationDate: "2024-05-10",
    distributions: [
      {
        date: "2024-04-10",
        recipients: [
          { 
            id: 1, 
            name: "Clean Water Initiative", 
            type: "campaign", 
            amount: 25, 
            category: "Health & Medical" 
          }
        ]
      },
      {
        date: "2024-03-10",
        recipients: [
          { 
            id: 1, 
            name: "Clean Water Initiative", 
            type: "campaign", 
            amount: 25, 
            category: "Health & Medical" 
          }
        ]
      }
    ]
  },
  {
    id: 4,
    amount: 50,
    frequency: "monthly",
    donationType: "direct",
    directRecipient: {
      id: 3,
      name: "Nature First",
      type: "organization"
    },
    startDate: "2024-02-15",
    nextDonationDate: "2024-05-15",
    distributions: [
      {
        date: "2024-04-15",
        recipients: [
          { 
            id: 3, 
            name: "Nature First", 
            type: "organization", 
            amount: 50
          }
        ]
      },
      {
        date: "2024-03-15",
        recipients: [
          { 
            id: 3, 
            name: "Nature First", 
            type: "organization", 
            amount: 50
          }
        ]
      },
      {
        date: "2024-02-15",
        recipients: [
          { 
            id: 3, 
            name: "Nature First", 
            type: "organization", 
            amount: 50
          }
        ]
      }
    ]
  }
];

// Add these interfaces and mock data
export interface Community {
  id: number;
  name: string;
  members: number;
  posts: number;
  lastActive: string;
  type: 'campaign' | 'organization';
  organizationId: number;
}

export const mockCommunities: Community[] = [
  {
    id: 1,
    name: "Clean Water Supporters",
    members: 128,
    posts: 45,
    lastActive: "2h ago",
    type: "campaign",
    organizationId: 1
  },
  {
    id: 2,
    name: "Global Relief Community",
    members: 520,
    posts: 187,
    lastActive: "1h ago",
    type: "organization",
    organizationId: 1
  },
  {
    id: 3,
    name: "Disaster Relief Network",
    members: 342,
    posts: 156,
    lastActive: "3h ago",
    type: "campaign",
    organizationId: 1
  }
];

// Add after the existing interfaces
export interface DonationTracker {
  id: number;
  recipientId: number;
  recipientType: 'campaign' | 'organization';
  donations: {
    total: number;
    count: number;
    // Add fields to track donation policy amounts for campaigns
    campaignSpecificTotal?: number;
    alwaysDonateTotal?: number;
    timeline: {
      daily: { 
        date: string; 
        amount: number;
        donationPolicy?: 'always-donate' | 'campaign-specific';
        isRecurring?: boolean;
        transactionHash?: string;
        message?: string;
      }[];
      weekly: { week: string; amount: number }[];
      monthly: { month: string; amount: number }[];
    };
    topDonors: {
      donorId: number;
      name: string;
      amount: number;
      lastDonation: string;
    }[];
  };
}

// Add to existing mockData exports
export const mockDonationTrackers: DonationTracker[] = [
  {
    id: 1,
    recipientId: 1,
    recipientType: 'organization',
    donations: {
      total: 250000,
      count: 200,
      timeline: {
        daily: [
          { date: '2025-03-20', amount: 2500 },
          { date: '2025-03-19', amount: 3000 },
          { date: '2025-03-18', amount: 1500 }
        ],
        weekly: [
          { week: '2025-W12', amount: 15000 },
          { week: '2025-W11', amount: 12000 },
          { week: '2025-W10', amount: 18000 }
        ],
        monthly: [
          { month: '2025-03', amount: 45000 },
          { month: '2025-02', amount: 52000 },
          { month: '2025-01', amount: 48000 }
        ]
      },
      topDonors: [
        { donorId: 1, name: "John Doe", amount: 25000, lastDonation: "2025-03-20" },
        { donorId: 2, name: "Jane Smith", amount: 15000, lastDonation: "2025-03-19" }
      ]
    }
  },
  {
    id: 2,
    recipientId: 1, // Campaign ID 1
    recipientType: 'campaign',
    donations: {
      total: 5000,
      count: 45,
      campaignSpecificTotal: 3000, // 60% is campaign-specific
      alwaysDonateTotal: 2000, // 40% is always-donate
      timeline: {
        daily: [
          { date: '2025-03-20', amount: 500, donationPolicy: 'campaign-specific', transactionHash: '0xab52c8df456e789012a3456f7890b1234c5d6e7f', message: "Supporting this important cause!" },
          { date: '2025-03-19', amount: 300, donationPolicy: 'always-donate', transactionHash: '0xcd89e123a456b7890cde12345f6789ab01c2345d', isRecurring: true },
          { date: '2025-03-18', amount: 200, donationPolicy: 'campaign-specific', transactionHash: '0xef12345a6789b0cde1234f5678a9b0c1d2e3f456' },
          { date: '2025-03-17', amount: 450, donationPolicy: 'campaign-specific', transactionHash: '0x1234abcd5678ef901234abcd5678ef901234abcd' },
          { date: '2025-03-16', amount: 350, donationPolicy: 'always-donate', transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12', isRecurring: true },
          { date: '2025-03-15', amount: 275, donationPolicy: 'campaign-specific', transactionHash: '0x9876fedc5432ba109876fedc5432ba109876fedc', message: "Keep up the great work!" },
          { date: '2025-03-14', amount: 180, donationPolicy: 'always-donate', transactionHash: '0x0123456789abcdef0123456789abcdef01234567' },
          { date: '2025-03-13', amount: 620, donationPolicy: 'campaign-specific', transactionHash: '0xfedcba9876543210fedcba9876543210fedcba98', message: "This campaign is making a real difference!" },
          { date: '2025-03-12', amount: 420, donationPolicy: 'always-donate', transactionHash: '0x13579bdf2468ace13579bdf2468ace13579bdf24', isRecurring: true },
          { date: '2025-03-11', amount: 150, donationPolicy: 'campaign-specific', transactionHash: '0x24680ace13579bdf24680ace13579bdf24680ace' }
        ],
        weekly: [
          { week: '2025-W12', amount: 1500 },
          { week: '2025-W11', amount: 1200 },
          { week: '2025-W10', amount: 1800 }
        ],
        monthly: [
          { month: '2025-03', amount: 4500 },
          { month: '2025-02', amount: 500 }
        ]
      },
      topDonors: [
        { donorId: 1, name: "John Doe", amount: 2500, lastDonation: "2025-03-20" },
        { donorId: 3, name: "Alice Johnson", amount: 1500, lastDonation: "2025-03-19" },
        { donorId: 4, name: "Robert Chen", amount: 800, lastDonation: "2025-03-17" },
        { donorId: 5, name: "Elena Garcia", amount: 600, lastDonation: "2025-03-13" },
        { donorId: 6, name: "Michael Wong", amount: 400, lastDonation: "2025-03-12" }
      ]
    }
  }
]; 