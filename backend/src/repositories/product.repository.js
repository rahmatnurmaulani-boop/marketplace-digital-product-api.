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
      INNER JOIN product_categories c ON p.category_id = c.id
      INNER JOIN users u ON p.seller_id = u.id
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
      INNER JOIN product_categories c ON p.category_id = c.id
      INNER JOIN users u ON p.seller_id = u.id
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

  async delete(id) {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new ProductRepository();
