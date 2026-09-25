const db = require("../config/database");

class ProductRepository {
  async findAll(filters = {}, sorting = {}) {
    let query = `
      SELECT 
        p.id, 
        p.seller_id,
        p.category_id,
        p.title, 
        p.description, 
        p.price, 
        p.rating, 
        p.thumbnail, 
        p.file_path, 
        p.download_count, 
        p.status, 
        p.created_at,
        c.name AS category_name,
        u.name AS seller_name,
        u.role AS seller_role
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter Search
    if (filters.search) {
      query += ` AND p.title LIKE ?`;
      params.push(`%${filters.search}%`);
    }

    // Filter Category
    if (filters.category_id) {
      query += ` AND p.category_id = ?`;
      params.push(filters.category_id);
    }

    // Filter Price Range
    if (filters.min_price !== undefined && filters.min_price !== "") {
      query += ` AND p.price >= ?`;
      params.push(Number(filters.min_price));
    }
    if (filters.max_price !== undefined && filters.max_price !== "") {
      query += ` AND p.price <= ?`;
      params.push(Number(filters.max_price));
    }

    // Sorting
    const allowedSortFields = [
      "rating",
      "price",
      "download_count",
      "id",
      "created_at",
    ];
    const sortBy = allowedSortFields.includes(sorting.sort_by)
      ? `p.${sorting.sort_by}`
      : "p.id";
    const order =
      sorting.order && sorting.order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    query += ` ORDER BY ${sortBy} ${order}`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  async findById(id) {
    const query = `
      SELECT 
        p.id, 
        p.seller_id,
        p.category_id,
        p.title, 
        p.description, 
        p.price, 
        p.rating, 
        p.thumbnail, 
        p.file_path, 
        p.download_count, 
        p.status, 
        p.created_at,
        c.name AS category_name,
        u.name AS seller_name,
        u.role AS seller_role
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0] || null;
  }

  async create(data) {
    const {
      seller_id,
      category_id,
      title,
      description,
      price,
      rating,
      thumbnail,
      file_path,
      status,
    } = data;

    const [result] = await db.query(
      `INSERT INTO products 
       (seller_id, category_id, title, description, price, rating, thumbnail, file_path, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        seller_id,
        category_id,
        title,
        description,
        price,
        rating,
        thumbnail || null,
        file_path,
        status || "active",
      ],
    );

    return result.insertId;
  }

  // Update penuh (untuk method PUT)
  async update(id, data) {
    const {
      category_id,
      title,
      description,
      price,
      rating,
      thumbnail,
      file_path,
      status,
    } = data;

    const [result] = await db.query(
      `UPDATE products 
       SET category_id = ?, title = ?, description = ?, price = ?, rating = ?, thumbnail = ?, file_path = ?, status = ?
       WHERE id = ?`,
      [
        category_id,
        title,
        description,
        price,
        rating,
        thumbnail !== undefined ? thumbnail : null,
        file_path,
        status || "active",
        id,
      ],
    );

    return result.affectedRows;
  }

  // Update parsial otomatis (khusus untuk method PATCH)
  async updatePartial(id, data) {
    const fields = [];
    const params = [];

    if (data.category_id !== undefined) {
      fields.push("category_id = ?");
      params.push(Number(data.category_id));
    }
    if (data.title !== undefined) {
      fields.push("title = ?");
      params.push(data.title.trim());
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      params.push(data.description.trim());
    }
    if (data.price !== undefined) {
      fields.push("price = ?");
      params.push(Number(data.price));
    }
    if (data.rating !== undefined) {
      fields.push("rating = ?");
      params.push(Number(data.rating));
    }
    if (data.thumbnail !== undefined) {
      fields.push("thumbnail = ?");
      params.push(data.thumbnail);
    }
    if (data.file_path !== undefined) {
      fields.push("file_path = ?");
      params.push(data.file_path);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      params.push(data.status);
    }

    // Jika tidak ada data yang dikirim, return 0
    if (fields.length === 0) return 0;

    params.push(id);
    const query = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await db.query(query, params);
    return result.affectedRows;
  }

  async delete(id) {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new ProductRepository();
