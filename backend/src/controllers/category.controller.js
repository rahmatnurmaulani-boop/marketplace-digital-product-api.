const categoryRepo = require("../repositories/category.repository");

class CategoryController {
  // GET /api/categories
  async getAll(req, res) {
    try {
      const categories = await categoryRepo.findAll();
      return res.status(200).json({
        success: true,
        message: "Data kategori berhasil diambil",
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/categories/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryRepo.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }

      const products = await categoryRepo.findProductsByCategoryId(id);

      return res.status(200).json({
        success: true,
        message: "Detail kategori beserta daftar produk berhasil diambil",
        data: {
          ...category,
          products,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/categories
  async create(req, res) {
    try {
      const { name, description } = req.body;
      const errors = {};

      if (!name || typeof name !== "string" || name.trim() === "") {
        errors.name = ["Field name wajib diisi dan harus berupa string"];
      } else if (name.length > 100) {
        errors.name = ["Field name maksimal 100 karakter"];
      }

      if (description !== undefined && typeof description !== "string") {
        errors.description = ["Field description harus berupa string"];
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal",
          errors,
        });
      }

      const newId = await categoryRepo.create({
        name: name.trim(),
        description,
      });
      const createdCategory = await categoryRepo.findById(newId);

      return res.status(201).json({
        success: true,
        message: "Kategori berhasil ditambahkan",
        data: createdCategory,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /api/categories/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const existingCategory = await categoryRepo.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }

      const errors = {};
      if (!name || typeof name !== "string" || name.trim() === "") {
        errors.name = ["Field name wajib diisi dan harus berupa string"];
      } else if (name.length > 100) {
        errors.name = ["Field name maksimal 100 karakter"];
      }

      if (description !== undefined && typeof description !== "string") {
        errors.description = ["Field description harus berupa string"];
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal",
          errors,
        });
      }

      await categoryRepo.update(id, { name: name.trim(), description });
      const updatedCategory = await categoryRepo.findById(id);

      return res.status(200).json({
        success: true,
        message: "Kategori berhasil diperbarui",
        data: updatedCategory,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /api/categories/:id
  async delete(req, res) {
    try {
      const { id } = req.params;

      const existingCategory = await categoryRepo.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }

      // Cegah penghapusan jika masih ada produk terkait
      const associatedCount = await categoryRepo.countAssociatedProducts(id);
      if (associatedCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Kategori tidak dapat dihapus karena masih terkait dengan ${associatedCount} produk.`,
        });
      }

      await categoryRepo.delete(id);

      return res.status(200).json({
        success: true,
        message: "Kategori berhasil dihapus",
        data: {},
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CategoryController();
