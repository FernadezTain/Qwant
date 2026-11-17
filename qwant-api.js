import { createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const databaseUrl = (process.env.QWANT_SUPABASE_URL || '').replace(/\/$/, '');
const databaseKey = process.env.QWANT_SUPABASE_SECRET_KEY || '';
const sessionSecret = process.env.QWANT_SESSION_SECRET || '';
const sessionTtlSeconds = 30 * 24 * 60 * 60;
const usernamePattern = /^[A-Za-zА-Яа-яЁё0-9_]{3,20}$/;

function configurationReady() {
  return Boolean(databaseUrl && databaseKey && Buffer.byteLength(sessionSecret) >= 32);
}

function inputError(message, status = 400) {
  const error = new Error(message);
  error.expose = true;
  error.status = status;
  return error;
}

function respondError(res, error, status = 500) {
  console.error('Qwant API error:', error.message);
  const exposeMessage = error.expose === true || (error.code === 'P0001' && status < 500);
  res.status(exposeMessage ? error.status || status : status).json({
    success: false,
    error: exposeMessage ? error.message : 'Сервис временно недоступен. Попробуйте ещё раз.'
  });
}

function respondGroupCallError(res, error) {
  console.error('Qwant group call database error:', error.code || 'unknown', error.message);
  if (['PGRST202', 'PGRST203', 'PGRST205', '42P01', '42702', '42703', '42883', '42501'].includes(error.code)) {
    console.error('Qwant group call migration is missing, stale, or lacks service-role permissions:', error.code);
    return res.status(503).json({ success:false, error:'Групповые звонки пока не настроены. Выполните qwant_group_calls.sql в Supabase, затем повторите попытку.' });
  }
  respondError(res, error, error.code === 'P0001' ? 400 : error.status >= 500 ? error.status : 500);
}

async function supabase(path, { method = 'GET', body, prefer = 'return=representation', headers = {} } = {}) {
  if (!configurationReady()) throw new Error('QwantID backend is not configured');
  const response = await fetch(`${databaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: databaseKey,
      Authorization: `Bearer ${databaseKey}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20000)
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const error = new Error(data?.message || data?.hint || 'Database request failed');
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }
  return data;
}

function queryString(values) {
  return new URLSearchParams(values).toString();
}

function signToken(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: String(userId), exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readToken(token) {
  if (typeof token !== 'string') return null;
  const [payload, signature, ...rest] = token.split('.');
  if (!payload || !signature || rest.length) return null;
  const expected = createHmac('sha256', sessionSecret).update(payload).digest();
  let actual;
  try { actual = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return /^\d+$/.test(claims.sub) && Number.isInteger(claims.exp) && claims.exp > Date.now() / 1000 ? claims : null;
  } catch { return null; }
}

async function currentUser(req) {
  const token = req.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const claims = readToken(token);
  if (!claims) return null;
  const users = await supabase(`users?id=eq.${encodeURIComponent(claims.sub)}&select=id,username,display_name,avatar_url,banner_url,description,role,messenger_verification&limit=1`);
  return users[0] || null;
}

function publicUser(user) {
  if (!user) return null;
  const { role, messenger_verification, ...profile } = user;
  const level = ['basic', 'full'].includes(messenger_verification) ? messenger_verification : 'none';
  return { ...profile, display_name: profile.display_name || profile.username, verification_level: level, is_verified: level !== 'none', is_official_admin: false };
}

function parseImage(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(dataUrl || ''));
  if (!match) return null;
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.toString('base64').replace(/=+$/, '') !== match[2].replace(/=+$/, '')) return null;
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[match[1]];
  return { buffer, contentType: match[1], extension };
}

async function uploadImage(bucket, prefix, dataUrl, maxBytes) {
  const image = parseImage(dataUrl);
  if (!image) throw inputError('Выберите изображение JPG, PNG или WEBP');
  if (image.buffer.length > maxBytes) throw inputError(`Изображение не должно превышать ${Math.round(maxBytes / 1024 / 1024)} МБ`, 413);
  const name = `${prefix}_${randomBytes(12).toString('hex')}.${image.extension}`;
  const response = await fetch(`${databaseUrl}/storage/v1/object/${bucket}/${name}`, {
    method: 'POST',
    headers: { apikey: databaseKey, Authorization: `Bearer ${databaseKey}`, 'Content-Type': image.contentType, 'x-upsert': 'false' },
    body: image.buffer,
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('Не удалось загрузить изображение');
  return `${databaseUrl}/storage/v1/object/public/${bucket}/${name}`;
}

async function getConversation(conversationId, userId) {
  const rows = await supabase(`social_conversations?id=eq.${encodeURIComponent(conversationId)}&or=(participant_one.eq.${userId},participant_two.eq.${userId})&select=id,participant_one,participant_two,last_message_at,last_message_text,last_message_sender_id&limit=1`);
  return rows[0] || null;
}

async function ensureNotHidden(userId, conversationId) {
  await supabase(`social_hidden_conversations?user_id=eq.${userId}&conversation_id=eq.${encodeURIComponent(conversationId)}`, { method: 'DELETE', prefer: 'return=minimal' });
}

async function clearConversation(conversationId) {
  await supabase(`social_messages?conversation_id=eq.${encodeURIComponent(conversationId)}`, { method: 'DELETE', prefer: 'return=minimal' });
  await supabase(`social_conversations?id=eq.${encodeURIComponent(conversationId)}`, {
    method: 'PATCH', prefer: 'return=minimal',
    body: { last_message_at: null, last_message_text: null, last_message_sender_id: null }
  });
}

async function groupMembership(groupId, userId) {
  const rows = await supabase(`social_group_members?group_id=eq.${encodeURIComponent(groupId)}&user_id=eq.${encodeURIComponent(userId)}&select=group_id,role,last_read_at&limit=1`);
  return rows[0] || null;
}

async function userMap(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean).map(String))];
  if (!uniqueIds.length) return new Map();
  const rows = await supabase(`users?id=in.(${uniqueIds.map(encodeURIComponent).join(',')})&select=id,username,display_name,avatar_url,banner_url,description,messenger_verification`);
  return new Map(rows.map(row => [String(row.id), publicUser(row)]));
}

async function presenceMap(ids) {
  const uniqueIds = [...new Set(ids.filter(id => /^\d+$/.test(String(id))).map(String))];
  if (!uniqueIds.length) return new Map();
  const query = uniqueIds.map(encodeURIComponent).join(',');
  const [presence, settings] = await Promise.all([
    supabase(`qwant_messenger_presence?user_id=in.(${query})&select=user_id,last_seen_at`),
    supabase(`qwant_messenger_settings?user_id=in.(${query})&select=user_id,show_online_status`)
  ]);
  const seenByUser = new Map(presence.map(row => [String(row.user_id), row.last_seen_at]));
  const settingsByUser = new Map(settings.map(row => [String(row.user_id), row.show_online_status]));
  const onlineAfter = Date.now() - 60000;
  return new Map(uniqueIds.map(id => {
    const lastSeenAt = seenByUser.get(id) || null;
    const hidden = settingsByUser.get(id) === false;
    const online = lastSeenAt && Date.parse(lastSeenAt) >= onlineAfter;
    return [id, {
      presence_state: hidden ? 'recently' : online ? 'online' : 'offline',
      last_seen_at: hidden ? null : lastSeenAt
    }];
  }));
}

async function loadGroupMembers(groupId) {
  const rows = await supabase(`social_group_members?group_id=eq.${encodeURIComponent(groupId)}&select=user_id,role,joined_at,last_read_at&order=joined_at.asc`);
  const profiles = await userMap(rows.map(row => row.user_id));
  return { rows, profiles };
}

async function markCallSignal(callId, conversationId, callerId, recipientId, type) {
  const now = new Date().toISOString();
  if (type === 'invite') {
    await supabase('qwant_call_history?on_conflict=call_id', {
      method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
      body: { call_id: callId, conversation_id: conversationId, caller_id: callerId, recipient_id: recipientId, status: 'ringing', started_at: now }
    });
    return;
  }
  const history = await supabase(`qwant_call_history?call_id=eq.${encodeURIComponent(callId)}&select=call_id,started_at,accepted_at,status&limit=1`);
  if (!history[0]) return;
  if (type === 'accepted') {
    await supabase(`qwant_call_history?call_id=eq.${encodeURIComponent(callId)}`, { method: 'PATCH', prefer: 'return=minimal', body: { status: 'in_progress', accepted_at: now } });
  } else if (type === 'declined') {
    await supabase(`qwant_call_history?call_id=eq.${encodeURIComponent(callId)}`, { method: 'PATCH', prefer: 'return=minimal', body: { status: 'declined', ended_at: now } });
  } else if (type === 'hangup') {
    const started = Date.parse(history[0].accepted_at || history[0].started_at);
    const duration = history[0].accepted_at ? Math.max(0, Math.floor((Date.now() - started) / 1000)) : 0;
    await supabase(`qwant_call_history?call_id=eq.${encodeURIComponent(callId)}`, {
      method: 'PATCH', prefer: 'return=minimal',
      body: { status: history[0].accepted_at ? 'completed' : 'missed', ended_at: now, duration_seconds: duration }
    });
  }
}

export function registerQwantApi(app, { authRateLimit }) {
  app.use('/api', (_req, res, next) => {
    if (!configurationReady()) return res.status(503).json({ success: false, error: 'QwantID backend is not configured' });
    next();
  });

  app.post('/api/auth/check-username', authRateLimit, async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    if (!usernamePattern.test(username)) return res.status(400).json({ success: false, error: 'NickName должен содержать 3–20 букв, цифр или подчёркиваний' });
    try {
      const users = await supabase(`users?username=ilike.${encodeURIComponent(username)}&select=username&limit=1`);
      res.json({ success: true, exists: users.length > 0, username: users[0]?.username || username });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/auth/register', authRateLimit, async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!usernamePattern.test(username) || !displayName || displayName.length > 40 || password.length < 8 || password.length > 256) {
      return res.status(400).json({ success: false, error: 'Проверьте NickName, пароль (от 8 символов) и отображаемое имя (до 40 символов)' });
    }
    try {
      const salt = randomBytes(16).toString('hex');
      const hash = await scrypt(password, salt, 64, { N: 32768, maxmem: 64 * 1024 * 1024 });
      const rows = await supabase('users', {
        method: 'POST', body: { username, display_name: displayName, password_hash: `scrypt$${salt}$${Buffer.from(hash).toString('hex')}` },
        headers: { Prefer: 'return=representation' }
      });
      const user = rows[0];
      res.status(201).json({ success: true, userId: user.id, username: user.username, displayName: user.display_name, role: user.role, sessionToken: signToken(user.id), telegramLinked: false });
    } catch (error) {
      if (error.status === 409 || error.code === '23505') return res.status(409).json({ success: false, error: 'Этот NickName уже занят. Войдите в аккаунт.' });
      respondError(res, error);
    }
  });

  app.post('/api/auth/login', authRateLimit, async (req, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!username || !password) return res.status(400).json({ success: false, error: 'Введите логин и пароль' });
    try {
      const users = await supabase(`users?username=ilike.${encodeURIComponent(username)}&select=id,username,display_name,password_hash,role&limit=1`);
      const user = users[0];
      if (!user) return res.status(401).json({ success: false, error: 'Неверный NickName или пароль' });
      const [scheme, salt, expectedHex] = String(user.password_hash || '').split('$');
      if (scheme !== 'scrypt' || !salt || !expectedHex) return res.status(401).json({ success: false, error: 'Неверный NickName или пароль' });
      const actual = Buffer.from(await scrypt(password, salt, 64, { N: 32768, maxmem: 64 * 1024 * 1024 }));
      const expected = Buffer.from(expectedHex, 'hex');
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return res.status(401).json({ success: false, error: 'Неверный NickName или пароль' });
      res.json({ success: true, userId: user.id, username: user.username, displayName: user.display_name || user.username, role: user.role || 'user', sessionToken: signToken(user.id), telegramLinked: false });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/auth/verify-2fa', authRateLimit, (_req, res) => res.status(410).json({ success: false, error: 'Подтверждение через FernieID временно недоступно' }));

  app.use('/api/social', async (req, res, next) => {
    try { req.qwantUser = await currentUser(req); next(); } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/chat-users', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const query = String(req.query.q || '').trim().replace(/^@+/, '');
    if (query.length < 2 || query.length > 32 || !/^[\p{L}\p{N}_]+$/u.test(query)) return res.json({ success: true, users: [] });
    try {
      const rows = await supabase(`users?username=ilike.*${encodeURIComponent(query)}*&id=neq.${user.id}&select=id,username,display_name,avatar_url,description,messenger_verification&limit=15`);
      res.json({ success: true, users: rows.map(publicUser) });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/profile/:targetId', async (req, res) => {
    try {
      const rows = await supabase(`users?id=eq.${encodeURIComponent(req.params.targetId)}&select=id,username,display_name,avatar_url,banner_url,description,messenger_verification&limit=1`);
      if (!rows[0]) return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      const presence = await presenceMap([rows[0].id]);
      res.json({ success: true, user: { ...publicUser(rows[0]), ...presence.get(String(rows[0].id)) } });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/presence', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      await supabase('qwant_messenger_presence?on_conflict=user_id', {
        method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
        body: { user_id: user.id, last_seen_at: new Date().toISOString() }
      });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/chats', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const [conversations, hidden] = await Promise.all([
        supabase(`social_conversations?or=(participant_one.eq.${user.id},participant_two.eq.${user.id})&select=id,participant_one,participant_two,created_at,last_message_at,last_message_text,last_message_sender_id&order=last_message_at.desc.nullslast,created_at.desc&limit=100`),
        supabase(`social_hidden_conversations?user_id=eq.${user.id}&select=conversation_id`)
      ]);
      const hiddenIds = new Set(hidden.map(row => String(row.conversation_id)));
      const visible = conversations.filter(row => !hiddenIds.has(String(row.id)));
      const partners = await userMap(visible.map(row => String(row.participant_one) === String(user.id) ? row.participant_two : row.participant_one));
      const partnerIds = visible.map(row => String(row.participant_one) === String(user.id) ? row.participant_two : row.participant_one);
      const presence = await presenceMap(partnerIds);
      const unread = visible.length ? await supabase(`social_messages?conversation_id=in.(${visible.map(row => encodeURIComponent(row.id)).join(',')})&recipient_id=eq.${user.id}&read_at=is.null&select=conversation_id`) : [];
      const unreadCounts = new Map();
      unread.forEach(row => unreadCounts.set(String(row.conversation_id), (unreadCounts.get(String(row.conversation_id)) || 0) + 1));
      res.json({ success: true, chats: visible.map(row => {
        const partnerId = String(row.participant_one) === String(user.id) ? row.participant_two : row.participant_one;
        return { id: row.id, partner: { ...(partners.get(String(partnerId)) || { id: partnerId, username: 'Пользователь' }), ...presence.get(String(partnerId)) }, lastMessage: row.last_message_text, lastMessageSenderId: row.last_message_sender_id, lastMessageAt: row.last_message_at, unreadCount: unreadCounts.get(String(row.id)) || 0 };
      }) });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/chats', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const recipientId = String(req.body?.recipientId || '');
    if (!/^\d+$/.test(recipientId) || recipientId === String(user.id)) return res.status(400).json({ success: false, error: 'Некорректный собеседник' });
    try {
      const recipientRows = await supabase(`users?id=eq.${recipientId}&select=id,username,display_name,avatar_url,description,messenger_verification&limit=1`);
      if (!recipientRows[0]) return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      const ids = [String(user.id), recipientId].sort((a, b) => BigInt(a) < BigInt(b) ? -1 : 1);
      const query = `social_conversations?participant_one=eq.${ids[0]}&participant_two=eq.${ids[1]}&select=id,participant_one,participant_two,last_message_at,last_message_text,last_message_sender_id&limit=1`;
      let conversations = await supabase(query);
      if (!conversations.length) {
        const preferences = await supabase(`qwant_messenger_settings?user_id=eq.${user.id}&select=allow_new_chats&limit=1`);
        if (preferences[0]?.allow_new_chats === false) return res.status(403).json({ success: false, error: 'В настройках конфиденциальности отключено создание новых чатов' });
        await supabase('social_conversations?on_conflict=participant_one,participant_two', { method: 'POST', prefer: 'resolution=ignore-duplicates,return=minimal', body: { participant_one: ids[0], participant_two: ids[1] } });
        conversations = await supabase(query);
      }
      const conversation = conversations[0];
      await ensureNotHidden(user.id, conversation.id);
      res.json({ success: true, conversation, partner: publicUser(recipientRows[0]) });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/chats/:conversationId/messages', async (req, res) => {
    const user = req.qwantUser;
    const { conversationId } = req.params;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      if (!await getConversation(conversationId, user.id)) return res.status(404).json({ success: false, error: 'Чат не найден' });
      const rows = await supabase(`social_messages?conversation_id=eq.${encodeURIComponent(conversationId)}&select=id,conversation_id,sender_id,recipient_id,body,image_url,message_type,gift_payload,reply_to_message_id,created_at,delivered_at,read_at,deleted_at&order=created_at.desc,id.desc&limit=100`);
      const profiles = await userMap(rows.map(row => row.sender_id));
      res.json({ success: true, messages: rows.reverse().map(row => ({ ...row, sender: profiles.get(String(row.sender_id)) || null })) });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/chats/:conversationId/messages', async (req, res) => {
    const user = req.qwantUser;
    const { conversationId } = req.params;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    const imageBase64 = typeof req.body?.imageBase64 === 'string' ? req.body.imageBase64 : '';
    const replyToMessageId = typeof req.body?.replyToMessageId === 'string' ? req.body.replyToMessageId : null;
    try {
      const conversation = await getConversation(conversationId, user.id);
      if (!conversation) return res.status(404).json({ success: false, error: 'Чат не найден' });
      if (body.length > 4000 || (!body && !imageBase64)) return res.status(400).json({ success: false, error: 'Добавьте текст или изображение (текст до 4000 символов)' });
      let imageUrl = null;
      if (imageBase64) imageUrl = await uploadImage('social-chat-media', `chat_${conversationId}`, imageBase64, 8 * 1024 * 1024);
      const result = await supabase('rpc/send_social_message', { method: 'POST', body: { p_conversation_id: conversationId, p_sender_id: user.id, p_body: body, p_image_url: imageUrl, p_reply_to_message_id: replyToMessageId } });
      const message = Array.isArray(result) ? result[0] : null;
      await Promise.all([ensureNotHidden(conversation.participant_one, conversationId), ensureNotHidden(conversation.participant_two, conversationId)]);
      res.json({ success: true, message: { ...message, sender: publicUser(user) } });
    } catch (error) { respondError(res, error, error.status === 413 ? 413 : 400); }
  });

  app.delete('/api/social/chats/:conversationId/messages/:messageId', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      if (!await getConversation(req.params.conversationId, user.id)) return res.status(404).json({ success: false, error: 'Чат не найден' });
      const rows = await supabase('rpc/delete_social_message', { method: 'POST', body: { p_message_id: req.params.messageId, p_user_id: user.id } });
      res.json({ success: true, message: rows?.[0] });
    } catch (error) { respondError(res, error, 403); }
  });

  app.patch('/api/social/chats/:conversationId/read', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      if (!await getConversation(req.params.conversationId, user.id)) return res.status(404).json({ success: false, error: 'Чат не найден' });
      const settings = await supabase(`qwant_messenger_settings?user_id=eq.${user.id}&select=read_receipts&limit=1`);
      if (settings[0]?.read_receipts === false) return res.json({ success: true, skipped: true });
      await supabase(`social_messages?conversation_id=eq.${encodeURIComponent(req.params.conversationId)}&recipient_id=eq.${user.id}&read_at=is.null`, { method: 'PATCH', prefer: 'return=minimal', body: { read_at: new Date().toISOString() } });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/chats/:conversationId/unread', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      if (!await getConversation(req.params.conversationId, user.id)) return res.status(404).json({ success: false, error: 'Чат не найден' });
      const latest = await supabase(`social_messages?conversation_id=eq.${encodeURIComponent(req.params.conversationId)}&recipient_id=eq.${user.id}&select=id&order=created_at.desc,id.desc&limit=1`);
      if (!latest.length) return res.json({ success: true, unread: false });
      await supabase(`social_messages?id=eq.${encodeURIComponent(latest[0].id)}&recipient_id=eq.${user.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { read_at: null } });
      res.json({ success: true, unread: true });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/chats/:conversationId/hide', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      if (!await getConversation(req.params.conversationId, user.id)) return res.status(404).json({ success: false, error: 'Чат не найден' });
      await clearConversation(req.params.conversationId);
      await supabase('social_hidden_conversations?on_conflict=user_id,conversation_id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: { user_id: user.id, conversation_id: req.params.conversationId } });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/chats/:conversationId/clear', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      if (!await getConversation(req.params.conversationId, user.id)) return res.status(404).json({ success: false, error: 'Чат не найден' });
      await clearConversation(req.params.conversationId);
      await ensureNotHidden(user.id, req.params.conversationId);
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/chats/:conversationId/unhide', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      if (!await getConversation(req.params.conversationId, user.id)) return res.status(404).json({ success: false, error: 'Чат не найден' });
      await ensureNotHidden(user.id, req.params.conversationId);
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/chats/:conversationId/presence', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      if (!await getConversation(req.params.conversationId, user.id)) return res.status(404).json({ success: false, error: 'Чат не найден' });
      await supabase('social_chat_presence?on_conflict=user_id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: { user_id: user.id, conversation_id: req.params.conversationId, last_seen_at: new Date().toISOString(), is_typing: req.body?.typing === true } });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.delete('/api/social/chats/:conversationId/presence', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      await supabase(`social_chat_presence?user_id=eq.${user.id}&conversation_id=eq.${encodeURIComponent(req.params.conversationId)}`, { method: 'DELETE', prefer: 'return=minimal' });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/chats/:conversationId/presence', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const conversation = await getConversation(req.params.conversationId, user.id);
      if (!conversation) return res.status(404).json({ success: false, error: 'Чат не найден' });
      const partnerId = String(conversation.participant_one) === String(user.id) ? conversation.participant_two : conversation.participant_one;
      const settings = await supabase(`qwant_messenger_settings?user_id=eq.${partnerId}&select=show_online_status&limit=1`);
      if (settings[0]?.show_online_status === false) return res.json({ success: true, inChat: false, typing: false });
      const cutoff = new Date(Date.now() - 30000).toISOString();
      const presence = await supabase(`social_chat_presence?user_id=eq.${partnerId}&conversation_id=eq.${encodeURIComponent(req.params.conversationId)}&last_seen_at=gte.${encodeURIComponent(cutoff)}&select=is_typing&limit=1`);
      res.json({ success: true, inChat: presence.length > 0, typing: presence[0]?.is_typing === true });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/favorites/messages', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const rows = await supabase(`social_favorite_messages?user_id=eq.${user.id}&select=id,body,image_url,created_at&order=created_at.desc,id.desc&limit=500`);
      res.json({ success: true, messages: rows.reverse() });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/favorites/messages', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    try {
      if ((!body && !req.body?.imageBase64) || body.length > 4000) return res.status(400).json({ success: false, error: 'Добавьте текст или фотографию (текст до 4000 символов)' });
      const imageUrl = req.body?.imageBase64 ? await uploadImage('social-chat-media', `favorite_${user.id}`, req.body.imageBase64, 8 * 1024 * 1024) : null;
      const rows = await supabase('social_favorite_messages', { method: 'POST', body: { user_id: user.id, body, image_url: imageUrl } });
      res.json({ success: true, message: rows[0] });
    } catch (error) { respondError(res, error, 400); }
  });

  app.delete('/api/social/favorites/messages/:messageId', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const rows = await supabase(`social_favorite_messages?id=eq.${encodeURIComponent(req.params.messageId)}&user_id=eq.${user.id}`, { method: 'DELETE' });
      if (!rows.length) return res.status(404).json({ success: false, error: 'Заметка не найдена' });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/group-chats', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const memberships = await supabase(`social_group_members?user_id=eq.${user.id}&select=group_id,role,last_read_at`);
      if (!memberships.length) return res.json({ success: true, chats: [] });
      const ids = memberships.map(row => row.group_id);
      const [groups, members] = await Promise.all([
        supabase(`social_group_conversations?id=in.(${ids.map(encodeURIComponent).join(',')})&select=id,title,description,avatar_url,invite_code,created_at,last_message_at,last_message_text,last_message_sender_id&order=last_message_at.desc.nullslast,created_at.desc`),
        supabase(`social_group_members?group_id=in.(${ids.map(encodeURIComponent).join(',')})&select=group_id,user_id`)
      ]);
      const counts = new Map();
      members.forEach(row => counts.set(row.group_id, (counts.get(row.group_id) || 0) + 1));
      res.json({ success: true, chats: groups.map(group => ({ id: group.id, title: group.title, description: group.description, avatar_url: group.avatar_url, inviteCode: group.invite_code, is_group: true, isAdmin: memberships.find(row => row.group_id === group.id)?.role === 'admin', memberCount: counts.get(group.id) || 0, lastMessage: group.last_message_text, lastMessageAt: group.last_message_at, lastMessageSenderId: group.last_message_sender_id, unreadCount: 0 })) });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/group-chats/:groupId/call', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      await supabase('rpc/qwant_group_call_sweep', { method:'POST', body:{ p_group_id:req.params.groupId, p_user_id:user.id, p_heartbeat:req.query.heartbeat === '1' } });
      const calls = await supabase(`qwant_group_calls?group_id=eq.${encodeURIComponent(req.params.groupId)}&status=eq.active&select=id,created_by,created_at&limit=1`);
      if (!calls[0]) return res.json({ success:true, call:null });
      const participants = await supabase(`qwant_group_call_participants?call_id=eq.${encodeURIComponent(calls[0].id)}&left_at=is.null&select=user_id,joined_at,session_id&order=joined_at.asc`);
      if (req.query.preview === '1') return res.json({ success:true, call:{ id:calls[0].id, createdAt:calls[0].created_at, participantCount:participants.length } });
      const members = await supabase(`social_group_members?group_id=eq.${encodeURIComponent(req.params.groupId)}&select=user_id,role`);
      const profiles = await userMap(participants.map(participant => participant.user_id));
      const roles = new Map(members.map(member => [String(member.user_id), member.role]));
      res.json({ success:true, call:{ id:calls[0].id, createdBy:String(calls[0].created_by), createdAt:calls[0].created_at, participants:participants.map(participant => ({ ...(profiles.get(String(participant.user_id)) || {}), id:String(participant.user_id), role:roles.get(String(participant.user_id)) || 'member', joinedAt:participant.joined_at, peerSessionId:String(participant.session_id || participant.joined_at) })) } });
    } catch (error) { respondGroupCallError(res, error); }
  });

  app.post('/api/social/group-chats/:groupId/call', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success:false, error:'Требуется войти в QwantID' });
    try {
      const result = await supabase('rpc/qwant_group_call_join', { method:'POST', body:{ p_group_id:req.params.groupId, p_user_id:user.id } });
      if (!result?.[0]) throw new Error('Не удалось создать или открыть групповой звонок');
      res.json({ success:true, callId:result[0].call_id, created:result[0].created });
    } catch (error) { respondGroupCallError(res, error); }
  });

  app.get('/api/social/group-chats/:groupId/call/:callId/signals', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success:false, error:'Требуется войти в QwantID' });
    if (!/^[a-f\d-]{36}$/i.test(req.params.callId)) return res.status(400).json({ success:false, error:'Некорректный звонок' });
    try {
      const signals = await supabase('rpc/qwant_group_call_consume_signals', { method:'POST', body:{ p_call_id:req.params.callId, p_user_id:user.id } });
      res.json({ success:true, signals:(signals || []).map(signal => ({ ...signal, senderId:String(signal.sender_id), type:signal.signal_type })) });
    } catch (error) { respondGroupCallError(res, error); }
  });

  app.post('/api/social/group-chats/:groupId/call/:callId/signals', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success:false, error:'Требуется войти в QwantID' });
    const recipientId = String(req.body?.recipientId || '');
    const type = String(req.body?.type || '');
    const payload = req.body?.payload && typeof req.body.payload === 'object' ? req.body.payload : {};
    if (!/^[a-f\d-]{36}$/i.test(req.params.callId) || !/^\d+$/.test(recipientId) || !['offer', 'answer', 'ice', 'screen_start', 'screen_stop'].includes(type)) return res.status(400).json({ success:false, error:'Некорректное событие звонка' });
    if (JSON.stringify(payload).length > 16000) return res.status(413).json({ success:false, error:'Событие звонка слишком большое' });
    try {
      await supabase('rpc/qwant_group_call_send_signal', { method:'POST', body:{ p_call_id:req.params.callId, p_sender_id:user.id, p_recipient_id:recipientId, p_signal_type:type, p_payload:payload } });
      res.json({ success:true });
    } catch (error) { respondGroupCallError(res, error); }
  });

  app.post('/api/social/group-chats/:groupId/call/:callId/leave', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success:false, error:'Требуется войти в QwantID' });
    if (!/^[a-f\d-]{36}$/i.test(req.params.callId)) return res.status(400).json({ success:false, error:'Некорректный звонок' });
    try {
      const result = await supabase('rpc/qwant_group_call_leave', { method:'POST', body:{ p_group_id:req.params.groupId, p_call_id:req.params.callId, p_user_id:user.id, p_end_for_all:req.body?.endForAll === true } });
      res.json({ success:true, ended:result?.[0]?.ended === true, remaining:Number(result?.[0]?.remaining) || 0 });
    } catch (error) { respondGroupCallError(res, error); }
  });

  app.post('/api/social/group-chats/:groupId/call/:callId/kick', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success:false, error:'Требуется войти в QwantID' });
    const participantId = String(req.body?.participantId || '');
    if (!/^[a-f\d-]{36}$/i.test(req.params.callId) || !/^\d+$/.test(participantId)) return res.status(400).json({ success:false, error:'Некорректный участник звонка' });
    try {
      const result = await supabase('rpc/qwant_group_call_kick', { method:'POST', body:{ p_group_id:req.params.groupId, p_call_id:req.params.callId, p_actor_id:user.id, p_target_id:participantId } });
      res.json({ success:true, remaining:Number(result?.[0]?.remaining) || 0, ended:result?.[0]?.ended === true });
    } catch (error) { respondGroupCallError(res, error); }
  });

  app.get('/api/social/group-invites/:inviteCode', async (req, res) => {
    try {
      const groups = await supabase(`social_group_conversations?invite_code=eq.${encodeURIComponent(req.params.inviteCode)}&select=id,title,description,avatar_url,invite_code&limit=1`);
      if (!groups[0]) return res.status(404).json({ success: false, error: 'Приглашение не найдено' });
      const [members, user] = await Promise.all([
        supabase(`social_group_members?group_id=eq.${encodeURIComponent(groups[0].id)}&select=user_id`),
        currentUser(req)
      ]);
      const isMember = Boolean(user && members.some(row => String(row.user_id) === String(user.id)));
      res.json({ success: true, group: { id: groups[0].id, title: groups[0].title, description: groups[0].description, avatar_url: groups[0].avatar_url, memberCount: members.length, isMember } });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/group-invites/:inviteCode/join', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Войдите в QwantID, чтобы вступить в группу' });
    try {
      const rows = await supabase('rpc/join_social_group', { method: 'POST', body: { p_invite_code: req.params.inviteCode, p_user_id: user.id } });
      if (!rows?.[0]) return res.status(404).json({ success: false, error: 'Приглашение не найдено' });
      res.json({ success: true, group: rows[0] });
    } catch (error) { respondError(res, error, 400); }
  });

  app.post('/api/social/group-chats', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const memberIds = Array.isArray(req.body?.memberIds) ? [...new Set(req.body.memberIds.map(String))] : [];
    if (!title || title.length > 60 || memberIds.length > 49 || memberIds.some(id => !/^\d+$/.test(id) || id === String(user.id))) return res.status(400).json({ success: false, error: 'Укажите название и не более 49 других участников' });
    try {
      const groups = await supabase('rpc/create_social_group', { method: 'POST', body: { p_creator_id: user.id, p_title: title, p_member_ids: memberIds } });
      const group = groups?.[0];
      if (!group) throw new Error('Не удалось создать группу');
      const updates = { description: String(req.body?.description || '').trim().slice(0, 500) };
      if (req.body?.avatarBase64) updates.avatar_url = await uploadImage('social-group-media', `group_${group.id}`, req.body.avatarBase64, 5 * 1024 * 1024);
      const saved = await supabase(`social_group_conversations?id=eq.${encodeURIComponent(group.id)}`, { method: 'PATCH', body: updates });
      res.json({ success: true, group: { ...group, ...(saved?.[0] || {}) } });
    } catch (error) { respondError(res, error, 400); }
  });

  app.patch('/api/social/group-chats/:groupId/settings', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const membership = await groupMembership(req.params.groupId, user.id);
      if (!membership) return res.status(404).json({ success: false, error: 'Группа не найдена' });
      if (membership.role !== 'admin') return res.status(403).json({ success: false, error: 'Настраивать группу может только администратор' });
      const updates = {};
      if (typeof req.body?.title === 'string') updates.title = req.body.title.trim();
      if (typeof req.body?.description === 'string') updates.description = req.body.description.trim();
      if (req.body?.avatarBase64) updates.avatar_url = await uploadImage('social-group-media', `group_${req.params.groupId}`, req.body.avatarBase64, 5 * 1024 * 1024);
      else if (req.body?.removeAvatar) updates.avatar_url = null;
      if (!Object.keys(updates).length) return res.status(400).json({ success: false, error: 'Нет изменений для сохранения' });
      const rows = await supabase(`social_group_conversations?id=eq.${encodeURIComponent(req.params.groupId)}`, { method: 'PATCH', body: updates });
      res.json({ success: true, group: rows[0] });
    } catch (error) { respondError(res, error, 400); }
  });

  app.get('/api/social/group-chats/:groupId/members', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const { rows, profiles } = await loadGroupMembers(req.params.groupId);
      if (!rows.some(row => String(row.user_id) === String(user.id))) return res.status(404).json({ success: false, error: 'Группа не найдена' });
      res.json({ success: true, members: rows.map(row => ({ ...(profiles.get(String(row.user_id)) || {}), role: row.role })) });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/group-chats/:groupId/members', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const memberIds = Array.isArray(req.body?.memberIds) ? [...new Set(req.body.memberIds.map(String))] : [];
    try {
      const count = await supabase('rpc/add_social_group_members', { method: 'POST', body: { p_group_id: req.params.groupId, p_actor_id: user.id, p_member_ids: memberIds } });
      res.json({ success: true, added: Number(count) || 0 });
    } catch (error) { respondError(res, error, 400); }
  });

  app.delete('/api/social/group-chats/:groupId/members/me', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      await supabase('rpc/leave_social_group', { method: 'POST', body: { p_group_id: req.params.groupId, p_user_id: user.id } });
      res.json({ success: true });
    } catch (error) { respondError(res, error, 400); }
  });

  app.delete('/api/social/group-chats/:groupId/members/:memberId', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      await supabase('rpc/remove_social_group_member', { method: 'POST', body: { p_group_id: req.params.groupId, p_actor_id: user.id, p_member_id: req.params.memberId } });
      res.json({ success: true });
    } catch (error) { respondError(res, error, 400); }
  });

  app.post('/api/social/group-chats/:groupId/read', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      await supabase('rpc/mark_social_group_read', { method: 'POST', body: { p_group_id: req.params.groupId, p_user_id: user.id } });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/group-chats/:groupId/messages', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const { rows: members, profiles } = await loadGroupMembers(req.params.groupId);
      if (!members.some(row => String(row.user_id) === String(user.id))) return res.status(404).json({ success: false, error: 'Группа не найдена' });
      const rows = await supabase(`social_group_messages?group_id=eq.${encodeURIComponent(req.params.groupId)}&select=id,group_id,sender_id,body,image_url,reply_to_message_id,event_type,event_actor_id,event_target_id,created_at,deleted_at&order=created_at.desc,id.desc&limit=100`);
      res.json({ success: true, messages: rows.reverse().map(row => ({ ...row, conversation_id: row.group_id, recipient_id: null, message_type: 'text', gift_payload: null, read_at: null, sender: profiles.get(String(row.sender_id)) || { id: row.sender_id, display_name: 'Участник' }, event_actor: profiles.get(String(row.event_actor_id)) || null, event_target: profiles.get(String(row.event_target_id)) || null, read_count: members.filter(member => String(member.user_id) !== String(row.sender_id) && Date.parse(member.joined_at) <= Date.parse(row.created_at) && Date.parse(member.last_read_at) >= Date.parse(row.created_at)).length })) });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/group-chats/:groupId/call-events', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success:false, error:'Требуется войти в QwantID' });
    try {
      if (!await groupMembership(req.params.groupId, user.id)) return res.status(404).json({ success:false, error:'Группа не найдена' });
      const events = await supabase(`qwant_group_call_events?group_id=eq.${encodeURIComponent(req.params.groupId)}&select=id,call_id,event_type,actor_id,created_at&order=created_at.desc,id.desc&limit=100`);
      const profiles = await userMap(events.map(event => event.actor_id));
      res.json({ success:true, events:events.reverse().map(event => ({ id:String(event.id), callId:event.call_id, type:event.event_type, actor:profiles.get(String(event.actor_id)) || { id:String(event.actor_id), display_name:'Участник' }, createdAt:event.created_at })) });
    } catch (error) { respondGroupCallError(res, error); }
  });

  app.post('/api/social/group-chats/:groupId/messages', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    try {
      if (!await groupMembership(req.params.groupId, user.id)) return res.status(404).json({ success: false, error: 'Группа не найдена' });
      if ((!body && !req.body?.imageBase64) || body.length > 4000) return res.status(400).json({ success: false, error: 'Добавьте текст или фотографию (текст до 4000 символов)' });
      const imageUrl = req.body?.imageBase64 ? await uploadImage('social-group-media', `group_${req.params.groupId}`, req.body.imageBase64, 8 * 1024 * 1024) : null;
      const clientMessageId = /^[a-f\d-]{36}$/i.test(String(req.body?.clientMessageId || '')) ? req.body.clientMessageId : randomUUID();
      const rows = await supabase('rpc/send_social_group_message', { method: 'POST', body: { p_group_id: req.params.groupId, p_sender_id: user.id, p_body: body, p_reply_to_message_id: req.body?.replyToMessageId || null, p_image_url: imageUrl, p_message_id: clientMessageId } });
      res.json({ success: true, message: { ...rows[0], conversation_id: req.params.groupId, message_type: 'text', sender: publicUser(user) } });
    } catch (error) { respondError(res, error, 400); }
  });

  app.delete('/api/social/group-chats/:groupId/messages/:messageId', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      if (!await groupMembership(req.params.groupId, user.id)) return res.status(404).json({ success: false, error: 'Группа не найдена' });
      const rows = await supabase(`social_group_messages?id=eq.${encodeURIComponent(req.params.messageId)}&group_id=eq.${encodeURIComponent(req.params.groupId)}&sender_id=eq.${user.id}&event_type=is.null&deleted_at=is.null`, { method: 'PATCH', body: { body: 'Сообщение удалено', image_url: null, deleted_at: new Date().toISOString() } });
      if (!rows.length) return res.status(403).json({ success: false, error: 'Можно удалить только своё сообщение' });
      res.json({ success: true, message: rows[0] });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/qwant/settings', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const defaults = { notifications_enabled: true, telegram_notifications_enabled: false, show_online_status: true, read_receipts: true, allow_new_chats: true, theme: 'light', accent_color: '#b64f3f', font_scale: 100 };
    try {
      const rows = await supabase(`qwant_messenger_settings?user_id=eq.${user.id}&select=*&limit=1`);
      const settings = { ...defaults, ...(rows[0] || {}) };
      res.json({ success: true, settings, telegramId: null });
    } catch (error) { respondError(res, error); }
  });

  app.patch('/api/qwant/settings', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const allowed = ['notifications_enabled', 'show_online_status', 'read_receipts', 'allow_new_chats', 'theme', 'accent_color', 'font_scale'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, error: 'Нет поддерживаемых настроек' });
    try {
      await supabase('qwant_messenger_settings?on_conflict=user_id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: { user_id: user.id, ...updates, updated_at: new Date().toISOString() } });
      res.json({ success: true });
    } catch (error) { respondError(res, error, 400); }
  });

  app.post('/api/qwant/devices/register', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const deviceId = String(req.body?.deviceId || '');
    if (!/^[a-f\d-]{36}$/i.test(deviceId)) return res.status(400).json({ success: false, error: 'Некорректное устройство' });
    try {
      const existing = await supabase(`qwant_messenger_sessions?device_id=eq.${encodeURIComponent(deviceId)}&select=user_id&limit=1`);
      if (existing[0] && String(existing[0].user_id) !== String(user.id)) return res.status(409).json({ success: false, error: 'Это устройство зарегистрировано для другого аккаунта' });
      await supabase('qwant_messenger_sessions?on_conflict=device_id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: { device_id: deviceId, user_id: user.id, device_name: 'Браузер', browser_name: String(req.get('user-agent') || '').slice(0, 500), user_agent: String(req.get('user-agent') || '').slice(0, 1000), last_seen_at: new Date().toISOString() } });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/qwant/devices/check', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Сессия завершена' });
    try {
      const rows = await supabase(`qwant_messenger_sessions?device_id=eq.${encodeURIComponent(req.body?.deviceId || '')}&user_id=eq.${user.id}&select=device_id&limit=1`);
      if (!rows.length) return res.status(401).json({ success: false, error: 'Сессия завершена' });
      await supabase(`qwant_messenger_sessions?device_id=eq.${encodeURIComponent(req.body.deviceId)}&user_id=eq.${user.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { last_seen_at: new Date().toISOString() } });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/qwant/devices', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const devices = await supabase(`qwant_messenger_sessions?user_id=eq.${user.id}&select=device_id,device_name,browser_name,city,country,last_seen_at,created_at&order=last_seen_at.desc`);
      res.json({ success: true, devices });
    } catch (error) { respondError(res, error); }
  });

  app.delete('/api/qwant/devices/:deviceId', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      await supabase(`qwant_messenger_sessions?device_id=eq.${encodeURIComponent(req.params.deviceId)}&user_id=eq.${user.id}`, { method: 'DELETE', prefer: 'return=minimal' });
      res.json({ success: true });
    } catch (error) { respondError(res, error); }
  });

  app.patch('/api/qwant/profile/display-name', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';
    if (!displayName || displayName.length > 40) return res.status(400).json({ success: false, error: 'Имя должно содержать от 1 до 40 символов' });
    try {
      await supabase(`users?id=eq.${user.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { display_name: displayName } });
      res.json({ success: true, displayName });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/qwant/profile/:asset', async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const asset = req.params.asset;
    if (!['avatar', 'banner'].includes(asset)) return res.status(404).json({ success: false, error: 'Файл не найден' });
    try {
      const key = asset === 'avatar' ? 'avatar_url' : 'banner_url';
      const imageUrl = await uploadImage('qwant-profile-media', `${asset}_${user.id}`, req.body?.imageBase64, asset === 'avatar' ? 5 * 1024 * 1024 : 8 * 1024 * 1024);
      await supabase(`users?id=eq.${user.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { [key]: imageUrl } });
      res.json({ success: true, [`${asset}Url`]: imageUrl });
    } catch (error) { respondError(res, error, 400); }
  });

  app.get('/api/social/calls/config', async (req, res) => {
    if (!req.qwantUser) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const urls = (process.env.WEBRTC_TURN_URLS || '').split(',').map(value => value.trim()).filter(Boolean);
    const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    if (urls.length && process.env.WEBRTC_TURN_SHARED_SECRET) {
      const username = `${Math.floor(Date.now() / 1000) + 3600}:qwant`;
      const credential = createHmac('sha1', process.env.WEBRTC_TURN_SHARED_SECRET).update(username).digest('base64');
      iceServers.push({ urls, username, credential });
    }
    res.json({ success: true, iceServers });
  });

  app.get('/api/social/calls/history', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const filter = req.query.conversationId ? `&conversation_id=eq.${encodeURIComponent(req.query.conversationId)}` : '';
      const calls = await supabase(`qwant_call_history?or=(caller_id.eq.${user.id},recipient_id.eq.${user.id})${filter}&select=*&order=started_at.desc&limit=100`);
      const profiles = await userMap(calls.map(call => String(call.caller_id) === String(user.id) ? call.recipient_id : call.caller_id));
      res.json({ success: true, calls: calls.map(call => ({ ...call, direction: String(call.caller_id) === String(user.id) ? 'outgoing' : 'incoming', partner: profiles.get(String(String(call.caller_id) === String(user.id) ? call.recipient_id : call.caller_id)) || {} })) });
    } catch (error) { respondError(res, error); }
  });

  app.get('/api/social/calls/signals', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    try {
      const signals = await supabase('rpc/consume_qwant_call_signals', { method: 'POST', body: { p_user_id: user.id } });
      res.json({ success: true, signals: (signals || []).map(signal => ({ ...signal, conversationId: signal.conversation_id, senderId: String(signal.sender_id), callId: signal.call_id, type: signal.signal_type })) });
    } catch (error) { respondError(res, error); }
  });

  app.post('/api/social/chats/:conversationId/call-signals', async (req, res) => {
    const user = req.qwantUser;
    if (!user) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    const { conversationId } = req.params;
    const callId = String(req.body?.callId || '');
    const type = String(req.body?.type || '');
    if (!/^[a-f\d-]{36}$/i.test(callId) || !['invite', 'accepted', 'declined', 'offer', 'answer', 'ice', 'hangup'].includes(type)) return res.status(400).json({ success: false, error: 'Некорректное событие звонка' });
    try {
      const conversation = await getConversation(conversationId, user.id);
      if (!conversation) return res.status(404).json({ success: false, error: 'Чат не найден' });
      const recipientId = String(conversation.participant_one) === String(user.id) ? conversation.participant_two : conversation.participant_one;
      const payload = req.body?.payload && typeof req.body.payload === 'object' ? req.body.payload : {};
      if (JSON.stringify(payload).length > 16000) return res.status(413).json({ success: false, error: 'Событие звонка слишком большое' });
      await supabase('qwant_call_signals', { method: 'POST', body: { conversation_id: conversationId, call_id: callId, sender_id: user.id, recipient_id: recipientId, signal_type: type, payload, expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString() } });
      await markCallSignal(callId, conversationId, type === 'invite' ? user.id : (await supabase(`qwant_call_history?call_id=eq.${callId}&select=caller_id&limit=1`))[0]?.caller_id || user.id, type === 'invite' ? recipientId : (await supabase(`qwant_call_history?call_id=eq.${callId}&select=recipient_id&limit=1`))[0]?.recipient_id || recipientId, type);
      res.json({ success: true });
    } catch (error) { respondError(res, error, 400); }
  });

  app.get('/api/social/media/:bucket/:fileName', async (req, res) => {
    if (!req.qwantUser) return res.status(401).json({ success: false, error: 'Требуется войти в QwantID' });
    if (!['social-chat-media', 'social-group-media', 'qwant-profile-media'].includes(req.params.bucket)) return res.status(404).json({ success: false, error: 'Файл не найден' });
    try {
      const response = await fetch(`${databaseUrl}/storage/v1/object/public/${req.params.bucket}/${encodeURIComponent(req.params.fileName)}`);
      if (!response.ok) return res.status(response.status).end();
      res.type(response.headers.get('content-type') || 'application/octet-stream').send(Buffer.from(await response.arrayBuffer()));
    } catch (error) { respondError(res, error, 502); }
  });

  app.get('/api/qwant/account', (_req, res) => res.status(410).json({ success: false, error: 'Fernie+ и FernieCoins предоставляются FernieID и сейчас недоступны' }));
  app.get('/api/qwant/transactions', (_req, res) => res.status(410).json({ success: false, error: 'FernieCoins предоставляются FernieID и сейчас недоступны' }));
  app.get('/api/qwant/admin/verification/access', (_req, res) => res.json({ success: true, canAccess: false, canGrantFull: false }));
}
