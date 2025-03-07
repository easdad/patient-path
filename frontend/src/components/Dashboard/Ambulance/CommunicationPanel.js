import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../utils/AuthContext';
import './CommunicationPanel.css';

const CommunicationPanel = ({ caseId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch case details to get hospital info
      const { data: caseData, error: caseError } = await supabase
        .from('transport_assignments')
        .select(`
          *,
          transport_request:transport_requests(hospital_id, hospital_name)
        `)
        .eq('id', caseId)
        .single();
      
      if (caseError) throw caseError;
      
      // Fetch messages for this case
      const { data: messagesData, error: messagesError } = await supabase
        .from('case_messages')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      // If no messages exist yet, create a welcome message
      if (messagesData.length === 0) {
        const hospitalName = caseData.transport_request?.hospital_name || 'Hospital';
        const welcomeMessage = {
          id: 'welcome',
          case_id: caseId,
          sender_id: 'system',
          sender_name: 'System',
          sender_type: 'system',
          message: `Welcome to the communication channel with ${hospitalName}. You can use this chat to coordinate the transport.`,
          created_at: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [caseId]);
  
  useEffect(() => {
    fetchMessages();
    
    // Set up real-time listener for new messages
    const messagesChannel = supabase
      .channel('case_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'case_messages',
          filter: `case_id=eq.${caseId}`
        }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [caseId, fetchMessages]);
  
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      const messageData = {
        case_id: caseId,
        sender_id: user.id,
        sender_name: user.user_metadata?.full_name || 'Ambulance Service',
        sender_type: 'ambulance',
        message: newMessage.trim(),
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('case_messages')
        .insert(messageData);
      
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };
  
  const formatTime = (isoString) => {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className="communication-panel">
      <div className="communication-header">
        <h3>Communication Channel</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="messages-container">
        {isLoading ? (
          <div className="loading-spinner">Loading messages...</div>
        ) : (
          <div className="messages-list">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender_type === 'ambulance' ? 'sent' : message.sender_type === 'system' ? 'system' : 'received'}`}
              >
                {message.sender_type !== 'ambulance' && message.sender_type !== 'system' && (
                  <div className="message-sender">{message.sender_name}</div>
                )}
                <div className="message-content">
                  <p>{message.message}</p>
                  <span className="message-time">{formatTime(message.created_at)}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default CommunicationPanel; 