import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth.js';
import { aiRouter } from './routes/ai.js';
import { paymentRouter } from './routes/payments.js';
import { userRouter } from './routes/user.js';
import { analyticsRouter } from './routes/analytics.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/analytics', analyticsRouter);

// Protected routes
app.use('/api/ai', authMiddleware, aiRouter);
app.use('/api/user', authMiddleware, userRouter);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '2.0.0' }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SmartCV API running on port ${PORT}`);
});
