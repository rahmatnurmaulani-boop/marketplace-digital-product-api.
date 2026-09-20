const db = require("../config/database");

class CategoryRepository {
  async findAll() {
    const [rows] = await db.query(
      "SELECT * FROM product_categories ORDER BY id ASC",
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM product_categories WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  }

  async create(data) {
    const { name, description } = data;
    const [result] = await db.query(
      "INSERT INTO product_categories (name, description) VALUES (?, ?)",
      [name, description || null],
    );
    return result.insertId;
  }

  async update(id, data) {
    const { name, description } = data;
    const [result] = await db.query(
      "UPDATE product_categories SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id],
    );
    return result.affectedRows;
  }

  async countAssociatedProducts(categoryId) {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM products WHERE category_id = ?",
      [categoryId],
    );
    return rows[0].total;
  }

  async delete(id) {
    const [result] = await db.query(
      "DELETE FROM product_categories WHERE id = ?",
      [id],
    );
    return result.affectedRows;
  }

  async findProductsByCategoryId(categoryId) {
    const [rows] = await db.query(
      `SELECT p.id, p.title, p.description, p.price, p.rating, p.thumbnail, 
              p.file_path, p.download_count, p.status, p.created_at
       FROM products p
       WHERE p.category_id = ?`,
      [categoryId],
    );
    return rows;
  }
}

module.exports = new CategoryRepository();
