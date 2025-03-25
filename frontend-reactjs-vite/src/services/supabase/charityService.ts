import supabase from './supabaseClient';
import { toast } from 'react-toastify';

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
  deadline?: string; // This might be missing from your schema
  image_url?: string; // This might be missing from your schema
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
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) throw new Error('User not authenticated');

      // First get the user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .eq('role', 'charity')
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error('Charity profile not found');

      // Then get the charity profile data
      const { data: profileData, error: profileError } = await supabase
        .from('charity_profiles')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle case where profile doesn't exist yet

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
          .from('donations')
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
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) throw new Error('User not authenticated');

      // Get the charity ID
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
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
  
  // Get charity campaigns
  getCharityCampaigns: async (): Promise<Campaign[]> => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) throw new Error('User not authenticated');

      // Get the charity ID
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
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
        .eq('wallet_address', user.id)
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
        .eq('wallet_address', user.id)
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
        .eq('wallet_address', user.id)
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
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) throw new Error('User not authenticated');

      // Get the charity ID
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
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
  }
}; 