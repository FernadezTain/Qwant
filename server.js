import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { registerQwantApi } from './qwant-api.js';

const root = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(root, '.env') });

const app = express();
const port = Number(process.env.PORT) || 3000;
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много попыток. Попробуйте через 15 минут.' }
});

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '12mb' }));

registerQwantApi(app, { authRateLimit });

app.get('/health', (_req, res) => res.json({ success: true }));
app.use(express.static(root, { index: 'index.html' }));
app.get('*', (_req, res) => res.sendFile(path.join(root, 'index.html')));

app.listen(port, () => console.log(`Qwant Messenger listening on port ${port}`));
