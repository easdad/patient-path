import React from 'react';
import { useUsers } from '../../../../hooks/useUsers';
import { useDashboard } from '../../../../contexts/DashboardContext';
import '../shared/SharedStyles.css';

const UserManagement = () => {
  const { refreshTrigger } = useDashboard();
  const { users, isLoading, error, deleteUser, changeUserType } = useUsers(refreshTrigger);
  
  if (isLoading) {
    return <div className="loading-indicator">Loading users...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="user-management">
      <div className="section-header">
        <h2>User Management</h2>
        <div className="user-count">
          Total Users: <span>{users.length}</span>
        </div>
      </div>
      
      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <div className="table-container users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Type</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="user-id">{user.id.substring(0, 8)}...</td>
                  <td>{user.email}</td>
                  <td>{user.full_name || '—'}</td>
                  <td>
                    <select 
                      value={user.user_type} 
                      onChange={(e) => changeUserType(user.id, e.target.value)}
                      className="user-type-select"
                    >
                      <option value="hospital">Hospital</option>
                      <option value="ambulance">Ambulance</option>
                    </select>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="clear-button"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 