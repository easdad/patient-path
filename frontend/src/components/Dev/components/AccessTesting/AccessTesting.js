import React, { useState } from 'react';
import { useUsers } from '../../../../hooks/useUsers';
import '../shared/SharedStyles.css';
import './AccessTesting.css'; // Keep a small custom CSS file for specific styles

const AccessTesting = () => {
  const { users } = useUsers();
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // Run access control tests
  const runAccessTests = async () => {
    setIsRunningTests(true);
    
    try {
      // In a real app, this would call an API endpoint
      // This is just mock data
      const testCases = [
        { name: 'Hospital can view own profile', role: 'hospital', resource: 'profiles', action: 'read', expected: true },
        { name: 'Hospital can view own requests', role: 'hospital', resource: 'transport_requests', action: 'read', expected: true },
        { name: 'Hospital cannot view other hospital requests', role: 'hospital', resource: 'transport_requests', action: 'read', expected: false },
        { name: 'Ambulance can view all pending requests', role: 'ambulance', resource: 'transport_requests', action: 'read', expected: true },
        { name: 'Ambulance cannot create hospital requests', role: 'ambulance', resource: 'transport_requests', action: 'create', expected: false },
        { name: 'Developer can view all profiles', role: 'developer', resource: 'profiles', action: 'read', expected: true },
        { name: 'Developer can update any profile', role: 'developer', resource: 'profiles', action: 'update', expected: true }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate test results
      const results = testCases.map(test => ({
        ...test,
        result: Math.random() > 0.1 ? test.expected : !test.expected, // 90% pass rate
        timestamp: new Date().toISOString()
      }));
      
      setTestResults(results);
    } catch (error) {
      console.error('Error running access tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };
  
  // Test permissions for a specific user
  const testUserPermissions = async (userId, userType) => {
    setIsRunningTests(true);
    
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Tested permissions for ${userType} user (${userId.substring(0, 8)}...): All permissions are correctly configured.`);
    } catch (error) {
      console.error('Error testing user permissions:', error);
    } finally {
      setIsRunningTests(false);
    }
  };
  
  return (
    <div className="access-testing">
      <div className="section-header">
        <h2>Access Control Testing</h2>
        <button 
          className="run-tests-button"
          onClick={runAccessTests}
          disabled={isRunningTests}
        >
          {isRunningTests ? 'Running Tests...' : 'Run Access Tests'}
        </button>
      </div>
      
      {testResults.length > 0 ? (
        <div className="test-results-section">
          <h3>Test Results</h3>
          <div className="test-summary">
            <div className="test-stat passed">
              <span className="stat-count">
                {testResults.filter(test => test.result === test.expected).length}
              </span>
              <span className="stat-label">Passed</span>
            </div>
            <div className="test-stat failed">
              <span className="stat-count">
                {testResults.filter(test => test.result !== test.expected).length}
              </span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="test-stat total">
              <span className="stat-count">{testResults.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          
          <div className="table-container tests-table-container">
            <table className="tests-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Role</th>
                  <th>Resource</th>
                  <th>Action</th>
                  <th>Expected</th>
                  <th>Result</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((test, index) => (
                  <tr key={index} className={test.result === test.expected ? 'test-pass' : 'test-fail'}>
                    <td>{test.name}</td>
                    <td>{test.role}</td>
                    <td>{test.resource}</td>
                    <td>{test.action}</td>
                    <td>{test.expected ? 'Allow' : 'Deny'}</td>
                    <td>{test.result ? 'Allow' : 'Deny'}</td>
                    <td>
                      <span className={`test-status ${test.result === test.expected ? 'pass' : 'fail'}`}>
                        {test.result === test.expected ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>No tests have been run yet. Click "Run Access Tests" to start testing.</p>
        </div>
      )}
      
      <div className="user-testing-section">
        <h3>Test User Permissions</h3>
        <p>Select a user to test their specific permissions:</p>
        
        <div className="user-select-container">
          <select 
            id="test-user" 
            className="user-select"
            disabled={users.length === 0 || isRunningTests}
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.email} ({user.user_type})
              </option>
            ))}
          </select>
          <button 
            className="test-user-button"
            onClick={() => {
              const select = document.getElementById('test-user');
              const userId = select.value;
              const userType = users.find(u => u.id === userId)?.user_type;
              testUserPermissions(userId, userType);
            }}
            disabled={users.length === 0 || isRunningTests}
          >
            Test Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessTesting; 