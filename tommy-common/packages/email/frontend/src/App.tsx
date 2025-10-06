import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Input,
  Textarea,
  Button,
  Tabs,
  Badge,
  Select
} from '@miracle380301/common';
import '@miracle380301/common/dist/styles/variables.css';

interface ProviderInfo {
  name: string;
  type: string;
}

const API_URL = 'http://localhost:3001';

function App() {
  const [activeTab, setActiveTab] = useState<'custom' | 'otp'>('custom');
  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('test');

  // Custom Email Form
  const [to, setTo] = useState('user@example.com');
  const [subject, setSubject] = useState('Test Email');
  const [html, setHtml] = useState('<h1>Hello World!</h1><p>This is a test email.</p>');

  // OTP Form
  const [otpEmail, setOtpEmail] = useState('user@example.com');
  const [otpCode, setOtpCode] = useState('123456');

  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const providerOptions = [
    { value: 'test', label: 'Test Mode (Console Only)' },
    { value: 'resend', label: 'Resend' },
    { value: 'nodemailer', label: 'Nodemailer (Gmail SMTP)' }
  ];

  useEffect(() => {
    fetchProvider();
  }, []);

  const fetchProvider = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/email/provider`);
      console.log('📡 Fetched provider:', response.data);
      setProvider(response.data);
      setSelectedProvider(response.data.type);
      console.log('📋 Selected provider set to:', response.data.type);
    } catch (error) {
      console.error('Failed to fetch provider:', error);
    }
  };

  const changeProvider = (providerType: string) => {
    console.log('🔄 Changing provider to:', providerType);

    // 먼저 UI 상태 업데이트
    setSelectedProvider(providerType);

  };

  const sendCustomEmail = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post(`${API_URL}/api/email/send`, {
        to,
        subject,
        html
      });

      setStatus({
        type: 'success',
        message: `✅ Email sent successfully! (${response.data.provider}, ID: ${response.data.messageId})`
      });
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: `❌ Failed to send email: ${error.response?.data?.error || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const sendOTPEmail = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post(`${API_URL}/api/email/send-otp`, {
        email: otpEmail,
        code: otpCode
      });

      setStatus({
        type: 'success',
        message: `✅ OTP email sent successfully! (${response.data.provider}, ID: ${response.data.messageId})`
      });
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: `❌ Failed to send OTP email: ${error.response?.data?.error || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(code);
  };

  const customEmailTab = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
        <Input
          type="email"
          value={to}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
          placeholder="recipient@example.com"
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
        <Input
          type="text"
          value={subject}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
          placeholder="Email subject"
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content:</label>
        <Textarea
          value={html}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHtml(e.target.value)}
          placeholder="<h1>Hello!</h1>"
          rows={8}
          fullWidth
        />
      </div>

      <Button
        onClick={sendCustomEmail}
        disabled={loading}
        fullWidth
        variant="primary"
      >
        {loading ? 'Sending...' : 'Send Custom Email'}
      </Button>
    </div>
  );

  const otpEmailTab = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
        <Input
          type="email"
          value={otpEmail}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtpEmail(e.target.value)}
          placeholder="user@example.com"
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code:</label>
        <Input
          type="text"
          value={otpCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtpCode(e.target.value)}
          placeholder="123456"
          maxLength={6}
          fullWidth
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={sendOTPEmail}
          disabled={loading}
          fullWidth
          variant="primary"
        >
          {loading ? 'Sending...' : 'Send OTP Email'}
        </Button>
        <Button
          onClick={generateRandomOTP}
          fullWidth
          variant="secondary"
        >
          Generate Random OTP
        </Button>
      </div>
    </div>
  );

  const tabs = [
    { key: 'custom', label: 'Custom Email', content: customEmailTab },
    { key: 'otp', label: 'OTP Email', content: otpEmailTab }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full mx-4">
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Email Service Test</h1>
              <p className="text-gray-600">Test email sending functionality</p>
            </div>

            <div className="max-w-md mx-auto">
              <Select
                label="Email Provider"
                options={providerOptions}
                value={selectedProvider}
                onChange={(value: string) => {
                  console.log('Select onChange called with:', value);
                  changeProvider(value);
                }}
                fullWidth
              />
            </div>

            <Tabs
              items={tabs}
              activeTab={activeTab}
              onChange={(key: string) => setActiveTab(key as 'custom' | 'otp')}
            />

            {status && (
              <div className={`p-4 rounded-lg ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {status.message}
              </div>
            )}
          </div>
        </Card>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>@miracle380301/email-service • tommy-common 모듈 기반</p>
        </div>
      </div>
    </div>
  );
}

export default App;
