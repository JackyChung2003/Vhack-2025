import supabase from './supabaseClient';

// Types based on your Supabase schema
export interface Campaign {
  id: string;
  charity_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: string;
  created_at: string;
  deadline: string;
  image_url?: string;
  category?: string; // Adding category field
  charity?: {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    founded?: string;
    location?: string;
    website?: string;
    email?: string;
    phone?: string;
    verified?: boolean;
  };
}

export interface CharityProfile {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  founded?: string;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  wallet_address: string;
  role: string;
  verified: boolean;
  created_at: string;
  // Calculated fields
  totalRaised?: number;
  activeCampaigns?: number;
  supporters?: number;
  communities?: number;
}

export const charityService = {
  // Get the current charity's profile
  getCharityProfile: async (): Promise<CharityProfile> => {
    try {
      // Get current authenticated user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // First get the user data from users table using auth id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'charity')
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error('Charity profile not found');

      // Then get the charity profile data
      let { data: profileData, error: profileError } = await supabase
        .from('charity_profiles')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle case where profile doesn't exist yet
      
      // If profile doesn't exist, create a new one automatically
      if (!profileData) {
        console.log('No charity profile found, creating a default one');
        
        // Create a default charity profile
        const defaultProfile = {
          user_id: userData.id,
          description: `${userData.name}'s charity organization`,
          founded: new Date().getFullYear().toString(),
          location: '',
          website: '',
          email: user.email || userData.email || '',
          phone: '',
          created_at: new Date().toISOString()
        };
        
        // Insert the default profile
        const { data: newProfile, error: insertError } = await supabase
          .from('charity_profiles')
          .insert(defaultProfile)
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating default charity profile:', insertError);
          // Continue without the profile - we'll still return the user data
        } else {
          // If successfully created, use this as the profile data
          profileData = newProfile;
        }
      }

      // Get additional stats
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, current_amount, status')
        .eq('charity_id', userData.id);
      
      if (campaignsError) throw campaignsError;
      
      // Get unique donors count using the two-step approach
      const campaignIds = campaignsData?.map(campaign => campaign.id) || [];
      
      let supporters = 0;
      if (campaignIds.length > 0) {
        const { data: donorsData, error: donorsError } = await supabase
          .from('campaign_donations')
          .select('user_id')
          .in('campaign_id', campaignIds)
          .not('user_id', 'is', null);
        
        if (donorsError) throw donorsError;
        
        supporters = new Set(donorsData?.map(donation => donation.user_id)).size || 0;
      }
      
      // Calculate stats
      const totalRaised = campaignsData?.reduce((sum, campaign) => sum + (campaign.current_amount || 0), 0) || 0;
      const activeCampaigns = campaignsData?.filter(campaign => campaign.status === 'active').length || 0;
      
      // Combine the data
      return {
        ...userData,
        ...(profileData || {}),
        totalRaised,
        activeCampaigns,
        supporters,
        communities: 0
      };
    } catch (error) {
      console.error('Error fetching charity profile:', error);
      throw error;
    }
  },
  
  // Update charity profile
  updateCharityProfile: async (profileData: Partial<CharityProfile>): Promise<CharityProfile> => {
    try {
      // Get current authenticated user 
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Get the charity ID
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('role', 'charity')
        .single();

      if (profileError || !userData) {
        throw new Error('Charity profile not found');
      }
      
      // Split data between users and charity_profiles tables
      const { name, wallet_address, role, verified, id, ...charitySpecificData } = profileData;
      
      // Remove calculated fields
      const { totalRaised, activeCampaigns, supporters, communities, ...updateCharityData } = charitySpecificData;
      
      // Update basic user info
      if (name) {
        const { error: userError } = await supabase
          .from('users')
          .update({ name })
          .eq('id', userData.id);
        
        if (userError) throw userError;
      }
      
      // Check if charity profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('charity_profiles')
        .select('user_id')
        .eq('user_id', userData.id)
        .maybeSingle();
      
      // Update or insert charity profile based on whether it exists
      let charityError;
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('charity_profiles')
          .update(updateCharityData)
          .eq('user_id', userData.id);
        
        charityError = error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('charity_profiles')
          .insert({ user_id: userData.id, ...updateCharityData });
        
        charityError = error;
      }
      
      if (charityError) throw charityError;
      
      // Return the updated profile with stats
      return await charityService.getCharityProfile();
    } catch (error) {
      console.error('Error updating charity profile:', error);
      throw error;
    }
  },
  
  // Get campaign by ID
  getCampaignById: async (id: string): Promise<Campaign> => {
    try {
      // First get the campaign with basic user info
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          users!fk_campaigns_charity (
            id,
            name,
            verified,
            wallet_address,
            role
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Campaign not found');
      
      // Then get the charity profile data
      const { data: profileData, error: profileError } = await supabase
        .from('charity_profiles')
        .select(`
          description,
          logo,
          founded,
          location,
          website,
          email,
          phone
        `)
        .eq('user_id', data.users.id)
        .maybeSingle();
      
      // Combine data from both tables
      const charity = {
        ...data.users,
        ...(profileData || {})
      };
      
      // Create the final campaign object
      const campaign = {
        ...data,
        charity
      };
      delete campaign.users;
      
      return campaign;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },
  
  // Get charity campaigns
  getCharityCampaigns: async (): Promise<Campaign[]> => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Get the charity ID
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('role', 'charity')
        .single();

      if (profileError || !userData) {
        throw new Error('Charity profile not found');
      }

      // Get campaigns for this charity
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('charity_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching charity campaigns:', error);
      throw error;
    }
  },
  
  // Create new campaign
  createCampaign: async (campaignData: FormData): Promise<Campaign> => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      
      // Get the charity ID
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('role', 'charity')
        .single();
      
      if (profileError || !userData) {
        throw new Error('Charity profile not found');
      }
      
      // Extract data from FormData
      const title = campaignData.get('name') as string;
      const description = campaignData.get('description') as string;
      const target_amount = parseFloat(campaignData.get('goal') as string);
      const deadline = campaignData.get('deadline') as string;
      const imageFile = campaignData.get('image') as File;
      
      let image_url = null;
      
      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `campaign-images/${userData.id}/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('campaign-assets')
          .upload(filePath, imageFile);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('campaign-assets')
          .getPublicUrl(filePath);
        
        image_url = urlData.publicUrl;
      }
      
      // Create the campaign
      const { data, error } = await supabase
        .from('campaigns')
        .insert([
          {
            charity_id: userData.id,
            title,
            description,
            target_amount,
            current_amount: 0,
            status: 'active',
            deadline,
            image_url
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },
  
  // Update campaign
  updateCampaign: async (id: string, campaignData: FormData): Promise<Campaign> => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      
      // Get the charity ID
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('role', 'charity')
        .single();
      
      if (profileError || !userData) {
        throw new Error('Charity profile not found');
      }
      
      // Check if campaign belongs to this charity
      const { data: campaignCheck, error: campaignError } = await supabase
        .from('campaigns')
        .select('charity_id')
        .eq('id', id)
        .single();
      
      if (campaignError || !campaignCheck) {
        throw new Error('Campaign not found');
      }
      
      if (campaignCheck.charity_id !== userData.id) {
        throw new Error('You do not have permission to update this campaign');
      }
      
      // Extract data from FormData
      const title = campaignData.get('name') as string;
      const description = campaignData.get('description') as string;
      const target_amount = parseFloat(campaignData.get('goal') as string);
      const deadline = campaignData.get('deadline') as string;
      const imageFile = campaignData.get('image') as File;
      const status = campaignData.get('status') as string || 'active';
      
      let image_url = undefined;
      
      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `campaign-images/${userData.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('campaign-assets')
          .upload(filePath, imageFile);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('campaign-assets')
          .getPublicUrl(filePath);
        
        image_url = urlData.publicUrl;
      }
      
      // Prepare update data
      const updateData: any = {
        title,
        description,
        target_amount,
        status
      };
      
      if (deadline) updateData.deadline = deadline;
      if (image_url) updateData.image_url = image_url;
      
      // Update the campaign
      const { data, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },
  
  // Delete campaign
  deleteCampaign: async (id: string): Promise<void> => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      
      // Get the charity ID
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('role', 'charity')
        .single();
      
      if (profileError || !userData) {
        throw new Error('Charity profile not found');
      }
      
      // Check if campaign belongs to this charity
      const { data: campaignCheck, error: campaignError } = await supabase
        .from('campaigns')
        .select('charity_id, image_url')
        .eq('id', id)
        .single();
      
      if (campaignError || !campaignCheck) {
        throw new Error('Campaign not found');
      }
      
      if (campaignCheck.charity_id !== userData.id) {
        throw new Error('You do not have permission to delete this campaign');
      }
      
      // Delete the campaign image if it exists
      if (campaignCheck.image_url) {
        const imagePath = campaignCheck.image_url.split('/').slice(-2).join('/');
        await supabase.storage
          .from('campaign-assets')
          .remove([imagePath]);
      }
      
      // Delete the campaign
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },
  
  // Upload logo
  uploadLogo: async (imageFile: File): Promise<string> => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Get the charity ID
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('role', 'charity')
        .single();

      if (profileError || !userData) {
        throw new Error('Charity profile not found');
      }

      // Generate a unique filename
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `charity-logos/${userData.id}/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('charity-assets')
        .upload(filePath, imageFile);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('charity-assets')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },
  
  // Get all public campaigns
  getAllCampaigns: async (): Promise<Campaign[]> => {
    try {
      // Get all active campaigns with charity information
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          users!fk_campaigns_charity (
            id,
            name,
            verified,
            wallet_address,
            role
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format campaigns with charity information
      const formattedCampaigns = await Promise.all((data || []).map(async (campaign) => {
        // Get charity profile data
        const { data: profileData } = await supabase
          .from('charity_profiles')
          .select(`
            description,
            logo,
            founded,
            location,
            website,
            email,
            phone
          `)
          .eq('user_id', campaign.users.id)
          .maybeSingle();
        
        // Combine charity data
        const charity = {
          ...campaign.users,
          ...(profileData || {})
        };
        
        // Create the final campaign object
        const formattedCampaign = {
          ...campaign,
          charity
        };
        delete formattedCampaign.users;
        
        return formattedCampaign;
      }));
      
      return formattedCampaigns || [];
    } catch (error) {
      console.error('Error fetching all campaigns:', error);
      throw error;
    }
  },
  
  // Get all public charity organizations
  getAllCharityOrganizations: async () => {
    try {
      // Instead of using nested relationships which are causing ambiguity,
      // fetch users and charity profiles separately and join them in code
      
      // First, get all charity users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, verified, wallet_address, role')
        .eq('role', 'charity')
        .order('name');
      
      if (usersError) throw usersError;
      if (!usersData || usersData.length === 0) return [];
      
      // Then get charity profiles for these users
      const userIds = usersData.map(user => user.id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('charity_profiles')
        .select('user_id, description, logo, founded, location, website, email, phone')
        .in('user_id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Create a map of profiles by user_id for easier lookup
      const profilesMap: Record<string, any> = (profilesData || []).reduce((map: Record<string, any>, profile) => {
        map[profile.user_id] = profile;
        return map;
      }, {});
      
      // Get campaign statistics for each charity
      const organizations = await Promise.all(usersData.map(async (user) => {
        // Get campaign statistics
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, status, current_amount')
          .eq('charity_id', user.id);
        
        if (campaignsError) throw campaignsError;
        
        // Get the profile data for this user
        const profile = profilesMap[user.id] || {};
        
        const totalRaised = campaignsData?.reduce((sum, campaign) => sum + (campaign.current_amount || 0), 0) || 0;
        const activeCampaigns = campaignsData?.filter(campaign => campaign.status === 'active').length || 0;
        const totalCampaigns = campaignsData?.length || 0;
        
        // Combine the data
        return {
          id: user.id,
          name: user.name,
          verified: user.verified,
          description: profile.description || '',
          logo: profile.logo || null,
          founded: profile.founded || '',
          location: profile.location || '',
          totalRaised,
          campaigns: totalCampaigns,
          activeCampaigns
        };
      }));
      
      return organizations;
    } catch (error) {
      console.error('Error fetching charity organizations:', error);
      throw error;
    }
  },
  
  // Get a single charity organization by ID
  getCharityOrganizationById: async (id: string) => {
    try {
      // Get the user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, verified, wallet_address, role')
        .eq('id', id)
        .eq('role', 'charity')
        .single();
      
      if (userError) throw userError;
      if (!userData) throw new Error('Charity organization not found');
      
      // Get the charity profile
      const { data: profileData, error: profileError } = await supabase
        .from('charity_profiles')
        .select('description, logo, founded, location, website, email, phone')
        .eq('user_id', userData.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      
      // Get campaign statistics
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, status, current_amount, title, description, target_amount, deadline, image_url, category')
        .eq('charity_id', userData.id);
      
      if (campaignsError) throw campaignsError;
      
      const totalRaised = campaignsData?.reduce((sum, campaign) => sum + (campaign.current_amount || 0), 0) || 0;
      const activeCampaigns = campaignsData?.filter(campaign => campaign.status === 'active').length || 0;
      const totalCampaigns = campaignsData?.length || 0;
      
      // Combine the data
      return {
        id: userData.id,
        name: userData.name,
        verified: userData.verified,
        description: profileData?.description || '',
        logo: profileData?.logo || null,
        founded: profileData?.founded || '',
        location: profileData?.location || '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
        website: profileData?.website || '',
        totalRaised,
        campaigns: totalCampaigns,
        activeCampaigns,
        campaignsList: campaignsData || []
      };
    } catch (error) {
      console.error('Error fetching charity organization by ID:', error);
      throw error;
    }
  },
  
  // Make a donation to a campaign or charity
  makeDonation: async (donationData: {
    campaignId?: string; // Optional - if not provided, it's a general donation to the charity
    charityId: string;
    amount: number;
    donationPolicy?: string;
    message?: string;
    donorName?: string;
    donorEmail?: string;
    isAnonymous?: boolean;
    isRecurring?: boolean;
  }) => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Determine whether this is a campaign donation or a general charity donation
      if (donationData.campaignId) {
        // This is a campaign donation
        console.log(`Processing campaign donation to campaign ID: ${donationData.campaignId}`);
        
        // Verify the campaign exists and get its current amount
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('charity_id, current_amount')
          .eq('id', donationData.campaignId)
          .single();
          
        if (campaignError) {
          console.error('Error verifying campaign:', campaignError);
          throw new Error('Campaign not found');
        }
        
        // Create donation record for a campaign donation
        // For campaign donations, we ONLY include campaign_id and NOT charity_id
        // This is likely what the constraint is enforcing
        const donationRecord = {
          user_id: user.id,
          campaign_id: donationData.campaignId,
          amount: donationData.amount,
          donation_policy: donationData.donationPolicy || null,
          transaction_hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          message: donationData.message || null,
          donor_name: donationData.donorName || null,
          donor_email: donationData.donorEmail || null,
          is_anonymous: donationData.isAnonymous || false,
          is_recurring: donationData.isRecurring || false,
          status: 'completed',
          created_at: new Date().toISOString()
        };
        
        console.log('Submitting campaign donation record:', donationRecord);
        
        // Insert the campaign donation record
        const { data, error } = await supabase
          .from('campaign_donations')
          .insert(donationRecord)
          .select()
          .single();
          
        if (error) {
          console.error('Campaign donation insertion error:', error);
          throw error;
        }
        
        // Calculate new amount
        const newAmount = campaignData.current_amount + donationData.amount;
        
        // Try to update the campaign amount using a simple patch operation
        console.log(`Updating campaign ${donationData.campaignId} amount from ${campaignData.current_amount} to ${newAmount}`);
        
        try {
          // Use a basic update (patch) operation that only changes current_amount
          const { error: updateError } = await supabase
            .from('campaigns')
            .update({ current_amount: newAmount })
            .eq('id', donationData.campaignId);
          
          if (updateError) {
            console.error('Error updating campaign amount:', updateError);
            console.warn('Campaign donation was recorded, but campaign amount could not be updated automatically.');
            console.info('The current_amount will need to be updated manually or through a database trigger.');
          } else {
            console.log('Campaign amount updated successfully');
          }
        } catch (err) {
          console.error('Exception during campaign update:', err);
          console.warn('Campaign donation was recorded, but campaign amount could not be updated.');
        }
        
        return data;
      } 
      else {
        // This is a general charity donation
        console.log(`Processing general charity donation to charity ID: ${donationData.charityId}`);
        
        // Verify the charity exists
        const { data: charityData, error: charityError } = await supabase
          .from('users')
          .select('id')
          .eq('id', donationData.charityId)
          .eq('role', 'charity')
          .single();
          
        if (charityError) {
          console.error('Error verifying charity:', charityError);
          throw new Error('Charity not found');
        }
        
        // Create donation record for a general charity donation
        // For charity donations, we ONLY include charity_id and NOT campaign_id
        const donationRecord = {
          user_id: user.id,
          charity_id: donationData.charityId,
          amount: donationData.amount,
          transaction_hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          message: donationData.message || null,
          donor_name: donationData.donorName || null,
          donor_email: donationData.donorEmail || null,
          is_anonymous: donationData.isAnonymous || false,
          is_recurring: donationData.isRecurring || false,
          status: 'completed',
          created_at: new Date().toISOString()
        };
        
        console.log('Submitting charity donation record:', donationRecord);
        
        // Insert the charity donation record
        const { data, error } = await supabase
          .from('campaign_donations')
          .insert(donationRecord)
          .select()
          .single();
          
        if (error) {
          console.error('Charity donation insertion error:', error);
          throw error;
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error making donation:', error);
      throw error;
    }
  },
  
  // Get charity's general fund donations
  getCharityGeneralFund: async (charityId: string): Promise<{ totalAmount: number, donationsCount: number }> => {
    try {
      // Get general donations (where charity_id is set but campaign_id is null)
      const { data, error } = await supabase
        .from('campaign_donations')
        .select('amount')
        .eq('charity_id', charityId)
        .is('campaign_id', null);
      
      if (error) throw error;
      
      const totalAmount = data?.reduce((sum, donation) => sum + (donation.amount || 0), 0) || 0;
      const donationsCount = data?.length || 0;
      
      return { totalAmount, donationsCount };
    } catch (error) {
      console.error('Error fetching charity general fund:', error);
      throw error;
    }
  },
  
  // Get campaign donation statistics including leaderboard
  getCampaignDonationStats: async (campaignId: string): Promise<{
    donations: {
      total: number;
      count: number;
      campaignSpecificTotal: number;
      alwaysDonateTotal: number;
      timeline: {
        daily: Array<{ date: string; amount: number; donationPolicy?: string; isRecurring?: boolean }>;
        weekly: Array<{ week: string; amount: number }>;
        monthly: Array<{ month: string; amount: number }>;
      };
      topDonors: Array<{
        donorId: number | string;
        name: string;
        amount: number;
        lastDonation: string;
      }>;
    }
  }> => {
    try {
      // Get all donations for this campaign
      const { data: donationsData, error: donationsError } = await supabase
        .from('campaign_donations')
        .select(`
          id,
          amount,
          donation_policy,
          is_recurring,
          is_anonymous,
          created_at,
          user_id,
          users:user_id (
            id,
            name
          )
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      
      if (donationsError) throw donationsError;
      
      // Calculate total donations and counts
      const total = donationsData?.reduce((sum, donation) => sum + (donation.amount || 0), 0) || 0;
      const count = donationsData?.length || 0;
      
      // Calculate policy-specific totals
      const campaignSpecificTotal = donationsData?.reduce((sum, donation) => 
        sum + ((donation.donation_policy === 'campaign-specific' ? donation.amount : 0) || 0), 0) || 0;
      const alwaysDonateTotal = donationsData?.reduce((sum, donation) => 
        sum + ((donation.donation_policy === 'always-donate' ? donation.amount : 0) || 0), 0) || 0;
      
      // Generate timeline data
      const timelineData = {
        daily: [] as Array<{ date: string; amount: number; donationPolicy?: string; isRecurring?: boolean }>,
        weekly: [] as Array<{ week: string; amount: number }>,
        monthly: [] as Array<{ month: string; amount: number }>
      };
      
      // Process donations for timeline
      if (donationsData) {
        // Group by date for daily view
        const dailyMap = new Map<string, { amount: number; donationPolicy?: string; isRecurring?: boolean }>();
        const weeklyMap = new Map<string, number>();
        const monthlyMap = new Map<string, number>();
        
        donationsData.forEach(donation => {
          const date = new Date(donation.created_at);
          const dateStr = date.toISOString().split('T')[0];
          const weekStr = `${dateStr.slice(0, 7)}-W${Math.ceil(date.getDate() / 7)}`;
          const monthStr = dateStr.slice(0, 7);
          
          // Daily aggregation
          const existing = dailyMap.get(dateStr) || { amount: 0 };
          dailyMap.set(dateStr, {
            amount: existing.amount + donation.amount,
            donationPolicy: donation.donation_policy || undefined,
            isRecurring: donation.is_recurring
          });
          
          // Weekly aggregation
          weeklyMap.set(weekStr, (weeklyMap.get(weekStr) || 0) + donation.amount);
          
          // Monthly aggregation
          monthlyMap.set(monthStr, (monthlyMap.get(monthStr) || 0) + donation.amount);
        });
        
        // Convert maps to arrays for timeline
        timelineData.daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
          date,
          ...data
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7); // Last 7 days
        
        timelineData.weekly = Array.from(weeklyMap.entries()).map(([week, amount]) => ({
          week,
          amount
        })).sort((a, b) => b.week.localeCompare(a.week)).slice(0, 4); // Last 4 weeks
        
        timelineData.monthly = Array.from(monthlyMap.entries()).map(([month, amount]) => ({
          month,
          amount
        })).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6); // Last 6 months
      }
      
      // Generate top donors list
      // First aggregate donations by donor
      const donorMap = new Map<string, {
        donorId: string;
        name: string;
        amount: number;
        lastDonation: string;
      }>();
      
      donationsData?.forEach(donation => {
        if (donation.is_anonymous) return; // Skip anonymous donations for leaderboard
        
        const donorId = donation.user_id;
        const name = donation.users && typeof donation.users === 'object' && 'name' in donation.users 
          ? String(donation.users.name) 
          : 'Anonymous Donor';
        
        if (donorMap.has(donorId)) {
          const donor = donorMap.get(donorId)!;
          donor.amount += donation.amount;
          
          // Update last donation date if this one is more recent
          if (new Date(donation.created_at) > new Date(donor.lastDonation)) {
            donor.lastDonation = donation.created_at;
          }
        } else {
          donorMap.set(donorId, {
            donorId,
            name,
            amount: donation.amount,
            lastDonation: donation.created_at
          });
        }
      });
      
      // Convert to array and sort by amount (highest first)
      const topDonors = Array.from(donorMap.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Top 5 donors
      
      return {
        donations: {
          total,
          count,
          campaignSpecificTotal,
          alwaysDonateTotal,
          timeline: timelineData,
          topDonors
        }
      };
    } catch (error) {
      console.error('Error fetching campaign donation stats:', error);
      throw error;
    }
  },
}; 