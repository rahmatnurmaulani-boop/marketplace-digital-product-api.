const userRepo = require("../repositories/user.repository");

class UserController {
  async getAll(req, res) {
    try {
      const users = await userRepo.findAll();
      return res.status(200).json({
        success: true,
        message: "Data user berhasil diambil",
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userRepo.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Detail user berhasil diambil",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new UserController();
