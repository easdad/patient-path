import { supabase } from '../utils/supabaseClient';

/**
 * Secure data service for handling database operations with proper validation
 */
class DataService {
  /**
   * Fetches profiles with validation and sanitization
   * @param {Object} options - Query options
   * @param {string[]} options.select - Fields to select
   * @param {number} options.limit - Maximum number of records to return
   * @returns {Promise<{data: Array, error: Object}>} - Query result
   */
  async getProfiles(options = {}) {
    try {
      // Validate options
      const select = this.validateSelect(options.select, ['id', 'email', 'user_type', 'full_name', 'created_at']);
      const limit = this.validateLimit(options.limit);
      
      // Build query with validated parameters
      let query = supabase
        .from('profiles')
        .select(select.join(','));
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Fetches transport requests with validation and sanitization
   * @param {Object} options - Query options
   * @param {string[]} options.select - Fields to select
   * @param {number} options.limit - Maximum number of records to return
   * @param {string} options.status - Filter by status
   * @returns {Promise<{data: Array, error: Object}>} - Query result
   */
  async getTransportRequests(options = {}) {
    try {
      // Validate options
      const select = this.validateSelect(options.select, [
        'id', 'hospital_id', 'patient_name', 'status', 
        'created_at', 'pickup_location', 'destination'
      ]);
      const limit = this.validateLimit(options.limit);
      const status = this.validateStatus(options.status);
      
      // Build query with validated parameters
      let query = supabase
        .from('transport_requests')
        .select(select.join(','));
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching transport requests:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Updates a user's type with validation
   * @param {string} userId - User ID to update
   * @param {string} newType - New user type
   * @returns {Promise<{success: boolean, error: Object}>} - Update result
   */
  async updateUserType(userId, newType) {
    try {
      // Validate inputs
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }
      
      const validType = this.validateUserType(newType);
      
      if (!validType) {
        throw new Error('Invalid user type');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: validType })
        .eq('id', userId);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating user type:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Deletes a user with validation
   * @param {string} userId - User ID to delete
   * @returns {Promise<{success: boolean, error: Object}>} - Delete result
   */
  async deleteUser(userId) {
    try {
      // Validate user ID
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Clears all transport requests
   * @returns {Promise<{success: boolean, error: Object}>} - Operation result
   */
  async clearTransportRequests() {
    try {
      // This is a destructive operation, so we need to be careful
      // In a real production app, you might want to archive rather than delete
      const { error } = await supabase
        .from('transport_requests')
        .delete()
        .gte('id', 0); // This deletes all rows
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error clearing transport requests:', error);
      return { success: false, error };
    }
  }
  
  // ============== Validation Helpers ==============
  
  /**
   * Validates and sanitizes select fields
   * @param {string[]} select - Fields to select
   * @param {string[]} allowedFields - Allowed fields
   * @returns {string[]} - Validated fields
   */
  validateSelect(select, allowedFields) {
    if (!select || !Array.isArray(select) || select.length === 0) {
      return allowedFields;
    }
    
    // Filter out any fields not in the allowed list
    return select.filter(field => 
      typeof field === 'string' && allowedFields.includes(field)
    );
  }
  
  /**
   * Validates limit parameter
   * @param {number} limit - Limit value
   * @returns {number|null} - Validated limit
   */
  validateLimit(limit) {
    const parsedLimit = parseInt(limit);
    
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return null;
    }
    
    // Cap the maximum limit for safety
    return Math.min(parsedLimit, 100);
  }
  
  /**
   * Validates status parameter
   * @param {string} status - Status value
   * @returns {string|null} - Validated status
   */
  validateStatus(status) {
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    
    if (!status || typeof status !== 'string' || !validStatuses.includes(status)) {
      return null;
    }
    
    return status;
  }
  
  /**
   * Validates user type
   * @param {string} type - User type
   * @returns {string|null} - Validated user type
   */
  validateUserType(type) {
    const validTypes = ['hospital', 'ambulance'];
    
    if (!type || typeof type !== 'string' || !validTypes.includes(type)) {
      return null;
    }
    
    return type;
  }
}

// Export a singleton instance
const dataService = new DataService();
export default dataService; 