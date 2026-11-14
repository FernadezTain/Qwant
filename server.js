import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(root, '.env') });

const app = express();
const fernieIdUrl = (process.env.FERNIEID_API_URL || 'https://ferniex-id.vercel.app').replace(/\/$/, '');
const fernieIdApiKey = process.env.FERNIEID_API_KEY;
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

async function requestFernieId(endpoint, body, headers = {}) {
  const response = await fetch(`${fernieIdUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });
  const contentType = response.headers.get('content-type') || 'application/json';
  const text = await response.text();
  return { status: response.status, contentType, text };
}

app.post('/api/auth/login', authRateLimit, async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!username || !password) return res.status(400).json({ success: false, error: 'Введите логин и пароль' });
  if (!fernieIdApiKey) return res.status(503).json({ success: false, error: 'Вход пока не настроен: добавьте FERNIEID_API_KEY в окружение сервера' });

  try {
    const result = await requestFernieId('/api/auth/login', { apiKey: fernieIdApiKey, username, password });
    res.status(result.status).type(result.contentType).send(result.text);
  } catch (error) {
    console.error('FernieID login request failed:', error.message);
    res.status(502).json({ success: false, error: 'Не удалось связаться с FernieID. Попробуйте ещё раз.' });
  }
});

app.post('/api/auth/verify-2fa', authRateLimit, async (req, res) => {
  const challengeId = typeof req.body?.challengeId === 'string' ? req.body.challengeId : '';
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!/^[a-f\d]{48}$/i.test(challengeId) || !/^\d{8}$/.test(code)) {
    return res.status(400).json({ success: false, error: 'Введите корректный код из Telegram' });
  }
  if (!fernieIdApiKey) return res.status(503).json({ success: false, error: 'Вход пока не настроен: добавьте FERNIEID_API_KEY в окружение сервера' });

  try {
    const result = await requestFernieId('/api/auth/verify-2fa', { apiKey: fernieIdApiKey, challengeId, code });
    res.status(result.status).type(result.contentType).send(result.text);
  } catch (error) {
    console.error('FernieID verification request failed:', error.message);
    res.status(502).json({ success: false, error: 'Не удалось связаться с FernieID. Попробуйте ещё раз.' });
  }
});

app.use('/api/social', async (req, res) => {
  const authorization = req.get('authorization');
  try {
    const response = await fetch(`${fernieIdUrl}${req.originalUrl}`, {
      method: req.method,
      headers: {
        ...(authorization ? { authorization } : {}),
        ...(req.body && Object.keys(req.body).length ? { 'content-type': 'application/json' } : {})
      },
      ...(req.method === 'GET' || req.method === 'HEAD' ? {} : { body: JSON.stringify(req.body ?? {}) }),
      signal: AbortSignal.timeout(20000)
    });
    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType) res.type(contentType);
    res.send(await response.text());
  } catch (error) {
    console.error('FernieID social request failed:', error.message);
    res.status(502).json({ success: false, error: 'Не удалось загрузить данные Messenger. Попробуйте ещё раз.' });
  }
});

app.use('/api/qwant', async (req, res) => {
  try {
    const city = req.get('x-vercel-ip-city') || '';
    const country = req.get('x-vercel-ip-country') || '';
    const response = await fetch(`${fernieIdUrl}${req.originalUrl}`, {
      method: req.method,
      headers: {
        ...(req.get('authorization') ? { authorization: req.get('authorization') } : {}),
        ...(req.get('user-agent') ? { 'x-qwant-client-user-agent': req.get('user-agent').slice(0, 500) } : {}),
        ...(typeof req.body?.deviceModel === 'string' ? { 'x-qwant-device-model': req.body.deviceModel.slice(0, 80) } : {}),
        ...(city ? { 'x-qwant-location-city': city.slice(0, 120) } : {}),
        ...(country ? { 'x-qwant-location-country': country.slice(0, 8) } : {}),
        ...(req.body && Object.keys(req.body).length ? { 'content-type': 'application/json' } : {})
      },
      ...(req.method === 'GET' || req.method === 'HEAD' ? {} : { body: JSON.stringify(req.body ?? {}) }),
      signal: AbortSignal.timeout(15000)
    });
    const contentType = response.headers.get('content-type');
    res.status(response.status);
    if (contentType) res.type(contentType);
    res.send(await response.text());
  } catch (error) {
    console.error('Qwant API request failed:', error.message);
    res.status(502).json({ success: false, error: 'Сервис временно недоступен. Попробуйте ещё раз.' });
  }
});

app.get('/health', (_req, res) => res.json({ success: true }));
app.use(express.static(root, { index: 'index.html' }));
app.get('*', (_req, res) => res.sendFile(path.join(root, 'index.html')));

app.listen(port, () => console.log(`Qwant Messenger listening on port ${port}`));
