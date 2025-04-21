import supabase from './supabaseClient';

// Types based on your Supabase schema
export interface OpenMarketRequest {
  id: string;
  title: string;
  description: string;
  created_by: string;
  status: string;
  created_at: string;
  quotation_count: number;
  deadline?: string;
  has_accepted_quotation?: boolean;
  fund_type: 'general' | 'campaign';
  campaign_id?: string;
}

export interface Quotation {
  // Fields from database
  id: string;
  request_id: string;
  vendor_id: string;
  price: number;
  details: string;
  attachment_url?: string;
  is_accepted: boolean;
  created_at: string;
  
  // Fields we add in our application code but don't exist in the database
  vendor_name: string; // Derived from users table
  is_pinned: boolean; // Used in UI but not stored
  vendor_rating: number; // Used in UI but not stored
  
  // Additional fields for joined data
  request_title?: string; // When joining with OpenMarketRequest
  request_status?: string; // When joining with OpenMarketRequest
  request_deadline?: string; // When joining with OpenMarketRequest
}

export const openMarketService = {
  // Get all requests for the current charity
  getCharityRequests: async (): Promise<OpenMarketRequest[]> => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Get requests for this charity
      const { data, error } = await supabase
        .from('OpenMarketRequest')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format and return data
      return data || [];
    } catch (error) {
      console.error('Error fetching charity requests:', error);
      throw error;
    }
  },

  // Create a new open market request
  createRequest: async (requestData: {
    title: string;
    description: string;
    deadline?: string;
    fund_type: 'general' | 'campaign';
    campaign_id?: string;
  }): Promise<OpenMarketRequest> => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Prepare data for insertion
      const newRequest = {
        title: requestData.title,
        description: requestData.description,
        created_by: user.id,
        status: 'open',
        created_at: new Date().toISOString(),
        quotation_count: 0,
        has_accepted_quotation: false,
        deadline: requestData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days from now
        fund_type: requestData.fund_type,
        campaign_id: requestData.fund_type === 'campaign' ? requestData.campaign_id : null
      };

      // Insert the new request
      const { data, error } = await supabase
        .from('OpenMarketRequest')
        .insert(newRequest)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create request');

      return data;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  },

  // Update a request's status (e.g., when accepting a quotation)
  updateRequestStatus: async (requestId: string, status: string, hasAcceptedQuotation: boolean = false): Promise<void> => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Update the request
      const { error } = await supabase
        .from('OpenMarketRequest')
        .update({ 
          status, 
          has_accepted_quotation: hasAcceptedQuotation 
        })
        .eq('id', requestId)
        .eq('created_by', user.id); // Ensure the user owns this request

      if (error) throw error;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  },

  // Get a single request by ID
  getRequestById: async (requestId: string): Promise<OpenMarketRequest> => {
    try {
      const { data, error } = await supabase
        .from('OpenMarketRequest')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Request not found');

      return data;
    } catch (error) {
      console.error('Error fetching request:', error);
      throw error;
    }
  },

  // Get quotation count for a request
  getQuotationCount: async (requestId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('OpenMarketQuotation') // Changed from 'Quotations' to match the actual database table
        .select('*', { count: 'exact', head: true })
        .eq('request_id', requestId);

      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error fetching quotation count:', error);
      return 0;
    }
  },

  // Get quotations for a specific request
  getQuotations: async (requestId: string): Promise<Quotation[]> => {
    try {
      // First, fetch the quotations without any join
      const { data, error } = await supabase
        .from('OpenMarketQuotation')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get unique vendor IDs to fetch their names separately
      const vendorIds = [...new Set(data.map(q => q.vendor_id))];
      
      // Fetch vendor names in a separate query
      const { data: vendorData, error: vendorError } = await supabase
        .from('users')
        .select('id, name')
        .in('id', vendorIds);
        
      if (vendorError) {
        console.error('Error fetching vendor data:', vendorError);
        // Continue without vendor names if there's an error
      }
      
      // Create a map of vendor IDs to names for quick lookup
      const vendorMap: Record<string, string> = {};
      if (vendorData) {
        vendorData.forEach(vendor => {
          vendorMap[vendor.id] = vendor.name;
        });
      }
      
      // Format the quotations with vendor names from our lookup
      const formattedQuotations = data.map(q => ({
        id: q.id,
        request_id: q.request_id,
        vendor_id: q.vendor_id,
        vendor_name: vendorMap[q.vendor_id] || 'Unknown Vendor',
        price: q.price || 0,
        details: q.details || '',
        attachment_url: q.attachment_url,
        is_accepted: q.is_accepted || false,
        is_pinned: false, // This doesn't exist in DB but is used in the interface
        created_at: q.created_at,
        vendor_rating: 0 // This doesn't exist in DB but is used in the interface
      }));
      
      return formattedQuotations;
    } catch (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }
  },

  // Alias for getQuotations to maintain API compatibility
  getQuotationsByRequestId: async (requestId: string): Promise<Quotation[]> => {
    return openMarketService.getQuotations(requestId);
  },

  // Create a new quotation for a request (vendor view)
  createQuotation: async (quotationData: {
    request_id: string;
    price: number;
    details: string;
    attachment_url?: string;
  }): Promise<Quotation> => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Get the user's name for the quotation
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      
      // Prepare data for insertion
      const newQuotation = {
        request_id: quotationData.request_id,
        vendor_id: user.id,
        price: quotationData.price,
        details: quotationData.details,
        attachment_url: quotationData.attachment_url || null,
        is_accepted: false,
        created_at: new Date().toISOString()
        // Note: is_pinned and vendor_rating don't exist in the DB
      };

      // Insert the new quotation
      const { data, error } = await supabase
        .from('OpenMarketQuotation') // Changed from 'Quotations' to match the actual database table
        .insert(newQuotation)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create quotation');

      // Update the quotation count on the request
      await supabase
        .from('OpenMarketRequest')
        .update({ 
          quotation_count: supabase.rpc('increment', { row_id: quotationData.request_id }) 
        })
        .eq('id', quotationData.request_id);

      // Return the created quotation with additional info
      return {
        id: data.id,
        request_id: data.request_id,
        vendor_id: data.vendor_id,
        vendor_name: userData?.name || 'Unknown Vendor',
        price: data.price,
        details: data.details,
        attachment_url: data.attachment_url,
        is_accepted: data.is_accepted,
        is_pinned: false, // This doesn't exist in DB but is used in the interface
        created_at: data.created_at,
        vendor_rating: 0 // This doesn't exist in DB but is used in the interface
      };
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  },

  // Delete a quotation (vendor view)
  deleteQuotation: async (quotationId: string): Promise<void> => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Get the quotation to check the request_id
      const { data: quotationData, error: getError } = await supabase
        .from('OpenMarketQuotation') // Changed from 'Quotations' to match the actual database table
        .select('request_id')
        .eq('id', quotationId)
        .eq('vendor_id', user.id) // Ensure the user owns this quotation
        .single();

      if (getError) throw getError;
      if (!quotationData) throw new Error('Quotation not found or you do not have permission to delete it');

      // Delete the quotation
      const { error } = await supabase
        .from('OpenMarketQuotation') // Changed from 'Quotations' to match the actual database table
        .delete()
        .eq('id', quotationId)
        .eq('vendor_id', user.id); // Ensure the user owns this quotation

      if (error) throw error;

      // Decrement the quotation count on the request
      await supabase
        .from('OpenMarketRequest')
        .update({ 
          quotation_count: supabase.rpc('decrement', { row_id: quotationData.request_id }) 
        })
        .eq('id', quotationData.request_id);
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  },

  // Get all open market requests (vendor view)
  getAllOpenRequests: async (): Promise<OpenMarketRequest[]> => {
    try {
      // First, fetch all open requests without joining
      const { data, error } = await supabase
        .from('OpenMarketRequest')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get unique creator IDs to fetch their names
      const creatorIds = [...new Set(data.map(req => req.created_by))];
      
      // Fetch user names in a separate query
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .in('id', creatorIds);
        
      if (userError) {
        console.error('Error fetching user data:', userError);
        // Continue with the requests, even if we can't get user names
      }
      
      // Create a map of user IDs to names for quick lookup
      const userMap: Record<string, string> = {};
      if (userData) {
        userData.forEach(user => {
          userMap[user.id] = user.name;
        });
      }
      
      // Format the data with charity names from our lookup
      const formattedRequests = data.map(req => ({
        ...req,
        charity_name: userMap[req.created_by] || 'Unknown Charity'
      }));
      
      return formattedRequests;
    } catch (error) {
      console.error('Error fetching open requests:', error);
      throw error;
    }
  },

  // Get vendor's quotations
  getVendorQuotations: async (): Promise<Quotation[]> => {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Get quotations for this vendor without a join
      const { data, error } = await supabase
        .from('OpenMarketQuotation')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get unique request IDs to fetch request details separately
      const requestIds = [...new Set(data.map(q => q.request_id))];
      
      // Fetch request details in a separate query
      const { data: requestData, error: requestError } = await supabase
        .from('OpenMarketRequest')
        .select('id, title, status, deadline')
        .in('id', requestIds);
        
      if (requestError) {
        console.error('Error fetching request data:', requestError);
        // Continue without request details if there's an error
      }
      
      // Create a map of request IDs to details for quick lookup
      const requestMap: Record<string, any> = {};
      if (requestData) {
        requestData.forEach(req => {
          requestMap[req.id] = {
            title: req.title,
            status: req.status,
            deadline: req.deadline
          };
        });
      }
      
      // Format the data
      const formattedQuotations = data.map(q => ({
        id: q.id,
        request_id: q.request_id,
        vendor_id: q.vendor_id,
        vendor_name: 'You', // It's the vendor's own quotations
        price: q.price,
        details: q.details,
        attachment_url: q.attachment_url,
        is_accepted: q.is_accepted,
        is_pinned: false, // This doesn't exist in DB but is used in the interface
        created_at: q.created_at,
        vendor_rating: 0, // This doesn't exist in DB but is used in the interface
        request_title: requestMap[q.request_id]?.title || 'Unknown Request',
        request_status: requestMap[q.request_id]?.status || 'unknown',
        request_deadline: requestMap[q.request_id]?.deadline
      }));
      
      return formattedQuotations;
    } catch (error) {
      console.error('Error fetching vendor quotations:', error);
      return [];
    }
  }
};

export default openMarketService; 