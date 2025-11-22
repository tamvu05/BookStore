import CategoryService from '../services/category.service.js'

const CategoryController = {
    // --- PHẦN CHO USER (Giao diện khách hàng) ---

    // GET /category
    async userGetAll(req, res, next) {
        try {
            // 1. Gọi Service lấy dữ liệu
            const categories = await CategoryService.getAll();

            // 2. Render ra View
            res.render('user/category', {
                title: 'Danh mục Thể loại', // Tiêu đề tab
                categories: categories,     // Dữ liệu truyền sang
                path: '/category'           // 💡 Tín hiệu để sáng đèn menu Thể loại
            })
        } catch (err) {
            next(err)
        }
    },

    // GET /category/:id (API trả về JSON nếu cần, hoặc redirect sang trang Book)
    async userGetById(req, res, next) {
        try {
            const { id } = req.params
            const data = await CategoryService.getById(id)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // --- PHẦN CHO ADMIN (Giữ nguyên khung sườn cũ của cậu) ---

    // GET /admin/category
    async getViewAll(req, res, next) {
        try {
            // Tạm thời lấy hết list để test
            const categories = await CategoryService.getAll();
            res.render('admin/viewManager', {
                // ... (Giữ nguyên các tham số cũ của cậu)
                categories: categories,
                entityName: 'thể loại',
                // ...
            })
        } catch (err) {
            next(err)
        }
    },

    // ... (Các hàm getPartials, create, update, delete giữ nguyên khung) ...
    // Tạm thời chưa đụng vào để tránh lỗi, khi nào làm Admin ta sẽ sửa sau.
    
    async getPartials(req, res, next) { res.json({}) },
    async getById(req, res, next) { res.json({}) },
    async checkUnique(req, res, next) { res.json({}) },
    async create(req, res, next) { res.json({}) },
    async update(req, res, next) { res.json({}) },
    async delete(req, res, next) { res.json({}) },
}

export default CategoryController