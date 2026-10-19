const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to safely read database
function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler banco de dados:', err);
    return { config: { adminPin: '1234' }, items: [] };
  }
}

// Helper to safely write database atomically
function writeDb(data) {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Erro ao salvar banco de dados:', err);
    return false;
  }
}

// Simple PIN auth middleware
function requireAdmin(req, res, next) {
  const pin = req.headers['x-admin-pin'] || req.body?.pin;
  const db = readDb();
  const currentPin = db.config?.adminPin || '1234';

  if (!pin || String(pin).trim() !== String(currentPin).trim()) {
    return res.status(401).json({ error: 'PIN de noivos incorreto ou ausente.' });
  }
  next();
}

// 1. Get all public data (config without PIN, list of items, stats)
app.get('/api/data', (req, res) => {
  const db = readDb();
  const items = db.items || [];
  
  const total = items.length;
  const reservedCount = items.filter(i => i.reserved).length;
  const availableCount = total - reservedCount;
  const percentage = total > 0 ? Math.round((reservedCount / total) * 100) : 0;

  // Clone config without leaking PIN
  const publicConfig = { ...(db.config || {}) };
  delete publicConfig.adminPin;

  // Categories list
  const categories = Array.from(new Set(items.map(i => i.category || 'Outros'))).filter(Boolean);

  res.json({
    config: publicConfig,
    items,
    stats: {
      total,
      reservedCount,
      availableCount,
      percentage
    },
    categories
  });
});

// 2. Guest reserves an item
app.post('/api/items/:id/reserve', (req, res) => {
  const { id } = req.params;
  const { guestName, guestMessage, guestPhone } = req.body;

  if (!guestName || !guestName.trim()) {
    return res.status(400).json({ error: 'Por favor, informe o seu nome para confirmar o presente.' });
  }

  const db = readDb();
  const itemIndex = db.items.findIndex(i => String(i.id) === String(id));

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item não encontrado na lista.' });
  }

  const item = db.items[itemIndex];
  if (item.reserved) {
    return res.status(409).json({
      error: `Este item já foi carinhosamente escolhido por ${item.reservedBy || 'outro convidado'}. Por favor, escolha outro item!`
    });
  }

  item.reserved = true;
  item.reservedBy = guestName.trim();
  item.reservedAt = new Date().toISOString();
  item.guestMessage = (guestMessage || '').trim();
  item.guestPhone = (guestPhone || '').trim();

  writeDb(db);
  res.json({ success: true, item, message: 'Presente reservado com sucesso!' });
});

// 3. Admin verifies PIN
app.post('/api/admin/verify', (req, res) => {
  const { pin } = req.body;
  const db = readDb();
  const currentPin = db.config?.adminPin || '1234';

  if (String(pin).trim() === String(currentPin).trim()) {
    return res.json({ success: true, message: 'Acesso autorizado!' });
  }
  return res.status(401).json({ error: 'PIN incorreto. Tente novamente.' });
});

// 4. Admin adds a new item
app.post('/api/items', requireAdmin, (req, res) => {
  const { title, category, description, suggestedUrl, imageUrl, icon } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'O nome do presente é obrigatório.' });
  }

  const db = readDb();
  const newItem = {
    id: 'item-' + Date.now(),
    title: title.trim(),
    category: (category || 'Geral').trim(),
    description: (description || '').trim(),
    suggestedUrl: (suggestedUrl || '').trim(),
    imageUrl: (imageUrl || '').trim(),
    icon: (icon || '🎁').trim(),
    reserved: false,
    reservedBy: null,
    reservedAt: null,
    guestMessage: null,
    guestPhone: null
  };

  db.items.unshift(newItem);
  writeDb(db);

  res.status(201).json({ success: true, item: newItem });
});

// 5. Admin updates an existing item
app.put('/api/items/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, category, description, suggestedUrl, imageUrl, icon } = req.body;

  const db = readDb();
  const itemIndex = db.items.findIndex(i => String(i.id) === String(id));

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item não encontrado.' });
  }

  const item = db.items[itemIndex];
  if (title) item.title = title.trim();
  if (category) item.category = category.trim();
  if (description !== undefined) item.description = description.trim();
  if (suggestedUrl !== undefined) item.suggestedUrl = suggestedUrl.trim();
  if (imageUrl !== undefined) item.imageUrl = imageUrl.trim();
  if (icon !== undefined) item.icon = icon.trim();

  writeDb(db);
  res.json({ success: true, item });
});

// 6. Admin deletes an item
app.delete('/api/items/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialCount = db.items.length;
  db.items = db.items.filter(i => String(i.id) !== String(id));

  if (db.items.length === initialCount) {
    return res.status(404).json({ error: 'Item não encontrado.' });
  }

  writeDb(db);
  res.json({ success: true, message: 'Item excluído com sucesso.' });
});

// 7. Admin unreserves / releases an item
app.post('/api/items/:id/unreserve', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const item = db.items.find(i => String(i.id) === String(id));

  if (!item) {
    return res.status(404).json({ error: 'Item não encontrado.' });
  }

  item.reserved = false;
  item.reservedBy = null;
  item.reservedAt = null;
  item.guestMessage = null;
  item.guestPhone = null;

  writeDb(db);
  res.json({ success: true, item, message: 'Item liberado para escolha novamente!' });
});

// 8. Admin updates configuration & PIN
app.post('/api/config', requireAdmin, (req, res) => {
  const { coupleNames, weddingDate, welcomeTitle, welcomeMessage, pixKey, pixName, newPin } = req.body;
  const db = readDb();

  if (coupleNames) db.config.coupleNames = coupleNames.trim();
  if (weddingDate) db.config.weddingDate = weddingDate.trim();
  if (welcomeTitle) db.config.welcomeTitle = welcomeTitle.trim();
  if (welcomeMessage) db.config.welcomeMessage = welcomeMessage.trim();
  if (pixKey !== undefined) db.config.pixKey = pixKey.trim();
  if (pixName !== undefined) db.config.pixName = pixName.trim();
  if (newPin && newPin.trim()) db.config.adminPin = newPin.trim();

  writeDb(db);
  res.json({ success: true, message: 'Configurações salvas com sucesso!' });
});

// 9. Admin gets guest messages & reservations report
app.get('/api/admin/messages', requireAdmin, (req, res) => {
  const db = readDb();
  const reservedItems = (db.items || []).filter(i => i.reserved);
  res.json({
    items: reservedItems,
    totalReserved: reservedItems.length
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`💍 Site da Lista de Casamento rodando com sucesso!`);
  console.log(`👉 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log(`🔐 PIN padrão da Área dos Noivos: 1234`);
  console.log(`====================================================`);
});
