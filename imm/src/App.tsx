import React from 'react';
import './App.css';
import AnalyticsAndBusinessIntelligence from './pages/AnalyticsAndBusinessIntelligence';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import InHospitalCaseManagement from './pages/InHospitalCaseManagement';
import HospitalCaseManagement from './pages/HospitalCaseManagement';
import DischargePlanning from './pages/DischargePlanning';
import PreAuthorizationRequest from './pages/PreAuthorizationRequest';
import ClaimsAndBillReview from './pages/ClaimsAndBillReview';
import CommunicationCenter from './pages/CommunicationCenter';
import MedicalAdvisoryWorkflow from './pages/MedicalAdvisoryWorkflow';
import PharmacyBenefitManagement from './pages/PharmacyBenefitManagement';
import SeriousInjuryAssessmentPage from './pages/SeriousInjuryAssessment';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function App() {
  const [route, setRoute] = React.useState<'signin' | 'signup' | 'dashboard' | 'Pre-Authorization' | 'analytics' | 'cases' | 'claims' | 'communication' | 'medical-advisory' | 'pharmacy' | 'serious-injury' | 'payments' | 'hospital-case'>('signin');
  return (
    <div style={{ minHeight: '100vh', background: '#0b1020' }}>
      {route !== 'signin' && route !== 'signup' && (
        <Navbar active={route as any} onNavigate={(r: any) => {
          if (r === 'signin') setRoute('signin');
          if (r === 'signup') setRoute('signup');
          if (r === 'dashboard') setRoute('dashboard');
          if (r === 'analytics') setRoute('analytics');
          if (r === 'cases') setRoute('cases');
          if (r === 'claims') setRoute('claims');
          if (r === 'communication') setRoute('communication');
          if (r === 'medical-advisory') setRoute('medical-advisory');
          if (r === 'pharmacy') setRoute('pharmacy');
          if (r === 'serious-injury') setRoute('serious-injury');
          if (r === 'payments') setRoute('payments');
          if (r === 'Pre-Authorization') setRoute('Pre-Authorization');
        }} />
      )}
      {route === 'signin' && <SignIn onNavigate={(r: any) => setRoute(r)} />}
      {route === 'signup' && <SignUp onNavigate={(r: any) => setRoute(r)} />}
      {route === 'dashboard' && <Dashboard onNavigate={(r) => {
        if (r === 'Pre-Authorization') setRoute('Pre-Authorization');
      }} />}
      {route === 'analytics' && <AnalyticsAndBusinessIntelligence />}
      {route === 'cases' && <InHospitalCaseManagement />}
      {route === 'claims' && <ClaimsAndBillReview />}
      {route === 'communication' && <CommunicationCenter />}
      {route === 'medical-advisory' && <MedicalAdvisoryWorkflow />}

      {route === 'pharmacy' && <PharmacyBenefitManagement />}
      {route === 'serious-injury' && <SeriousInjuryAssessmentPage onNavigate={(r: any) => setRoute(r)} />}
      {route === 'payments' && <DischargePlanning />}
      {route === 'Pre-Authorization' && <PreAuthorizationRequest onNavigate={(r) => setRoute(r)} />}
      {route === 'hospital-case' && <HospitalCaseManagement />}
    </div>
  );
}

export default App;
