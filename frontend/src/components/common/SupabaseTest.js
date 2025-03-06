import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [error, setError] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState('Not tested');

  useEffect(() => {
    async function testConnection() {
      try {
        // Simple test to check if we can connect to Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setConnectionStatus('Connected successfully to auth service!');
        
        // Check if tables exist by trying to query them
        await testDatabase();
      } catch (err) {
        console.error('Connection test failed:', err);
        setConnectionStatus('Connection failed');
        setError(err.message || 'Unknown error');
      }
    }

    testConnection();
  }, []);

  async function testDatabase() {
    try {
      setDatabaseStatus('Testing database...');
      
      // Try to get the count of profiles
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        if (countError.code === '42P01') { // Table doesn't exist
          setDatabaseStatus("Tables don't exist yet. Please run the SQL setup script first.");
        } else {
          setDatabaseStatus(`Database error: ${countError.message}`);
        }
        return;
      }

      setDatabaseStatus('Database tables configured correctly!');
      setUserCount(count || 0);
    } catch (err) {
      console.error('Database test failed:', err);
      setDatabaseStatus('Database test failed');
      setError(err.message || 'Unknown database error');
    }
  }

  const testSignUp = async () => {
    try {
      setConnectionStatus('Testing sign up...');
      
      // Generate a random email to avoid conflicts
      const testEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'Test12345!',
        options: {
          data: {
            full_name: 'Test User',
            user_type: 'hospital'
          }
        }
      });

      if (error) throw error;
      
      setConnectionStatus(`Sign up successful for ${testEmail}! Check Supabase Auth console.`);

      // Re-test the database after signing up
      setTimeout(() => testDatabase(), 2000);
    } catch (err) {
      console.error('Sign up test failed:', err);
      setConnectionStatus('Sign up test failed');
      setError(err.message || 'Unknown error');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Supabase Connection Test</h1>
      
      <div style={{ 
        padding: '15px', 
        borderRadius: '5px',
        backgroundColor: connectionStatus.includes('failed') ? '#ffeded' : '#efffef',
        marginBottom: '20px'
      }}>
        <h2>Auth Status: {connectionStatus}</h2>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>

      <div style={{ 
        padding: '15px', 
        borderRadius: '5px',
        backgroundColor: databaseStatus.includes('failed') || databaseStatus.includes('error') ? '#ffeded' : 
                        databaseStatus.includes('correctly') ? '#efffef' : '#fff8e6',
        marginBottom: '20px'
      }}>
        <h2>Database Status: {databaseStatus}</h2>
        {userCount !== null && <p>Profiles in database: {userCount}</p>}
      </div>
      
      <div>
        <button 
          onClick={testSignUp}
          style={{
            padding: '10px 15px',
            backgroundColor: '#8e2de2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Sign Up
        </button>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
          This will create a test user in your Supabase project.
        </p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={testDatabase}
          style={{
            padding: '10px 15px',
            backgroundColor: '#ff512f',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Database
        </button>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
          Re-check if the database tables are set up correctly.
        </p>
      </div>

      <h2 style={{ marginTop: '30px' }}>Next Steps</h2>
      <ol>
        <li>
          Verify that the connection status is "Connected successfully"
        </li>
        <li>
          If the database status indicates missing tables, run the SQL script in your Supabase SQL Editor
        </li>
        <li>
          Click "Test Sign Up" to create a test user
        </li>
        <li>
          Check your Supabase Authentication dashboard to confirm the user was created
        </li>
        <li>
          If the database tables are set up correctly, verify that a profile entry was also created in the profiles table
        </li>
      </ol>

      <h3 style={{ marginTop: '20px' }}>SQL Script Location</h3>
      <p>The SQL setup script is located at: <code>patient-path/patient-path/frontend/supabase_setup.sql</code></p>
    </div>
  );
};

export default SupabaseTest; 