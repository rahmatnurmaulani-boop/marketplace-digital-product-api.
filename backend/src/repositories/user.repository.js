const db = require("../config/database");

class UserRepository {
  async findById(id) {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  }

  async findAll() {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users",
    );
    return rows;
  }
}

module.exports = new UserRepository();
