const Promo = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM promo ORDER BY id DESC');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM promo WHERE id = ?', [id]);
    return rows[0];
  },

  async create(data) {
    const { type, value, title, description, status, validUntil } = data;
    const [result] = await db.query(
      'INSERT INTO promo (type, value, title, description, status, validUntil) VALUES (?, ?, ?, ?, ?, ?)',
      [type, value, title, description, status, validUntil]
    );
    return { id: result.insertId, ...data };
  },

  async update(id, data) {
    const { type, value, title, description, status, validUntil } = data;
    await db.query(
      'UPDATE promo SET type=?, value=?, title=?, description=?, status=?, validUntil=? WHERE id=?',
      [type, value, title, description, status, validUntil, id]
    );
    return { id, ...data };
  },

  async delete(id) {
    await db.query('DELETE FROM promo WHERE id=?', [id]);
    return { id };
  }
};

exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promo.getAll();
    res.json({ success: true, promotions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPromotionById = async (req, res) => {
  try {
    const promo = await Promo.getById(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Promotion not found' });
    res.json({ success: true, promo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const promo = await Promo.create(req.body);
    res.status(201).json({ success: true, promo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const promo = await Promo.update(req.params.id, req.body);
    res.json({ success: true, promo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    await Promo.delete(req.params.id);
    res.json({ success: true, message: 'Promotion deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
