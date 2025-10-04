Day 11: 외부 서비스 & 작업 큐
📋 목표
이메일, SMS, 결제 연동 및 작업 큐(Bull), 스케줄러(Cron) 구현
📁 디렉토리 구조
src/modules/
├── email/
│   ├── providers/
│   │   ├── NodemailerProvider.js   # Nodemailer
│   │   └── SendGridProvider.js     # SendGrid (선택)
│   ├── templates/
│   │   ├── welcome.html
│   │   ├── passwordReset.html
│   │   └── templateEngine.js
│   └── emailService.js
├── sms/
│   ├── providers/
│   │   ├── TwilioProvider.js       # Twilio
│   │   └── AwsSnsProvider.js       # AWS SNS (선택)
│   └── smsService.js
├── payment/
│   ├── providers/
│   │   ├── StripeProvider.js       # Stripe
│   │   └── TossProvider.js         # 토스페이먼츠
│   └── paymentService.js
├── queue/
│   ├── Queue.js                    # Bull Queue 래퍼
│   ├── workers/
│   │   ├── emailWorker.js
│   │   ├── notificationWorker.js
│   │   └── index.js
│   └── jobs/
│       ├── sendEmailJob.js
│       └── index.js
└── scheduler/
    ├── Scheduler.js                # node-cron 래퍼
    └── tasks/
        ├── cleanupExpiredTokens.js
        ├── generateReports.js
        └── index.js
🎯 구현 모듈
11.1 Email Service
11.1.1 Nodemailer Provider
파일 위치: src/modules/email/providers/NodemailerProvider.js
환경 변수:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
EMAIL_FROM_NAME=Your App
구현:
javascriptconst nodemailer = require('nodemailer');
const config = require('../../../config');
const logger = require('../../../core/logger');

class NodemailerProvider {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,  // true for 465, false for others
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASSWORD
      },
      pool: true,  // 연결 풀 사용
      maxConnections: 5,
      maxMessages: 100
    });

    // 연결 확인
    this.verify();
  }

  /**
   * 연결 확인
   */
  async verify() {
    try {
      await this.transporter.verify();
      logger.info('Email provider ready');
    } catch (error) {
      logger.error('Email provider error:', error);
    }
  }

  /**
   * 이메일 전송
   */
  async send(options) {
    const {
      to,
      subject,
      html,
      text = null,
      from = `${config.EMAIL_FROM_NAME} <${config.EMAIL_FROM}>`,
      cc = null,
      bcc = null,
      attachments = null,
      replyTo = null
    } = options;

    const mailOptions = {
      from,
      to,
      subject,
      html,
      text: text || this.htmlToText(html),
      cc,
      bcc,
      attachments,
      replyTo
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * HTML을 Plain Text로 변환 (간단한 구현)
   */
  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * 여러 이메일 전송
   */
  async sendBatch(emails) {
    const results = await Promise.allSettled(
      emails.map(email => this.send(email))
    );

    return {
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };
  }
}

module.exports = NodemailerProvider;
11.1.2 Template Engine
파일 위치: src/modules/email/templates/templateEngine.js
목적: HTML 이메일 템플릿 렌더링
javascriptconst fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

class TemplateEngine {
  constructor() {
    this.templatesDir = path.join(__dirname);
    this.cache = new Map();
  }

  /**
   * 템플릿 로드
   */
  async loadTemplate(templateName) {
    // 캐시 확인
    if (this.cache.has(templateName)) {
      return this.cache.get(templateName);
    }

    // 파일 읽기
    const templatePath = path.join(this.templatesDir, `${templateName}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // Handlebars 컴파일
    const template = Handlebars.compile(templateContent);

    // 캐시 저장
    this.cache.set(templateName, template);

    return template;
  }

  /**
   * 템플릿 렌더링
   */
  async render(templateName, data) {
    const template = await this.loadTemplate(templateName);
    return template(data);
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
  }
}

// Handlebars 헬퍼 등록
Handlebars.registerHelper('formatDate', function(date) {
  return new Date(date).toLocaleDateString();
});

Handlebars.registerHelper('formatCurrency', function(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
});

module.exports = new TemplateEngine();
11.1.3 Email Templates
파일 위치: src/modules/email/templates/welcome.html
html<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .content {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #007bff;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h1>Welcome, {{name}}! 🎉</h1>
      <p>Thank you for joining us. We're excited to have you on board!</p>
      <p>To get started, please verify your email address by clicking the button below:</p>
      <a href="{{verificationUrl}}" class="button">Verify Email</a>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>Best regards,<br>The Team</p>
    </div>
    <div class="footer">
      <p>&copy; {{year}} Your App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
11.1.4 Email Service
파일 위치: src/modules/email/emailService.js
javascriptconst NodemailerProvider = require('./providers/NodemailerProvider');
const templateEngine = require('./templates/templateEngine');
const config = require('../../config');

class EmailService {
  constructor() {
    this.provider = new NodemailerProvider();
  }

  /**
   * Welcome 이메일
   */
  async sendWelcomeEmail(user, verificationUrl) {
    const html = await templateEngine.render('welcome', {
      name: user.name,
      verificationUrl,
      year: new Date().getFullYear()
    });

    return await this.provider.send({
      to: user.email,
      subject: 'Welcome to Our App! 🎉',
      html
    });
  }

  /**
   * 비밀번호 재설정 이메일
   */
  async sendPasswordResetEmail(user, resetUrl) {
    const html = await templateEngine.render('passwordReset', {
      name: user.name,
      resetUrl,
      expiresIn: '1 hour',
      year: new Date().getFullYear()
    });

    return await this.provider.send({
      to: user.email,
      subject: 'Reset Your Password',
      html
    });
  }

  /**
   * Magic Link 이메일 (Day 7에서 사용)
   */
  async sendMagicLink(email, magicLink) {
    const html = await templateEngine.render('magicLink', {
      magicLink,
      expiresIn: '15 minutes',
      year: new Date().getFullYear()
    });

    return await this.provider.send({
      to: email,
      subject: 'Your Magic Link to Sign In',
      html
    });
  }

  /**
   * 커스텀 이메일
   */
  async sendCustomEmail(options) {
    return await this.provider.send(options);
  }

  /**
   * 이메일 검증
   */
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
    return await this.sendWelcomeEmail(user, verificationUrl);
  }
}

module.exports = new EmailService();
11.2 SMS Service
11.2.1 Twilio Provider
파일 위치: src/modules/sms/providers/TwilioProvider.js
환경 변수:
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
구현:
javascriptconst twilio = require('twilio');
const config = require('../../../config');
const logger = require('../../../core/logger');
const AppError = require('../../../core/errors/AppError');

class TwilioProvider {
  constructor() {
    this.client = twilio(
      config.TWILIO_ACCOUNT_SID,
      config.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = config.TWILIO_PHONE_NUMBER;
  }

  /**
   * SMS 전송
   */
  async send(to, message) {
    try {
      // 한국 번호 포맷 변환 (010-1234-5678 → +821012345678)
      const formattedTo = this.formatPhoneNumber(to);

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedTo
      });

      logger.info(`SMS sent: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      logger.error('SMS send error:', error);
      throw new AppError('Failed to send SMS', 500);
    }
  }

  /**
   * 전화번호 포맷 변환
   */
  formatPhoneNumber(phoneNumber) {
    // 한국 번호 (+82)
    if (phoneNumber.startsWith('010')) {
      return '+82' + phoneNumber.slice(1).replace(/-/g, '');
    }
    
    // 이미 국가 코드가 있는 경우
    if (phoneNumber.startsWith('+')) {
      return phoneNumber.replace(/-/g, '');
    }

    return phoneNumber;
  }

  /**
   * 인증 코드 전송
   */
  async sendVerificationCode(to, code) {
    const message = `Your verification code is: ${code}. Valid for 5 minutes.`;
    return await this.send(to, message);
  }

  /**
   * 여러 SMS 전송
   */
  async sendBatch(messages) {
    const results = await Promise.allSettled(
      messages.map(({ to, message }) => this.send(to, message))
    );

    return {
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };
  }
}

module.exports = TwilioProvider;
11.2.2 SMS Service
파일 위치: src/modules/sms/smsService.js
javascriptconst TwilioProvider = require('./providers/TwilioProvider');
const AppError = require('../../core/errors/AppError');

class SmsService {
  constructor() {
    this.provider = new TwilioProvider();
  }

  /**
   * SMS 전송
   */
  async sendSms(to, message) {
    return await this.provider.send(to, message);
  }

  /**
   * OTP 생성 및 전송
   */
  async sendOtp(phoneNumber) {
    // 6자리 OTP 생성
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // SMS 전송
    await this.provider.sendVerificationCode(phoneNumber, otp);

    // OTP를 Redis에 저장 (5분 TTL)
    const redis = require('../../config/redis');
    if (redis) {
      await redis.setex(`otp:${phoneNumber}`, 300, otp);
    }

    return { success: true };
  }

  /**
   * OTP 검증
   */
  async verifyOtp(phoneNumber, otp) {
    const redis = require('../../config/redis');
    
    if (!redis) {
      throw new AppError('OTP verification not available', 500);
    }

    const storedOtp = await redis.get(`otp:${phoneNumber}`);

    if (!storedOtp) {
      throw new AppError('OTP expired or not found', 400);
    }

    if (storedOtp !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    // 사용한 OTP 삭제
    await redis.del(`otp:${phoneNumber}`);

    return { success: true };
  }

  /**
   * 알림 SMS
   */
  async sendNotification(phoneNumber, message) {
    return await this.provider.send(phoneNumber, message);
  }
}

module.exports = new SmsService();
11.3 Payment Service
11.3.1 Stripe Provider
파일 위치: src/modules/payment/providers/StripeProvider.js
환경 변수:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
구현:
javascriptconst stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../../../config');
const logger = require('../../../core/logger');
const AppError = require('../../../core/errors/AppError');

class StripeProvider {
  constructor() {
    this.stripe = stripe;
    this.currency = config.STRIPE_CURRENCY || 'usd';
  }

  /**
   * Payment Intent 생성
   */
  async createPaymentIntent(amount, options = {}) {
    const {
      currency = this.currency,
      customerId = null,
      metadata = {},
      description = null
    } = options;

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),  // cents 단위
        currency,
        customer: customerId,
        metadata,
        description,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100,
        status: paymentIntent.status
      };
    } catch (error) {
      logger.error('Stripe payment intent error:', error);
      throw new AppError('Failed to create payment intent', 500);
    }
  }

  /**
   * 고객 생성
   */
  async createCustomer(email, options = {}) {
    const {
      name = null,
      metadata = {}
    } = options;

    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata
      });

      return {
        id: customer.id,
        email: customer.email
      };
    } catch (error) {
      logger.error('Stripe customer creation error:', error);
      throw new AppError('Failed to create customer', 500);
    }
  }

  /**
   * 결제 확인
   */
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId
      );

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100
      };
    } catch (error) {
      logger.error('Stripe payment confirmation error:', error);
      throw new AppError('Failed to confirm payment', 500);
    }
  }

  /**
   * 환불
   */
  async refund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundData);

      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount / 100
      };
    } catch (error) {
      logger.error('Stripe refund error:', error);
      throw new AppError('Failed to process refund', 500);
    }
  }

  /**
   * Webhook 서명 검증
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      );

      return event;
    } catch (error) {
      logger.error('Stripe webhook verification error:', error);
      throw new AppError('Invalid webhook signature', 400);
    }
  }

  /**
   * 결제 조회
   */
  async getPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000)
      };
    } catch (error) {
      logger.error('Stripe payment retrieval error:', error);
      throw new AppError('Failed to retrieve payment', 500);
    }
  }
}

module.exports = StripeProvider;
11.3.2 Toss Payments Provider
파일 위치: src/modules/payment/providers/TossProvider.js
환경 변수:
TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
구현:
javascriptconst axios = require('axios');
const config = require('../../../config');
const logger = require('../../../core/logger');
const AppError = require('../../../core/errors/AppError');

class TossProvider {
  constructor() {
    this.clientKey = config.TOSS_CLIENT_KEY;
    this.secretKey = config.TOSS_SECRET_KEY;
    this.baseUrl = 'https://api.tosspayments.com/v1';
    
    // Base64 인코딩된 Secret Key
    this.authHeader = `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`;
  }

  /**
   * 결제 승인
   */
  async confirmPayment(paymentKey, orderId, amount) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments/confirm`,
        {
          paymentKey,
          orderId,
          amount
        },
        {
          headers: {
            'Authorization': this.authHeader,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.paymentKey,
        orderId: response.data.orderId,
        status: response.data.status,
        amount: response.data.totalAmount,
        method: response.data.method,
        approvedAt: response.data.approvedAt
      };
    } catch (error) {
      logger.error('Toss payment confirmation error:', error.response?.data);
      throw new AppError(
        error.response?.data?.message || 'Failed to confirm payment',
        error.response?.status || 500
      );
    }
  }

  /**
   * 결제 조회
   */
  async getPayment(paymentKey) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payments/${paymentKey}`,
        {
          headers: {
            'Authorization': this.authHeader
          }
        }
      );

      return {
        id: response.data.paymentKey,
        orderId: response.data.orderId,
        status: response.data.status,
        amount: response.data.totalAmount,
        method: response.data.method,
        approvedAt: response.data.approvedAt
      };
    } catch (error) {
      logger.error('Toss payment retrieval error:', error.response?.data);
      throw new AppError('Failed to retrieve payment', 500);
    }
  }

  /**
   * 결제 취소 (환불)
   */
  async cancelPayment(paymentKey, cancelReason, cancelAmount = null) {
    try {
      const data = {
        cancelReason
      };

      if (cancelAmount) {
        data.cancelAmount = cancelAmount;
      }

      const response = await axios.post(
        `${this.baseUrl}/payments/${paymentKey}/cancel`,
        data,
        {
          headers: {
            'Authorization': this.authHeader,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.paymentKey,
        status: response.data.status,
        canceledAmount: response.data.cancels[0].cancelAmount,
        canceledAt: response.data.cancels[0].canceledAt
      };
    } catch (error) {
      logger.error('Toss payment cancellation error:', error.response?.data);
      throw new AppError('Failed to cancel payment', 500);
    }
  }

  /**
   * Webhook 검증
   */
  verifyWebhook(payload, signature) {
    // Toss는 별도의 서명 검증이 없음
    // 대신 결제 조회를 통해 검증
    return true;
  }
}

module.exports = TossProvider;
11.3.3 Payment Service
파일 위치: src/modules/payment/paymentService.js
javascriptconst StripeProvider = require('./providers/StripeProvider');
const TossProvider = require('./providers/TossProvider');
const config = require('../../config');

class PaymentService {
  constructor() {
    this.provider = this.initProvider();
  }

  initProvider() {
    const paymentProvider = config.PAYMENT_PROVIDER || 'stripe';

    switch (paymentProvider) {
      case 'toss':
        return new TossProvider();
      case 'stripe':
      default:
        return new StripeProvider();
    }
  }

  /**
   * 결제 생성
   */
  async createPayment(amount, options = {}) {
    if (this.provider instanceof StripeProvider) {
      return await this.provider.createPaymentIntent(amount, options);
    } else if (this.provider instanceof TossProvider) {
      // Toss는 클라이언트에서 결제 위젯 사용
      throw new Error('Use Toss Payment Widget on client side');
    }
  }

  /**
   * 결제 확인
   */
  async confirmPayment(paymentData) {
    if (this.provider instanceof StripeProvider) {
      return await this.provider.confirmPayment(paymentData.paymentIntentId);
    } else if (this.provider instanceof TossProvider) {
      return await this.provider.confirmPayment(
        paymentData.paymentKey,
        paymentData.orderId,
        paymentData.amount
      );
    }
  }

  /**
   * 환불
   */
  async refund(paymentId, amount = null, reason = 'Customer request') {
    if (this.provider instanceof StripeProvider) {
      return await this.provider.refund(paymentId, amount);
    } else if (this.provider instanceof TossProvider) {
      return await this.provider.cancelPayment(paymentId, reason, amount);
    }
  }

  /**
   * 결제 조회
   */
  async getPayment(paymentId) {
    return await this.provider.getPayment(paymentId);
  }

  /**
   * Webhook 처리
   */
  async handleWebhook(payload, signature) {
    const event = this.provider.verifyWebhookSignature(payload, signature);

    // 이벤트 타입별 처리
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  async handlePaymentSuccess(paymentIntent) {
    // 결제 성공 시 비즈니스 로직
    // 예: 주문 상태 업데이트, 이메일 발송 등
    console.log('Payment succeeded:', paymentIntent.id);
  }

  async handlePaymentFailed(paymentIntent) {
    // 결제 실패 시 비즈니스 로직
    console.log('Payment failed:', paymentIntent.id);
  }
}

module.exports = new PaymentService();
11.4 Queue System (Bull)
11.4.1 Queue Wrapper
파일 위치: src/modules/queue/Queue.js
환경 변수:
REDIS_URL=redis://localhost:6379
구현:
javascriptconst Queue = require('bull');
const config = require('../../config');
const logger = require('../../core/logger');

class QueueManager {
  constructor() {
    this.queues = new Map();
    this.redisConfig = {
      redis: config.REDIS_URL || 'redis://localhost:6379'
    };
  }

  /**
   * Queue 생성 또는 가져오기
   */
  getQueue(queueName) {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, this.redisConfig);

      // 에러 핸들러
      queue.on('error', (error) => {
        logger.error(`Queue ${queueName} error:`, error);
      });

      queue.on('failed', (job, error) => {
        logger.error(`Job ${job.id} in ${queueName} failed:`, error);
      });

      queue.on('completed', (job) => {
        logger.info(`Job ${job.id} in ${queueName} completed`);
      });

      this.queues.set(queueName, queue);
    }

    return this.queues.get(queueName);
  }

  /**
   * Job 추가
   */
  async addJob(queueName, data, options = {}) {
    const queue = this.getQueue(queueName);

    const jobOptions = {
      attempts: options.attempts || 3,
      backoff: options.backoff || {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: options.removeOnComplete !== false,
      removeOnFail: options.removeOnFail || false,
      delay: options.delay || 0,
      priority: options.priority || 0
    };

    const job = await queue.add(data, jobOptions);

    logger.info(`Job ${job.id} added to ${queueName}`);

    return job;
  }

  /**
   * Worker 등록
   */
  registerWorker(queueName, processor, options = {}) {
    const queue = this.getQueue(queueName);

    const workerOptions = {
      concurrency: options.concurrency || 1
    };

    queue.process(workerOptions.concurrency, async (job) => {
      logger.info(`Processing job ${job.id} in ${queueName}`);
      return await processor(job);
    });

    logger.info(`Worker registered for ${queueName}`);
  }

  /**
   * 스케줄링된 Job 추가 (Cron)
   */
  async addRepeatableJob(queueName, data, cronExpression, options = {}) {
    const queue = this.getQueue(queueName);

    const job = await queue.add(data, {
      repeat: {
        cron: cronExpression
      },
      ...options
    });

    logger.info(`Repeatable job added to ${queueName}: ${cronExpression}`);

    return job;
  }

  /**
   * Queue 상태 조회
   */
  async getQueueStats(queueName) {
    const queue = this.getQueue(queueName);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed
    };
  }

  /**
   * Queue 정리
   */
  async cleanQueue(queueName, grace = 0, limit = 1000) {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, limit);
    logger.info(`Queue ${queueName} cleaned`);
  }

  /**
   * 모든 Queue 종료
   */
  async closeAll() {
    for (const [name, queue] of this.queues) {
      await queue.close();
      logger.info(`Queue ${name} closed`);
    }
    this.queues.clear();
  }
}

module.exports = new QueueManager();
11.4.2 Email Worker
파일 위치: src/modules/queue/workers/emailWorker.js
javascriptconst queueManager = require('../Queue');
const emailService = require('../../email/emailService');
const logger = require('../../../core/logger');

/**
 * Email Worker 프로세서
 */
async function processEmailJob(job) {
  const { type, data } = job.data;

  try {
    switch (type) {
      case 'welcome':
        await emailService.sendWelcomeEmail(data.user, data.verificationUrl);
        break;

      case 'passwordReset':
        await emailService.sendPasswordResetEmail(data.user, data.resetUrl);
        break;

      case 'magicLink':
        await emailService.sendMagicLink(data.email, data.magicLink);
        break;

      case 'custom':
        await emailService.sendCustomEmail(data);
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    logger.info(`Email job ${job.id} processed successfully`);
    return { success: true };
  } catch (error) {
    logger.error(`Email job ${job.id} failed:`, error);
    throw error;
  }
}

// Worker 등록
queueManager.registerWorker('email', processEmailJob, {
  concurrency: 5  // 동시에 5개 이메일 처리
});

module.exports = processEmailJob;
11.4.3 Job Helper
파일 위치: src/modules/queue/jobs/sendEmailJob.js
javascriptconst queueManager = require('../Queue');

/**
 * Welcome Email Job 추가
 */
async function sendWelcomeEmail(user, verificationUrl) {
  return await queueManager.addJob('email', {
    type: 'welcome',
    data: { user, verificationUrl }
  });
}

/**
 * Password Reset Email Job 추가
 */
async function sendPasswordResetEmail(user, resetUrl) {
  return await queueManager.addJob('email', {
    type: 'passwordReset',
    data: { user, resetUrl }
  });
}

/**
 * 지연된 이메일 전송
 */
async function sendDelayedEmail(emailData, delayMs) {
  return await queueManager.addJob('email', {
    type: 'custom',
    data: emailData
  }, {
    delay: delayMs
  });
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendDelayedEmail
};
11.5 Scheduler (Cron)
11.5.1 Scheduler Wrapper
파일 위치: src/modules/scheduler/Scheduler.js
javascriptconst cron = require('node-cron');
const logger = require('../../core/logger');

class Scheduler {
  constructor() {
    this.tasks = new Map();
  }

  /**
   * 스케줄 등록
   * @param {string} name - Task 이름
   * @param {string} cronExpression - Cron 표현식
   * @param {Function} task - 실행할 함수
   * @param {Object} options - 옵션
   */
  register(name, cronExpression, task, options = {}) {
    if (this.tasks.has(name)) {
      logger.warn(`Task ${name} already registered`);
      return;
    }

    // Cron 표현식 검증
    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const scheduledTask = cron.schedule(
      cronExpression,
      async () => {
        logger.info(`Running scheduled task: ${name}`);
        try {
          await task();
          logger.info(`Task ${name} completed`);
        } catch (error) {
          logger.error(`Task ${name} failed:`, error);
        }
      },
      {
        scheduled: options.scheduled !== false,
        timezone: options.timezone || 'Asia/Seoul'
      }
    );

    this.tasks.set(name, {
      task: scheduledTask,
      cronExpression,
      options
    });

    logger.info(`Task ${name} registered: ${cronExpression}`);
  }

  /**
   * Task 시작
   */
  start(name) {
    const task = this.tasks.get(name);
    if (task) {
      task.task.start();
      logger.info(`Task ${name} started`);
    }
  }

  /**
   * Task 정지
   */
  stop(name) {
    const task = this.tasks.get(name);
    if (task) {
      task.task.stop();
      logger.info(`Task ${name} stopped`);
    }
  }

  /**
   * Task 제거
   */
  unregister(name) {
    const task = this.tasks.get(name);
    if (task) {
      task.task.stop();
      task.task.destroy();
      this.tasks.delete(name);
      logger.info(`Task ${name} unregistered`);
    }
  }

  /**
   * 모든 Task 시작
   */
  startAll() {
    for (const [name, task] of this.tasks) {
      task.task.start();
    }
    logger.info('All tasks started');
  }

  /**
   * 모든 Task 정지
   */
  stopAll() {
    for (const [name, task] of this.tasks) {
      task.task.stop();
    }
    logger.info('All tasks stopped');
  }

  /**
   * 등록된 Task 목록
   */
  list() {
    return Array.from(this.tasks.keys()).map(name => {
      const task = this.tasks.get(name);
      return {
        name,
        cronExpression: task.cronExpression,
        running: task.task.running || false
      };
    });
  }
}

module.exports = new Scheduler();
11.5.2 Cleanup Task
파일 위치: src/modules/scheduler/tasks/cleanupExpiredTokens.js
javascriptconst { createRepository } = require('../../database');
const logger = require('../../../core/logger');

/**
 * 만료된 Refresh Token 정리
 */
async function cleanupExpiredTokens() {
  try {
    // RefreshToken 모델 가져오기
    const RefreshToken = require('../../auth/models/RefreshToken');
    const tokenRepo = createRepository(RefreshToken);

    // 만료된 토큰 삭제
    const result = await tokenRepo.bulkDelete({
      expiresAt: { $lt: new Date() }
    });

    logger.info(`Cleaned up ${result} expired tokens`);
  } catch (error) {
    logger.error('Token cleanup error:', error);
    throw error;
  }
}

module.exports = cleanupExpiredTokens;
11.5.3 Task 등록
파일 위치: src/modules/scheduler/tasks/index.js
javascriptconst scheduler = require('../Scheduler');
const cleanupExpiredTokens = require('./cleanupExpiredTokens');

/**
 * 모든 스케줄 등록
 */
function registerAllTasks() {
  // 매일 자정에 만료된 토큰 정리
  scheduler.register(
    'cleanupExpiredTokens',
    '0 0 * * *',  // 매일 00:00
    cleanupExpiredTokens
  );

  // 매주 월요일 오전 9시에 주간 리포트 생성 (예시)
  scheduler.register(
    'generateWeeklyReport',
    '0 9 * * 1',  // 매주 월요일 09:00
    async () => {
      console.log('Generating weekly report...');
      // 리포트 생성 로직
    }
  );

  // 매시간 캐시 정리 (예시)
  scheduler.register(
    'cleanupCache',
    '0 * * * *',  // 매시간 00분
    async () => {
      console.log('Cleaning up cache...');
      // 캐시 정리 로직
    }
  );

  logger.info('All scheduled tasks registered');
}

module.exports = {
  registerAllTasks
};
📦 패키지 의존성
json"dependencies": {
  "nodemailer": "^6.9.7",
  "handlebars": "^4.7.8",
  "twilio": "^4.20.0",
  "stripe": "^14.5.0",
  "bull": "^4.12.0",
  "node-cron": "^3.0.3",
  "axios": "^1.6.2"
}
📝 사용 예제
파일 위치: examples/day11-external-services.js
javascriptconst express = require('express');
const emailService = require('../src/modules/email/emailService');
const smsService = require('../src/modules/sms/smsService');
const paymentService = require('../src/modules/payment/paymentService');
const { sendWelcomeEmail } = require('../src/modules/queue/jobs/sendEmailJob');
const { registerAllTasks } = require('../src/modules/scheduler/tasks');

const app = express();
app.use(express.json());

// 1. 이메일 전송 (즉시)
app.post('/send-email', async (req, res) => {
  await emailService.sendWelcomeEmail(
    { name: 'John', email: 'john@example.com' },
    'https://example.com/verify?token=...'
  );
  res.json({ success: true });
});

// 2. 이메일 전송 (큐 사용 - 비동기)
app.post('/send-email-async', async (req, res) => {
  await sendWelcomeEmail(
    { name: 'John', email: 'john@example.com' },
    'https://example.com/verify?token=...'
  );
  res.json({ success: true, message: 'Email queued' });
});

// 3. SMS 전송
app.post('/send-sms', async (req, res) => {
  await smsService.sendSms('+821012345678', 'Hello from SMS!');
  res.json({ success: true });
});

// 4. OTP 전송
app.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  await smsService.sendOtp(phoneNumber);
  res.json({ success: true });
});

// 5. OTP 검증
app.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;
  await smsService.verifyOtp(phoneNumber, otp);
  res.json({ success: true });
});

// 6. 결제 생성
app.post('/payment/create', async (req, res) => {
  const { amount } = req.body;
  const payment = await paymentService.createPayment(amount);
  res.json(payment);
});

// 7. 결제 확인 (Toss Payments)
app.post('/payment/confirm', async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;
  const result = await paymentService.confirmPayment({
    paymentKey,
    orderId,
    amount
  });
  res.json(result);
});

// 8. 환불
app.post('/payment/refund', async (req, res) => {
  const { paymentId, amount } = req.body;
  const result = await paymentService.refund(paymentId, amount);
  res.json(result);
});

// 9. Webhook (Stripe)
app.post('/webhooks/stripe', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  await paymentService.handleWebhook(req.body, signature);
  res.json({ received: true });
});

// 10. 스케줄러 시작
registerAllTasks();

app.listen(3000);
✅ 완료 기준

 Nodemailer 이메일 전송 성공
 이메일 템플릿 렌더링 (Handlebars)
 Twilio SMS 전송 성공
 OTP 생성/검증 정상 동작
 Stripe 결제 생성/확인/환불
 Toss Payments 결제 확인/취소
 Bull Queue 작업 추가/처리
 Email Worker 동작
 Cron 스케줄러 정상 실행
 토큰 정리 Task 동작