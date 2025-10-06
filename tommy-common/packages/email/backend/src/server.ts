import express from 'express';
import cors from 'cors';
import { EmailService } from './services/EmailService';
import { CustomAdapter } from './adapters/CustomAdapter';
import { ResendAdapter } from './adapters/ResendAdapter';
import { NodemailerAdapter } from './adapters/NodemailerAdapter';
import { EmailAdapter } from './adapters/EmailAdapter';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';
let EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'test';
const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@tommy-common.com';

// CORS 설정
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// Email Adapter 생성 함수
function createAdapter(providerType: string): EmailAdapter {
  switch (providerType.toLowerCase()) {
    case 'resend':
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is required for Resend provider');
      }
      return new ResendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFrom: DEFAULT_FROM,
        checkLimits: true
      });

    case 'nodemailer':
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS are required for Nodemailer provider');
      }
      return new NodemailerAdapter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        defaultFrom: process.env.SMTP_FROM || DEFAULT_FROM,
        checkLimits: true
      });

    case 'test':
      // Test mode: 콘솔 출력만
      return new CustomAdapter(async (options) => {
        console.log('\n📧 ============ Email Sent ============');
        console.log('From:', options.from);
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('HTML Preview:', options.html.substring(0, 200) + '...');
        if (options.text) {
          console.log('Text Preview:', options.text.substring(0, 100) + '...');
        }
        console.log('=====================================\n');
      }, DEFAULT_FROM);

    default:
      throw new Error(`Unsupported email provider: ${providerType}. Supported providers: test, resend, nodemailer`);
  }
}

// Email Service 초기화
let emailService = new EmailService({
  adapter: createAdapter(EMAIL_PROVIDER),
  defaultFrom: DEFAULT_FROM
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Email Service is running',
    provider: emailService.getProviderInfo()
  });
});

// 이메일 전송
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, html are required' });
    }

    const result = await emailService.send({ to, subject, html, text });

    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        provider: result.provider
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// OTP 이메일 전송
app.post('/api/email/send-otp', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'email and code are required' });
    }

    const result = await emailService.sendOTP(email, code);

    if (result.success) {
      res.json({
        success: true,
        message: 'OTP email sent successfully',
        messageId: result.messageId,
        provider: result.provider
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('OTP email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Provider 정보 조회
app.get('/api/email/provider', (req, res) => {
  res.json(emailService.getProviderInfo());
});

// Provider 변경
app.put('/api/email/provider', (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'provider is required' });
    }

    // Adapter 재생성
    const newAdapter = createAdapter(provider);

    // EmailService 재생성
    emailService = new EmailService({
      adapter: newAdapter,
      defaultFrom: DEFAULT_FROM
    });

    EMAIL_PROVIDER = provider;

    console.log(`\n📬 Provider changed to: ${provider}\n`);

    res.json({
      success: true,
      message: 'Provider changed successfully',
      provider: emailService.getProviderInfo()
    });
  } catch (error: any) {
    console.error('Provider change error:', error);
    res.status(400).json({ error: error.message });
  }
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 에러 핸들러
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`\n📧 Email Service running on port ${PORT}`);
  console.log(`📍 Frontend URL: ${FRONTEND_URL}`);
  console.log(`\n📬 Provider: ${emailService.getProviderInfo().name}`);
  console.log(`\n✨ Ready to send emails!\n`);
});
