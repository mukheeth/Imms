import React, { useState, useEffect } from 'react';
import { apiService, MedicalAdvisory as ApiMedicalAdvisory } from '../services/api';

// Extend the imported interface with additional properties
interface MedicalAdvisory extends ApiMedicalAdvisory {
  claimNumber?: string;
  medicalCondition?: string;
  totalCost?: number;
}

type MedicalAdvisoryPayload = Omit<ApiMedicalAdvisory, 'id' | 'createdAt'>;

interface Document {
  id: number;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  status: 'uploaded' | 'submitted' | 'reviewed';
}

interface WorkflowStep {
  step: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  user?: string;
}

function MedicalAdvisoryWorkflow() {
  const [advisories, setAdvisories] = useState<MedicalAdvisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [detailTab, setDetailTab] = useState<'Summary' | 'Documents' | 'Comments'>('Summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdvisory, setSelectedAdvisory] = useState<MedicalAdvisory | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 59, seconds: 59 });
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [newComment, setNewComment] = useState('');

  // RAF Medical Advisory Templates
  const rafTemplates = [
    '🏥 Initial Assessment Template',
    '📋 Treatment Plan Review Template',
    '📄 Medical Report Template',
    '⚕️ Surgical Intervention Template',
    '🔄 Rehabilitation Assessment Template',
    '💊 Chronic Pain Management Template'
  ];

  // Clinical Research Theme Styles
  const container: React.CSSProperties = { 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)', 
    color: '#2d3748', 
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' 
  };
  
  const header: React.CSSProperties = { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '32px 40px', 
    borderBottom: '2px solid rgba(66, 153, 225, 0.2)',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  };
  
  const h1: React.CSSProperties = { 
    fontSize: 32, 
    fontWeight: 700, 
    background: 'linear-gradient(135deg, #63b3ed 0%, #4299e1 50%, #3182ce 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.025em'
  };
  
  const muted: React.CSSProperties = { 
    color: '#64748b', 
    fontSize: '16px',
    fontWeight: 500 
  };
  
  const btn: React.CSSProperties = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 8, 
    padding: '12px 20px', 
    borderRadius: 12, 
    fontSize: 14, 
    fontWeight: 600, 
    border: '2px solid rgba(66, 153, 225, 0.3)', 
    background: 'rgba(255, 255, 255, 0.9)', 
    color: '#2d3748', 
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  };
  
  const btnPrimary: React.CSSProperties = { 
    ...btn, 
    background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 50%, #2c5282 100%)', 
    color: '#ffffff', 
    border: 'none',
    boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)'
  };
  
  const card: React.CSSProperties = { 
    padding: 24, 
    borderRadius: 16, 
    background: 'rgba(255, 255, 255, 0.9)', 
    border: '2px solid rgba(66, 153, 225, 0.2)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };
  
  const input: React.CSSProperties = { 
    padding: '12px 16px', 
    borderRadius: 12, 
    border: '2px solid rgba(66, 153, 225, 0.3)', 
    background: 'rgba(255, 255, 255, 0.9)', 
    color: '#2d3748', 
    fontSize: 14,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  };

  useEffect(() => {
    loadAdvisories();
    initializeMockData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 0, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const initializeMockData = () => {
    // Mock documents
    setDocuments([
      {
        id: 1,
        name: 'Medical Motivation Report.pdf',
        type: 'Medical Report',
        uploadedBy: 'Dr. David Chen',
        uploadDate: '2024-05-16T10:30:00Z',
        status: 'submitted'
      },
      {
        id: 2,
        name: 'Clinical Assessment Notes.docx',
        type: 'Clinical Notes',
        uploadedBy: 'Dr. David Chen',
        uploadDate: '2024-05-16T09:15:00Z',
        status: 'submitted'
      },
      {
        id: 3,
        name: 'X-Ray_Results_2024-05-15.pdf',
        type: 'Medical Imaging',
        uploadedBy: 'Dr. David Chen',
        uploadDate: '2024-05-15T14:20:00Z',
        status: 'uploaded'
      }
    ]);

    // Mock workflow steps
    setWorkflowSteps([
      { step: 'Submission', status: 'completed', date: '2024-05-16', user: 'Dr. David Chen' },
      { step: 'Review', status: 'current', date: '2024-05-17', user: 'Dr. Sarah Lee' },
      { step: 'Approval', status: 'pending' },
      { step: 'Completed', status: 'pending' }
    ]);
  };

  const loadAdvisories = async () => {
    try {
      setLoading(true);
      // Use the existing API service method and cast to our extended type
      const data = await apiService.getAllMedicalAdvisories() as MedicalAdvisory[];
      setAdvisories(data);
    } catch (error) {
      console.error('Error loading advisories:', error);
      // Fallback to mock data with proper typing
      setAdvisories([
        {
          id: 1,
          caseId: '#A123456',
          patientName: 'Emily Carter',
          condition: 'Compound Fracture - Right Tibia',
          advisoryType: 'Treatment Plan',
          recommendations: 'Patient requires immediate surgical intervention for compound fracture. Estimated recovery time: 8-12 weeks.',
          status: 'PENDING',
          createdAt: '2024-05-15T10:30:00Z',
          claimNumber: 'C-20240515-001',
          medicalCondition: 'Compound fracture of right tibia with soft tissue damage',
          totalCost: 5000
        },
        {
          id: 2,
          caseId: '#B789012',
          patientName: 'Liam Harper',
          condition: 'Whiplash and Contusions',
          advisoryType: 'Medical Report',
          recommendations: 'Patient shows signs of improvement. Continue current treatment plan with weekly monitoring.',
          status: 'REVIEWED',
          createdAt: '2024-05-16T14:20:00Z',
          claimNumber: 'C-20240516-001',
          medicalCondition: 'Whiplash and minor contusions following motor vehicle accident',
          totalCost: 2500
        },
        {
          id: 3,
          caseId: '#C345678',
          patientName: 'Olivia Bennett',
          condition: 'Lower Back Pain',
          advisoryType: 'Treatment Plan',
          recommendations: 'Patient requires physical therapy sessions 3x per week for 6 weeks. Monitor progress closely.',
          status: 'PENDING',
          createdAt: '2024-05-17T09:15:00Z',
          claimNumber: 'C-20240517-001',
          medicalCondition: 'Chronic lower back pain with radicular symptoms',
          totalCost: 3000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (advisoryId: number) => {
    try {
      // Use createMedicalAdvisory with only the properties from the base interface
      const advisoryData: MedicalAdvisoryPayload = {
        caseId: selectedAdvisory?.caseId || '',
        patientName: selectedAdvisory?.patientName || '',
        condition: selectedAdvisory?.condition || '',
        advisoryType: selectedAdvisory?.advisoryType || '',
        recommendations: selectedAdvisory?.recommendations || '',
        status: 'APPROVED'
      };
      await apiService.createMedicalAdvisory(advisoryData);
      await loadAdvisories();
      // Update workflow
      setWorkflowSteps(prev => prev.map(step => 
        step.step === 'Approval' ? { ...step, status: 'completed', date: new Date().toISOString().split('T')[0], user: 'Dr. Sarah Lee' } : step
      ));
    } catch (error) {
      console.error('Error approving advisory:', error);
    }
  };

  const handleReject = async (advisoryId: number) => {
    try {
      // Use createMedicalAdvisory with only the properties from the base interface
      const advisoryData: MedicalAdvisoryPayload = {
        caseId: selectedAdvisory?.caseId || '',
        patientName: selectedAdvisory?.patientName || '',
        condition: selectedAdvisory?.condition || '',
        advisoryType: selectedAdvisory?.advisoryType || '',
        recommendations: selectedAdvisory?.recommendations || '',
        status: 'REVIEWED'
      };
      await apiService.createMedicalAdvisory(advisoryData);
      await loadAdvisories();
    } catch (error) {
      console.error('Error rejecting advisory:', error);
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newDoc: Document = {
        id: documents.length + 1,
        name: files[0].name,
        type: 'Medical Report',
        uploadedBy: 'Dr. David Chen',
        uploadDate: new Date().toISOString(),
        status: 'uploaded'
      };
      setDocuments(prev => [...prev, newDoc]);
    }
  };

  const handleSubmitToMAU = () => {
    // Simulate submission to Medical Advisory Unit
    setDocuments(prev => prev.map(doc => ({ ...doc, status: 'submitted' as const })));
    alert('Documents submitted to Medical Advisory Unit successfully!');
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would call an API to save the comment
      alert(`Comment added: ${newComment}`);
      setNewComment('');
    }
  };

  const filteredAdvisories = advisories.filter(advisory => {
    const matchesSearch = advisory.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisory.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map tab names to status values
    let statusFilter = '';
    switch (activeTab) {
      case 'Pending': statusFilter = 'PENDING'; break;
      case 'In Review': statusFilter = 'REVIEWED'; break;
      case 'Completed': statusFilter = 'APPROVED'; break;
      default: statusFilter = activeTab.toUpperCase();
    }
    
    const matchesTab = advisory.status === statusFilter;
    return matchesSearch && matchesTab;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return { bg: '#fecaca', text: '#991b1b', darkBg: '#7f1d1d', darkText: '#f87171' };
      case 'Medium': return { bg: '#fed7aa', text: '#9a3412', darkBg: '#7c2d12', darkText: '#fb923c' };
      case 'Low': return { bg: '#dcfce7', text: '#166534', darkBg: '#14532d', darkText: '#4ade80' };
      default: return { bg: '#f3f4f6', text: '#374151', darkBg: '#374151', darkText: '#9ca3af' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef3c7', text: '#92400e', darkBg: '#78350f', darkText: '#fbbf24' };
      case 'REVIEWED': return { bg: '#dbeafe', text: '#1e40af', darkBg: '#1e3a8a', darkText: '#60a5fa' };
      case 'APPROVED': return { bg: '#dcfce7', text: '#166534', darkBg: '#14532d', darkText: '#4ade80' };
      case 'REJECTED': return { bg: '#fecaca', text: '#991b1b', darkBg: '#7f1d1d', darkText: '#f87171' };
      default: return { bg: '#f3f4f6', text: '#374151', darkBg: '#374151', darkText: '#9ca3af' };
    }
  };

  const getPriority = (index: number) => {
    const priorities = ['High', 'Medium', 'Low', 'High', 'Medium'];
    return priorities[index % priorities.length];
  };

  const getAssignee = (index: number) => {
    const assignees = ['Dr. Sarah Lee', 'Dr. David Chen', 'Dr. Michael Brown'];
    return assignees[index % assignees.length];
  };

  return (
    <div style={container}>
      <div style={{ position: 'relative', display: 'flex', minHeight: '100vh', width: '100%' }}>
        <main style={{ flex: 1, padding: 32 }}>
          <div style={header}>
            <div>
              <h1 style={h1}>🏥 Medical Advisory Workflow</h1>
              <p style={{ ...muted, marginTop: 8 }}>Streamlined clinical decision support and medical advisory management</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
                color: '#9a3412',
                boxShadow: '0 2px 8px rgba(251, 146, 60, 0.3)'
              }}>
                ⏳ Pending ({advisories.filter(a => a.status === 'PENDING').length})
              </span>
              <span style={{
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)',
                color: '#1e40af',
                boxShadow: '0 2px 8px rgba(147, 197, 253, 0.3)'
              }}>
                👁️ In Review ({advisories.filter(a => a.status === 'REVIEWED').length})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ 
                position: 'absolute', 
                left: 16, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#63b3ed', 
                fontSize: 20,
                fontWeight: 'bold'
              }}>🔍</span>
              <input
                style={{ 
                  ...input, 
                  paddingLeft: 48, 
                  width: '90%',
                  fontSize: 16,
                  fontWeight: 500
                }}
                placeholder="🔍 Search by assessment ID, claimant name, or medical condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 32, borderBottom: '2px solid rgba(66, 153, 225, 0.2)' }}>
              {[
                { name: 'Pending', icon: '⏳' },
                { name: 'In Review', icon: '👁️' },
                { name: 'Completed', icon: '✅' }
              ].map(tab => (
                <button
                  key={tab.name}
                  style={{
                    padding: '16px 8px',
                    borderBottom: activeTab === tab.name ? '3px solid #4299e1' : '3px solid transparent',
                    color: activeTab === tab.name ? '#4299e1' : '#64748b',
                    fontWeight: activeTab === tab.name ? 700 : 500,
                    fontSize: 16,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <span style={{ fontSize: 18 }}>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ ...card, textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>Loading medical advisories...</p>
            </div>
          ) : filteredAdvisories.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>No advisories found for the selected filter.</p>
            </div>
          ) : (
            <div style={{ 
              overflowX: 'auto', 
              borderRadius: 16, 
              background: 'rgba(255, 255, 255, 0.9)', 
              border: '2px solid rgba(66, 153, 225, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <table style={{ width: '100%', fontSize: 14, textAlign: 'left' }}>
                <thead style={{ background: 'rgba(66, 153, 225, 0.1)' }}>
                  <tr>
                    <th style={{ padding: '16px 20px', fontWeight: 700, color: '#2d3748', fontSize: 15 }}>📋 Assessment ID</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700, color: '#2d3748', fontSize: 15 }}>👤 Claimant</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700, color: '#2d3748', fontSize: 15 }}>📝 Request Type</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700, color: '#2d3748', fontSize: 15 }}>⚡ Priority</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700, color: '#2d3748', fontSize: 15 }}>📊 Status</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700, color: '#2d3748', fontSize: 15 }}>👨‍⚕️ Assignee</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700, color: '#2d3748', fontSize: 15 }}>📅 Submitted Date</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700, color: '#2d3748', fontSize: 15 }}>💰 Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdvisories.map((advisory, index) => {
                    const priority = getPriority(index);
                    const assignee = getAssignee(index);

                    return (
                      <tr
                        key={advisory.id}
                        style={{
                          borderBottom: '1px solid rgba(66, 153, 225, 0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: 'rgba(255, 255, 255, 0.5)'
                        }}
                        onClick={() => {
                          setSelectedAdvisory(advisory);
                          setDetailTab('Summary');
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(66, 153, 225, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                        }}
                      >
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: '#2d3748', fontSize: 15 }}>{advisory.caseId}</td>
                        <td style={{ padding: '16px 20px', color: '#4a5568', fontSize: 14, fontWeight: 500 }}>{advisory.patientName}</td>
                        <td style={{ padding: '16px 20px', color: '#4a5568', fontSize: 14, fontWeight: 500 }}>{advisory.advisoryType}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 600,
                            background: getPriorityColor(priority).bg,
                            color: getPriorityColor(priority).text,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}>
                            {priority}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 600,
                            background: getStatusColor(advisory.status).bg,
                            color: getStatusColor(advisory.status).text,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}>
                            {advisory.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#4a5568', fontSize: 14, fontWeight: 500 }}>{assignee}</td>
                        <td style={{ padding: '16px 20px', color: '#4a5568', fontSize: 14, fontWeight: 500 }}>{new Date(advisory.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 20px', color: '#4299e1', fontSize: 14, fontWeight: 600 }}>R {(advisory.totalCost || 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

        <aside style={{ 
          width: 420, 
          padding: 32, 
          borderLeft: '2px solid rgba(66, 153, 225, 0.2)', 
          background: 'rgba(248, 250, 252, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ ...card }}>
            <div style={{ padding: 20 }}>
              <h2 style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                marginBottom: 20,
                background: 'linear-gradient(135deg, #63b3ed 0%, #4299e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>📋 Detail View</h2>
            </div>
            
            {/* Workflow Progress */}
            <div style={{ padding: '0 20px 20px', borderBottom: '2px solid rgba(66, 153, 225, 0.2)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4a5568', marginBottom: 16 }}>🔄 Workflow Progress</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                {workflowSteps.map(step => (
                  <span key={step.step} style={{ 
                    fontWeight: step.status === 'current' ? 700 : 500,
                    color: step.status === 'current' ? '#4299e1' : '#64748b',
                    fontSize: 12
                  }}>
                    {step.step}
                  </span>
                ))}
              </div>
              <div style={{ 
                width: '100%', 
                background: 'rgba(66, 153, 225, 0.2)', 
                borderRadius: 8, 
                height: 8,
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: workflowSteps.filter(s => s.status === 'completed').length === 3 ? '100%' : 
                         workflowSteps.filter(s => s.status === 'completed').length === 2 ? '66%' : '33%', 
                  background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)', 
                  height: '100%', 
                  borderRadius: 8,
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>

            <div style={{ borderBottom: '2px solid rgba(66, 153, 225, 0.2)', padding: '0 20px' }}>
              <div style={{ display: 'flex', gap: 32 }}>
                {[
                  { name: 'Summary', icon: '📋' },
                  { name: 'Documents', icon: '📄' },
                  { name: 'Comments', icon: '💬' }
                ].map(tab => (
                  <button
                    key={tab.name}
                    style={{
                      padding: '16px 8px',
                      borderBottom: detailTab === tab.name ? '3px solid #4299e1' : '3px solid transparent',
                      color: detailTab === tab.name ? '#4299e1' : '#64748b',
                      fontWeight: detailTab === tab.name ? 700 : 500,
                      fontSize: 14,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                    onClick={() => setDetailTab(tab.name as 'Summary' | 'Documents' | 'Comments')}
                  >
                    <span style={{ fontSize: 16 }}>{tab.icon}</span>
                    {tab.name}
                </button>
                ))}
              </div>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>
              {selectedAdvisory ? (
                <>
                  {detailTab === 'Summary' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* RAF Template Selection */}
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4a5568', marginBottom: 12 }}>🏥 RAF Advisory Template</h3>
                        <select
                          style={{ 
                            ...input, 
                            width: '100%',
                            fontSize: 15,
                            fontWeight: 500
                          }}
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                        >
                          <option value="">Select RAF Template</option>
                          {rafTemplates.map(template => (
                            <option key={template} value={template}>{template}</option>
                          ))}
                        </select>
                      </div>

                      {/* Claim Information */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>👤 Claimant</h3>
                          <p style={{ fontSize: 15, color: '#2d3748', fontWeight: 500 }}>{selectedAdvisory.patientName}</p>
                        </div>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>📋 Claim Number</h3>
                          <p style={{ fontSize: 15, color: '#2d3748', fontWeight: 500 }}>{selectedAdvisory.claimNumber || 'C-20240516-001'}</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>📝 Request Type</h3>
                          <p style={{ fontSize: 15, color: '#2d3748', fontWeight: 500 }}>{selectedAdvisory.advisoryType}</p>
                        </div>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>⚡ Priority</h3>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: 16,
                            fontSize: 13,
                            fontWeight: 600,
                            background: getPriorityColor(getPriority(selectedAdvisory.id!)).bg,
                            color: getPriorityColor(getPriority(selectedAdvisory.id!)).text,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}>
                            {getPriority(selectedAdvisory.id!)}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>📊 Status</h3>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: 16,
                            fontSize: 13,
                            fontWeight: 600,
                            background: getStatusColor(selectedAdvisory.status).bg,
                            color: getStatusColor(selectedAdvisory.status).text,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}>
                            {selectedAdvisory.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>📅 Submitted Date</h3>
                          <p style={{ fontSize: 15, color: '#2d3748', fontWeight: 500 }}>{new Date(selectedAdvisory.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>🏥 Medical Condition</h3>
                        <p style={{ fontSize: 15, color: '#2d3748', fontWeight: 500, lineHeight: 1.5 }}>{selectedAdvisory.medicalCondition || selectedAdvisory.condition}</p>
                      </div>

                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>💡 Recommendations</h3>
                        <p style={{ fontSize: 15, color: '#2d3748', fontWeight: 500, lineHeight: 1.5 }}>{selectedAdvisory.recommendations}</p>
                      </div>

                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>💰 Total Cost</h3>
                        <p style={{ 
                          fontSize: 18, 
                          fontWeight: 700, 
                          color: '#4299e1',
                          background: 'rgba(66, 153, 225, 0.1)',
                          padding: '8px 12px',
                          borderRadius: 12,
                          display: 'inline-block'
                        }}>R {(selectedAdvisory.totalCost || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {detailTab === 'Documents' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4a5568' }}>📄 Submitted Documents</h3>
                        <label style={{
                          ...btnPrimary,
                          fontSize: 13,
                          padding: '10px 16px'
                        }}>
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleDocumentUpload}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                          />
                          📎 Upload Document
                        </label>
                      </div>

                      {documents.map(doc => (
                        <div key={doc.id} style={{ 
                          ...card, 
                          padding: 16,
                          background: 'rgba(66, 153, 225, 0.08)',
                          border: '2px solid rgba(66, 153, 225, 0.2)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#2d3748' }}>📄 {doc.name}</span>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 600,
                              background: doc.status === 'submitted' ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                              color: doc.status === 'submitted' ? '#166534' : '#92400e',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                              {doc.status === 'submitted' ? '✅ SUBMITTED' : '⏳ UPLOADED'}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                            📋 Type: {doc.type} • 📅 Uploaded: {new Date(doc.uploadDate).toLocaleDateString()} by 👨‍⚕️ {doc.uploadedBy}
                          </div>
                        </div>
                      ))}

                      <button
                        style={{
                          ...btnPrimary,
                          fontSize: 15,
                          padding: '14px 24px',
                          opacity: documents.length === 0 ? 0.5 : 1
                        }}
                        onClick={handleSubmitToMAU}
                        disabled={documents.length === 0}
                      >
                        🏥 Submit to Medical Advisory Unit
                      </button>
                    </div>
                  )}

                  {detailTab === 'Comments' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4a5568' }}>💬 Comments & Notes</h3>
                      
                      <div style={{ display: 'flex', gap: 12 }}>
                        <input
                          style={{ 
                            ...input, 
                            flex: 1,
                            fontSize: 15,
                            fontWeight: 500
                          }}
                          placeholder="💭 Add a clinical note or comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button style={{
                          ...btnPrimary,
                          fontSize: 14,
                          padding: '12px 20px'
                        }} onClick={handleAddComment}>
                          ➕ Add
                        </button>
                      </div>

                      <div style={{
                        ...card,
                        background: 'rgba(66, 153, 225, 0.08)',
                        border: '2px solid rgba(66, 153, 225, 0.2)',
                        textAlign: 'center',
                        padding: 32
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
                        <p style={{ fontSize: 15, color: '#64748b', fontStyle: 'italic', fontWeight: 500 }}>
                          No comments yet. Add the first clinical note to start the discussion.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  ...card,
                  textAlign: 'center',
                  padding: 48,
                  background: 'rgba(66, 153, 225, 0.08)',
                  border: '2px solid rgba(66, 153, 225, 0.2)'
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                  <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>
                    Select a medical advisory from the list to view detailed information.
                  </p>
                </div>
              )}

              {/* Quick Decision Section */}
              {selectedAdvisory && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: '#4a5568', 
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>⚡ Quick Decision</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#ffffff',
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 50%, #2f855a 100%)',
                        border: 'none',
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                      onClick={() => handleApprove(selectedAdvisory.id!)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(72, 187, 120, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.3)';
                      }}
                    >
                      ✅ Approve Advisory
                    </button>
                    <button
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#ffffff',
                        background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 50%, #c53030 100%)',
                        border: 'none',
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                      onClick={() => handleReject(selectedAdvisory.id!)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 101, 101, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 101, 101, 0.3)';
                      }}
                    >
                      ❌ Reject Advisory
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MedicalAdvisoryWorkflow;