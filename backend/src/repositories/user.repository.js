const db = require("../config/database");

class UserRepository {
  async findById(id) {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  }

  async create({ name, email, password, role = "buyer" }) {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role],
    );
    return result.insertId;
  }

  async findAll() {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users",
    );
    return rows;
  }
}

module.exports = new UserRepository();
