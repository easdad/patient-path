import React, { useState } from 'react';

const NotificationsPanel = ({ notifications }) => {
  const [notificationsList, setNotificationsList] = useState(notifications);
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(diffInMinutes / (60 * 24));
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const markAsRead = (id) => {
    setNotificationsList(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationsList(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notificationsList.filter(notification => !notification.read).length;

  return (
    <div className="notifications-panel">
      <div className="panel-header">
        <h2>
          Notifications
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </h2>
        <button 
          className="mark-all-read-button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      <div className="notifications-list">
        {notificationsList.length === 0 ? (
          <div className="empty-state">
            <p>No notifications to display</p>
          </div>
        ) : (
          notificationsList.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="notification-content">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{formatTimeAgo(notification.timestamp)}</span>
              </div>
              {!notification.read && (
                <div className="notification-indicator"></div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="notifications-footer">
        <button className="view-all-notifications">View All Notifications</button>
      </div>
    </div>
  );
};

export default NotificationsPanel; 