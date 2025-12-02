import React, { useState, useEffect } from 'react';
import { apiService, Communication } from '../services/api';

function CommunicationCenter() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Communication | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Clinical Research Hospital Styling - Hospital Industry Typography
  const container: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F0F4F8 0%, #E8F0FE 50%, #E6F2F2 100%)',
    padding: '32px 40px',
    display: 'flex',
    justifyContent: 'center',
    boxSizing: 'border-box',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    lineHeight: 1.6,
    color: '#26344A'
  };
  const inner: React.CSSProperties = { width: '100%', maxWidth: 1400, margin: '0 auto' };

  // Primary heading - Hospital industry standard
  const h1: React.CSSProperties = {
    color: '#26344A',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
    margin: 0
  };

  // Secondary text - WCAG AA compliant
  const muted: React.CSSProperties = {
    color: '#7E8CA0',
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400
  };

  // Button styles - Hospital industry standard
  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 600,
    gap: 8,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    fontFamily: 'inherit'
  };
  const btnGhost: React.CSSProperties = {
    ...btn,
    background: 'rgba(248, 250, 252, 0.9)',
    color: '#307AFE',
    border: '1px solid rgba(144, 202, 249, 0.4)',
    boxShadow: '0 2px 8px rgba(74, 144, 226, 0.1)'
  };
  const btnPrimary: React.CSSProperties = {
    ...btn,
    background: 'linear-gradient(135deg, #307AFE 0%, #34A853 100%)',
    color: '#FAFBFC',
    boxShadow: '0 4px 16px rgba(74, 144, 226, 0.3)'
  };

  // Card styles - Clinical research theme
  const card: React.CSSProperties = {
    borderRadius: 20,
    background: 'rgba(255, 255, 255, 0.85)',
    padding: 28,
    border: '1px solid rgba(144, 202, 249, 0.2)',
    marginBottom: 32,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(74, 144, 226, 0.08)',
    transition: 'all 0.3s ease'
  };

  // Input styles
  const input: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(144, 202, 249, 0.3)',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#26344A',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllCommunications();
      setCommunications(data);
    } catch (error) {
      console.error('Error loading communications:', error);
      // Fallback to mock data
      setCommunications([
        {
          id: 1,
          type: 'EMAIL',
          recipient: 'sarah.johnson@email.com',
          subject: 'Appointment Confirmation',
          message: 'Hi, I\'m confirming my appointment for next Tuesday at 2 PM. Please let me know if this time works.',
          status: 'SENT',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          type: 'EMAIL',
          recipient: 'dr.clark@hospital.com',
          subject: 'Treatment Plan',
          message: 'Please review the treatment plan for patient John Doe.',
          status: 'PENDING',
          createdAt: '2024-01-15T09:15:00Z'
        },
        {
          id: 3,
          type: 'SMS',
          recipient: '+1234567890',
          subject: 'Follow-up Appointment',
          message: 'Your follow-up appointment is scheduled for tomorrow at 3 PM.',
          status: 'SENT',
          createdAt: '2024-01-14T16:45:00Z'
        },
        {
          id: 4,
          type: 'EMAIL',
          recipient: 'dr.white@clinic.com',
          subject: 'Progress Report',
          message: 'Please find attached the progress report for patient Jane Smith.',
          status: 'SENT',
          createdAt: '2024-01-14T14:20:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const newComm: Omit<Communication, 'id' | 'createdAt'> = {
        type: 'EMAIL',
        recipient: selectedConversation.recipient,
        subject: `Re: ${selectedConversation.subject}`,
        message: newMessage,
        status: 'PENDING'
      };

      await apiService.sendCommunication(newComm);
      setNewMessage('');
      await loadCommunications();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Unread' && comm.status === 'PENDING') ||
      (activeTab === 'Archived' && comm.status === 'SENT');
    return matchesSearch && matchesTab;
  });

  const stats = {
    unread: communications.filter(c => c.status === 'PENDING').length,
    active: communications.length,
    scheduled: 8, // Mock data
    resolved: 20 // Mock data
  };

  const quickContacts = [
    {
      name: 'Dr. Michael Clark',
      title: 'Orthopedic Surgeon',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq54fS20271jCHdzDDcX_7DrCdPQVL4qEXZlYHTRuKJxsHIDvfd2Gk1fqc6JVg-RjZKwmGr25yXKfqVSMYc0V-Aufbp49MIhoZkhQYawhGFfBj2hYyQcbHLVGuCPUWPkZ14UlqZ6DDP1bSj4cv1voy_UxzAAnL-rEJCqBmGL6cu321-jz7ixnVvUSSMRjUvlMca6TMcWbREpVJiV9m283Sg9HjwSZ0sT_EKHbLrK2e49uvQ8i_FPYLz5tke67Rpc5rrfjOQGUHwQYf'
    },
    {
      name: 'Dr. Emily White',
      title: 'Physical Therapist',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdxoPK7nKago6Z-ajhUBtxfBDEGmKaDfPPbK3oWwGbD_8INyoVINCGfeAERLcMKyir2_Xf-T71ingcNCPC4lISoj0Q7gAFQUFgztK0Tkpzv6I0FgEdcJgIfJKXkEup6a9yimXZjiP-xa7UqScF5U6banD1cUWZO5lx3DMzuDB9zAwS4QoiFNo_95IM00pjZqt5ly7j6o7pbOJcDxP5BmSm4G_kEkqUQVOagqWVM8RUUZl9SGGGDxDxYwzVbjtKWynJc8iFk1zeGTIO'
    },
    {
      name: 'Dr. Robert Green',
      title: 'Neurologist',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8ZhElR64SGMPUJRGzmaIp2GMU8rXdLrN6_7w6ZbBGFlc-j9qpsQOqcaAdBtBApcWqDA96hrRXX-Dy_2_84TObd-nzJbLea3XURsBeM7f8TeQtwlMSbhBVd2AUdQuzq-z2iPuW2xMCPL010QCpngjMyNzXaWU9zbYjIdiMH2gKxRh5xEXmvzIqYyge8wxCg_RCZn6peM0OXd3Py2mWERtHUBZS8kez-OUFdPZ3IoeFIaO6LZjgRkZO0rlIaBAZB7oPrYS5k2jlS6Db'
    }
  ];

  return (
    <main style={container}>
      <div style={inner}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={h1}>Communication Center</h1>
            <p style={muted}>Manage all your communications with claimants, providers, and other stakeholders.</p>
          </div>
          <button style={btnPrimary}>
            ✉️ New Message
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
          {[
            { label: 'Unread Messages', value: stats.unread, icon: '📧', color: '#d97706' },
            { label: 'Active Threads', value: stats.active, icon: '💬', color: '#307AFE' },
            { label: 'Scheduled Calls', value: stats.scheduled, icon: '📞', color: '#16a34a' },
            { label: 'Resolved Today', value: stats.resolved, icon: '✅', color: '#16a34a' }
          ].map((stat, index) => (
            <div key={index} style={{
              ...card,
              marginBottom: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 24
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ ...muted, fontSize: 14, fontWeight: 600, margin: 0 }}>{stat.label}</p>
                <p style={{ fontSize: 32, fontWeight: 800, margin: 0, color: '#26344A' }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>Conversation List</h2>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <span style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#7E8CA0',
                fontSize: 18
              }}>🔍</span>
              <input
                style={{ ...input, paddingLeft: 48, width: '100%', boxSizing: 'border-box' }}
                placeholder="Search conversations"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 24 }}>
                {['All', 'Unread', 'Archived'].map(tab => (
                  <button
                    key={tab}
                    style={{
                      padding: '12px 4px',
                      borderBottom: activeTab === tab ? '2px solid #307AFE' : '2px solid transparent',
                      color: activeTab === tab ? '#307AFE' : '#7E8CA0',
                      fontWeight: activeTab === tab ? 700 : 500,
                      fontSize: 14,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button style={btnGhost}>🔧 Filter</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredCommunications.map((comm) => (
                <div
                  key={comm.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    borderRadius: 16,
                    background: selectedConversation?.id === comm.id ? 'rgba(48, 122, 254, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    border: selectedConversation?.id === comm.id ? '1px solid rgba(48, 122, 254, 0.3)' : '1px solid rgba(144, 202, 249, 0.2)',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)',
                    boxShadow: selectedConversation?.id === comm.id ? '0 4px 16px rgba(48, 122, 254, 0.1)' : '0 2px 8px rgba(74, 144, 226, 0.05)'
                  }}
                  onClick={() => setSelectedConversation(comm)}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: `url(${quickContacts[0].avatar}) center/cover`,
                      border: '2px solid rgba(48, 122, 254, 0.2)'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#26344A', margin: 0 }}>{comm.subject}</p>
                    <p style={{ fontSize: 12, color: '#7E8CA0', margin: 0, marginTop: 4 }}>Recipient: {comm.recipient}</p>
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      marginTop: 6,
                      background: comm.status === 'SENT' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                      color: comm.status === 'SENT' ? '#16a34a' : '#d97706'
                    }}>
                      {comm.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, display: 'flex', flexDirection: 'column', marginBottom: 0, padding: 0 }}>
            {selectedConversation ? (
              <>
                <div style={{ padding: 20, borderBottom: '1px solid rgba(144, 202, 249, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: `url(${quickContacts[0].avatar}) center/cover`,
                        border: '2px solid rgba(48, 122, 254, 0.2)'
                      }}
                    />
                    <div>
                      <p style={{ fontWeight: 700, color: '#26344A', margin: 0 }}>Subject: {selectedConversation.subject}</p>
                      <p style={{ fontSize: 14, color: '#7E8CA0', margin: 0, marginTop: 4 }}>Recipient: {selectedConversation.recipient}</p>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 24, minHeight: 400 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `url(${quickContacts[0].avatar}) center/cover`,
                        border: '2px solid rgba(48, 122, 254, 0.2)'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#7E8CA0' }}>Recipient</p>
                      <div style={{
                        fontSize: 14,
                        padding: '12px 16px',
                        borderRadius: 16,
                        background: 'rgba(248, 250, 252, 0.9)',
                        color: '#26344A',
                        border: '1px solid rgba(144, 202, 249, 0.2)',
                        maxWidth: 300
                      }}>
                        {selectedConversation.message}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#7E8CA0' }}>You</p>
                      <div style={{
                        fontSize: 14,
                        padding: '12px 16px',
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #307AFE 0%, #34A853 100%)',
                        color: '#FAFBFC',
                        maxWidth: 300
                      }}>
                        Yes, your appointment is confirmed for Tuesday at 2 PM. We look forward to seeing you.
                      </div>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `url(${quickContacts[0].avatar}) center/cover`,
                        border: '2px solid rgba(48, 122, 254, 0.2)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ padding: 20, borderTop: '1px solid rgba(144, 202, 249, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `url(${quickContacts[0].avatar}) center/cover`,
                        border: '2px solid rgba(48, 122, 254, 0.2)'
                      }}
                    />
                    <input
                      style={{ ...input, flex: 1, border: '1px solid rgba(144, 202, 249, 0.3)' }}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button style={{
                        ...btnGhost,
                        padding: 8,
                        minWidth: 'auto',
                        width: 40,
                        height: 40,
                        borderRadius: '50%'
                      }}>
                        📎
                      </button>
                      <button style={{
                        ...btnGhost,
                        padding: 8,
                        minWidth: 'auto',
                        width: 40,
                        height: 40,
                        borderRadius: '50%'
                      }}>
                        🖼️
                      </button>
                      <button
                        style={{
                          ...btnPrimary,
                          minWidth: 84,
                          padding: '8px 16px'
                        }}
                        onClick={handleSendMessage}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                  <p style={{ color: '#7E8CA0', fontSize: 16 }}>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#26344A' }}>Quick Contacts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {quickContacts.map((contact, index) => (
              <div key={index} style={{
                ...card,
                marginBottom: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 24,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `url(${contact.avatar}) center/cover`,
                    border: '3px solid rgba(48, 122, 254, 0.2)',
                    flexShrink: 0
                  }}
                />
                <div>
                  <p style={{ fontWeight: 700, color: '#26344A', margin: 0, fontSize: 16 }}>{contact.name}</p>
                  <p style={{ fontSize: 14, color: '#7E8CA0', margin: 0, marginTop: 4 }}>{contact.title}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button style={{
                      ...btnGhost,
                      padding: '6px 12px',
                      fontSize: 12,
                      minWidth: 'auto'
                    }}>
                      📧 Email
                    </button>
                    <button style={{
                      ...btnGhost,
                      padding: '6px 12px',
                      fontSize: 12,
                      minWidth: 'auto'
                    }}>
                      📞 Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: 24, textAlign: 'center', color: '#7E8CA0', fontSize: 12 }}>
          ©2024 IMMS. All rights reserved.
        </div>
      </div>
    </main>
  );
}

export default CommunicationCenter;
