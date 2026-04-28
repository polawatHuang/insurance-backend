const db = require("../config/db");

function createSlug(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0E00-\u0E7Fa-z0-9-]/g, "");
}

async function getProductFullData(productId) {
  const [[product]] = await db.query("SELECT * FROM products WHERE id = ?", [
    productId,
  ]);

  if (!product) return null;

  const [plans] = await db.query(
    "SELECT * FROM product_plans WHERE product_id = ? ORDER BY id ASC",
    [productId]
  );

  const [features] = await db.query(
    "SELECT * FROM product_features WHERE product_id = ? ORDER BY id ASC",
    [productId]
  );

  const [benefits] = await db.query(
    "SELECT * FROM product_benefits WHERE product_id = ? ORDER BY id ASC",
    [productId]
  );

  const [faqs] = await db.query(
    "SELECT * FROM product_faqs WHERE product_id = ? ORDER BY id ASC",
    [productId]
  );

  const [tags] = await db.query(
    "SELECT * FROM product_tags WHERE product_id = ? ORDER BY id ASC",
    [productId]
  );

  return {
    ...product,
    plans,
    features,
    benefits,
    faqs,
    tags: tags.map((item) => item.tag),
  };
}

exports.getProducts = async (req, res) => {
  try {
    const { category, company, featured, active = "true", search } = req.query;

    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (active !== "all") {
      sql += " AND is_active = ?";
      params.push(active === "true");
    }

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (company) {
      sql += " AND company = ?";
      params.push(company);
    }

    if (featured) {
      sql += " AND is_featured = ?";
      params.push(featured === "true");
    }

    if (search) {
      sql += " AND (title LIKE ? OR short_description LIKE ? OR company LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await db.query(sql, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await getProductFullData(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const [[row]] = await db.query("SELECT id FROM products WHERE slug = ?", [
      req.params.slug,
    ]);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = await getProductFullData(row.id);

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.createProduct = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      title,
      slug,
      category,
      sub_category,
      short_description,
      description,
      company,
      image,
      banner,
      is_featured,
      is_active,
      plans = [],
      features = [],
      benefits = [],
      faqs = [],
      tags = [],
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "title and category are required",
      });
    }

    const finalSlug = slug || createSlug(title);

    const [productResult] = await connection.query(
      `INSERT INTO products 
      (title, slug, category, sub_category, short_description, description, company, image, banner, is_featured, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        finalSlug,
        category,
        sub_category || null,
        short_description || null,
        description || null,
        company || null,
        image || null,
        banner || null,
        is_featured ?? false,
        is_active ?? true,
      ]
    );

    const productId = productResult.insertId;

    for (const plan of plans) {
      await connection.query(
        `INSERT INTO product_plans
        (product_id, plan_name, premium_term, coverage_term, min_age, max_age, min_sum_insured, max_sum_insured, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          plan.plan_name || null,
          plan.premium_term || null,
          plan.coverage_term || null,
          plan.min_age || null,
          plan.max_age || null,
          plan.min_sum_insured || null,
          plan.max_sum_insured || null,
          plan.note || null,
        ]
      );
    }

    for (const feature of features) {
      await connection.query(
        `INSERT INTO product_features
        (product_id, icon, title, description)
        VALUES (?, ?, ?, ?)`,
        [
          productId,
          feature.icon || null,
          feature.title || null,
          feature.description || null,
        ]
      );
    }

    for (const benefit of benefits) {
      await connection.query(
        `INSERT INTO product_benefits
        (product_id, benefit_title, benefit_type, description, value)
        VALUES (?, ?, ?, ?, ?)`,
        [
          productId,
          benefit.benefit_title || null,
          benefit.benefit_type || null,
          benefit.description || null,
          benefit.value || null,
        ]
      );
    }

    for (const faq of faqs) {
      await connection.query(
        `INSERT INTO product_faqs
        (product_id, question, answer)
        VALUES (?, ?, ?)`,
        [productId, faq.question || null, faq.answer || null]
      );
    }

    for (const tag of tags) {
      await connection.query(
        `INSERT INTO product_tags (product_id, tag) VALUES (?, ?)`,
        [productId, tag]
      );
    }

    await connection.commit();

    const product = await getProductFullData(productId);

    res.status(201).json({
      success: true,
      message: "Product created",
      data: product,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

exports.updateProduct = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const productId = req.params.id;

    const [[existing]] = await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    if (!existing) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      title,
      slug,
      category,
      sub_category,
      short_description,
      description,
      company,
      image,
      banner,
      is_featured,
      is_active,
      plans,
      features,
      benefits,
      faqs,
      tags,
    } = req.body;

    const finalTitle = title ?? existing.title;
    const finalSlug = slug || existing.slug || createSlug(finalTitle);

    await connection.query(
      `UPDATE products SET
        title = ?,
        slug = ?,
        category = ?,
        sub_category = ?,
        short_description = ?,
        description = ?,
        company = ?,
        image = ?,
        banner = ?,
        is_featured = ?,
        is_active = ?
      WHERE id = ?`,
      [
        finalTitle,
        finalSlug,
        category ?? existing.category,
        sub_category ?? existing.sub_category,
        short_description ?? existing.short_description,
        description ?? existing.description,
        company ?? existing.company,
        image ?? existing.image,
        banner ?? existing.banner,
        is_featured ?? existing.is_featured,
        is_active ?? existing.is_active,
        productId,
      ]
    );

    if (Array.isArray(plans)) {
      await connection.query("DELETE FROM product_plans WHERE product_id = ?", [
        productId,
      ]);

      for (const plan of plans) {
        await connection.query(
          `INSERT INTO product_plans
          (product_id, plan_name, premium_term, coverage_term, min_age, max_age, min_sum_insured, max_sum_insured, note)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            plan.plan_name || null,
            plan.premium_term || null,
            plan.coverage_term || null,
            plan.min_age || null,
            plan.max_age || null,
            plan.min_sum_insured || null,
            plan.max_sum_insured || null,
            plan.note || null,
          ]
        );
      }
    }

    if (Array.isArray(features)) {
      await connection.query(
        "DELETE FROM product_features WHERE product_id = ?",
        [productId]
      );

      for (const feature of features) {
        await connection.query(
          `INSERT INTO product_features
          (product_id, icon, title, description)
          VALUES (?, ?, ?, ?)`,
          [
            productId,
            feature.icon || null,
            feature.title || null,
            feature.description || null,
          ]
        );
      }
    }

    if (Array.isArray(benefits)) {
      await connection.query(
        "DELETE FROM product_benefits WHERE product_id = ?",
        [productId]
      );

      for (const benefit of benefits) {
        await connection.query(
          `INSERT INTO product_benefits
          (product_id, benefit_title, benefit_type, description, value)
          VALUES (?, ?, ?, ?, ?)`,
          [
            productId,
            benefit.benefit_title || null,
            benefit.benefit_type || null,
            benefit.description || null,
            benefit.value || null,
          ]
        );
      }
    }

    if (Array.isArray(faqs)) {
      await connection.query("DELETE FROM product_faqs WHERE product_id = ?", [
        productId,
      ]);

      for (const faq of faqs) {
        await connection.query(
          `INSERT INTO product_faqs
          (product_id, question, answer)
          VALUES (?, ?, ?)`,
          [productId, faq.question || null, faq.answer || null]
        );
      }
    }

    if (Array.isArray(tags)) {
      await connection.query("DELETE FROM product_tags WHERE product_id = ?", [
        productId,
      ]);

      for (const tag of tags) {
        await connection.query(
          `INSERT INTO product_tags (product_id, tag) VALUES (?, ?)`,
          [productId, tag]
        );
      }
    }

    await connection.commit();

    const product = await getProductFullData(productId);

    res.json({
      success: true,
      message: "Product updated",
      data: product,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};