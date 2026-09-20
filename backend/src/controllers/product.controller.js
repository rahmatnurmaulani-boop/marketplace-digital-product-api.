const productRepo = require("../repositories/product.repository");
const categoryRepo = require("../repositories/category.repository");
const userRepo = require("../repositories/user.repository");

// Helper Klasifikasi Rating (Fitur Bonus)
const getRatingClass = (rating) => {
  const num = parseFloat(rating) || 0;
  if (num >= 8.5) return "Top Rated";
  if (num >= 7.0) return "Popular";
  return "Regular";
};

// Helper Format JSON Response
const formatProductResponse = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  price: parseFloat(row.price) || 0,
  rating: parseFloat(row.rating) || 0,
  rating_class: getRatingClass(row.rating),
  thumbnail: row.thumbnail,
  file_path: row.file_path,
  download_count: row.download_count || 0,
  status: row.status,

  category_id: row.category_id,
  category: {
    id: row.category_id,
    name: row.category_name || "Tanpa Kategori",
  },

  seller_id: row.seller_id,
  seller: {
    id: row.seller_id,
    name: row.seller_name || "Anonim",
  },
});

class ProductController {
  // GET /api/products
  async getAll(req, res) {
    try {
      const { search, category_id, min_price, max_price, sort_by, order } =
        req.query;

      const filters = { search, category_id, min_price, max_price };
      const sorting = { sort_by, order };

      const products = await productRepo.findAll(filters, sorting);
      const formattedData = products.map(formatProductResponse);

      return res.status(200).json({
        success: true,
        message: "Data produk berhasil diambil",
        data: formattedData,
      });
    } catch (error) {
      console.error("Error getAll products:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan pada server.",
      });
    }
  }

  // GET /api/products/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await productRepo.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Detail produk berhasil diambil",
        data: formatProductResponse(product),
      });
    } catch (error) {
      console.error("Error getById product:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan pada server.",
      });
    }
  }

  // POST /api/products
  async create(req, res) {
    try {
      // Baca seller_id dari Header bawaan template frontend ('X-Practice-User-Id') atau dari Body
      const seller_id = req.headers["x-practice-user-id"] || req.body.seller_id;

      const {
        category_id,
        title,
        description,
        price,
        rating,
        thumbnail,
        file_path,
        status,
      } = req.body;

      const errors = {};

      // 1. Validasi Seller & Otorisasi Peran
      if (!seller_id) {
        errors.seller_id = ["Field seller_id wajib disertakan"];
      } else {
        const seller = await userRepo.findById(seller_id);
        if (!seller) {
          errors.seller_id = ["Seller tidak terdaftar pada sistem"];
        } else if (seller.role !== "seller" && seller.role !== "admin") {
          return res.status(403).json({
            success: false,
            message:
              "Anda tidak memiliki akses untuk menambah produk (Hanya Seller)",
          });
        }
      }

      // 2. Validasi Title
      if (!title || typeof title !== "string") {
        errors.title = ["Field title wajib diisi dan harus berupa string"];
      } else if (title.trim().length === 0 || title.length > 255) {
        errors.title = [
          "Field title tidak boleh kosong dan maksimal 255 karakter",
        ];
      }

      // 3. Validasi Description
      if (!description || typeof description !== "string") {
        errors.description = [
          "Field description wajib diisi dan harus berupa string",
        ];
      }

      // 4. Validasi Price
      if (
        price === undefined ||
        price === null ||
        isNaN(price) ||
        Number(price) < 0
      ) {
        errors.price = [
          "Field price wajib diisi, berupa angka, dan bernilai minimal 0",
        ];
      }

      // 5. Validasi Rating
      if (
        rating === undefined ||
        rating === null ||
        isNaN(rating) ||
        Number(rating) < 0 ||
        Number(rating) > 10
      ) {
        errors.rating = [
          "Field rating wajib diisi, berupa angka antara 0 - 10",
        ];
      }

      // 6. Validasi Category
      if (!category_id || isNaN(category_id)) {
        errors.category_id = [
          "Field category_id wajib diisi dan berupa integer",
        ];
      } else {
        const category = await categoryRepo.findById(category_id);
        if (!category) {
          errors.category_id = [
            "Kategori tidak ditemukan di product_categories",
          ];
        }
      }

      // 7. Validasi File Path
      if (!file_path || typeof file_path !== "string") {
        errors.file_path = [
          "Field file_path wajib diisi dan harus berupa string",
        ];
      }

      // 8. Validasi Thumbnail (opsional)
      if (
        thumbnail !== undefined &&
        thumbnail !== null &&
        typeof thumbnail !== "string"
      ) {
        errors.thumbnail = ["Field thumbnail harus berupa string path/URL"];
      }

      // 9. Validasi Status (opsional)
      if (status !== undefined && !["active", "inactive"].includes(status)) {
        errors.status = ["Status hanya boleh active atau inactive"];
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal",
          errors,
        });
      }

      const newId = await productRepo.create({
        seller_id: Number(seller_id),
        category_id: Number(category_id),
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        rating: Number(rating),
        thumbnail: thumbnail || null,
        file_path,
        status: status || "active",
      });

      const newProduct = await productRepo.findById(newId);

      return res.status(201).json({
        success: true,
        message: "Produk berhasil ditambahkan",
        data: formatProductResponse(newProduct),
      });
    } catch (error) {
      console.error("Error create product:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan pada server.",
      });
    }
  }

  // PUT /api/products/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const existingProduct = await productRepo.findById(id);

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }

      // Baca seller_id dari Header atau dari Body
      const seller_id = req.headers["x-practice-user-id"] || req.body.seller_id;

      const {
        category_id,
        title,
        description,
        price,
        rating,
        thumbnail,
        file_path,
        status,
      } = req.body;

      // Validasi kepemilikan (Ownership check)
      if (
        !seller_id ||
        Number(seller_id) !== Number(existingProduct.seller_id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses untuk mengubah data ini",
        });
      }

      const errors = {};

      if (!title || typeof title !== "string") {
        errors.title = ["Field title wajib diisi dan harus berupa string"];
      } else if (title.trim().length === 0 || title.length > 255) {
        errors.title = [
          "Field title tidak boleh kosong dan maksimal 255 karakter",
        ];
      }

      if (!description || typeof description !== "string") {
        errors.description = [
          "Field description wajib diisi dan harus berupa string",
        ];
      }

      if (
        price === undefined ||
        price === null ||
        isNaN(price) ||
        Number(price) < 0
      ) {
        errors.price = [
          "Field price wajib diisi, berupa angka, dan bernilai minimal 0",
        ];
      }

      if (
        rating === undefined ||
        rating === null ||
        isNaN(rating) ||
        Number(rating) < 0 ||
        Number(rating) > 10
      ) {
        errors.rating = [
          "Field rating wajib diisi, berupa angka antara 0 - 10",
        ];
      }

      if (!category_id || isNaN(category_id)) {
        errors.category_id = [
          "Field category_id wajib diisi dan berupa integer",
        ];
      } else {
        const category = await categoryRepo.findById(category_id);
        if (!category) {
          errors.category_id = [
            "Kategori tidak ditemukan di product_categories",
          ];
        }
      }

      if (!file_path || typeof file_path !== "string") {
        errors.file_path = [
          "Field file_path wajib diisi dan harus berupa string",
        ];
      }

      if (
        thumbnail !== undefined &&
        thumbnail !== null &&
        typeof thumbnail !== "string"
      ) {
        errors.thumbnail = ["Field thumbnail harus berupa string path/URL"];
      }

      if (status !== undefined && !["active", "inactive"].includes(status)) {
        errors.status = ["Status hanya boleh active atau inactive"];
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal",
          errors,
        });
      }

      await productRepo.update(id, {
        category_id: Number(category_id),
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        rating: Number(rating),
        thumbnail:
          thumbnail !== undefined ? thumbnail : existingProduct.thumbnail,
        file_path,
        status: status || existingProduct.status,
      });

      const updated = await productRepo.findById(id);

      return res.status(200).json({
        success: true,
        message: "Produk berhasil diupdate",
        data: formatProductResponse(updated),
      });
    } catch (error) {
      console.error("Error update product:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan pada server.",
      });
    }
  }

  // DELETE /api/products/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      // Baca seller_id dari Header atau dari Body
      const seller_id = req.headers["x-practice-user-id"] || req.body.seller_id;

      const existingProduct = await productRepo.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }

      // Validasi kepemilikan (Ownership check)
      if (
        !seller_id ||
        Number(seller_id) !== Number(existingProduct.seller_id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses untuk mengubah data ini",
        });
      }

      await productRepo.delete(id);

      return res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus",
        data: {},
      });
    } catch (error) {
      console.error("Error delete product:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan pada server.",
      });
    }
  }
}

module.exports = new ProductController();
