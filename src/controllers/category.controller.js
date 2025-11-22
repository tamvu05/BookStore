import CategoryService from '../services/category.service.js'

const CategoryController = {
    // GET /admin/category
    async getViewAll(req, res, next) {
        try {
            const { page } = req.query
            const data = await CategoryService.getAll(page)
            res.render('admin/viewManager', {
                scripts: ['/js/category.admin.js'],
                categories: data.categories,
                currentPage: data.currentPage,
                totalPage: data.totalPage,
                totalItem: data.categories.length,
                entityName: 'thể loại',
                tablePartial: 'partials/category/tableCategory',
                modalAddSelector: '#add-category-modal',
                modalAddPartial: 'partials/category/modalAddCategory',
                modalUpdatePartial: 'partials/category/modalUpdateCategory',
                hrefPagination: '/admin/category/',
            })
        } catch (err) {
            next(err)
        }
    },

    // GET /api/category/partials
    // Lấy table view và pagination dưới dạng json
    async getPartials(req, res, next) {
        const renderPartial = (view, data) => {
            return new Promise((resolve, reject) => {
                req.app.render(view, data, (err, html) => {
                    if (err) {
                        console.error(`Lỗi render EJS cho view ${view}:`, err)
                        return reject(err)
                    }
                    resolve(html)
                })
            })
        }

        try {
            const { page } = req.query
            const data = await CategoryService.getAll(page)
            const table = await renderPartial(
                'admin/partials/category/tableCategory',
                {
                    categories: data.categories,
                    currentPage: data.currentPage,
                    totalPage: data.totalPage,
                    totalItem: data.categories.length,
                }
            )

            const pagination = await renderPartial(
                'admin/partials/pagination',
                {
                    currentPage: data.currentPage,
                    totalPage: data.totalPage,
                    hrefPagination: '/admin/category/',
                }
            )

            return res.json({
                table,
                pagination,
                totalPage: data.totalPage,
            })
        } catch (error) {
            next(error)
        }
    },

    // GET /category
    async userGetAll(req, res, next) {
        try {
            const data = await CategoryService.getAll()
            res.render('user/category', {
                title: 'Nhà sách ...',
                layout: res.userLayout,
                data,
            })
        } catch (err) {
            next(err)
        }
    },

    // GET /category/:id
    async userGetById(req, res, next) {
        try {
            const { id } = req.params
            const data = await CategoryService.getById(id)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // GET /api/category/:id
    async getById(req, res, next) {
        try {
            const { id } = req.params
            const data = await CategoryService.getById(id)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // GET /api/category/check-unique
    async checkUnique(req, res, next) {
        try {
            const name = req.query.name
            const result = await CategoryService.checkUnique(name)
            return res.json({ isUnique: result })
        } catch (error) {
            next(error)
        }
    },

    // POST /api/category
    async create(req, res, next) {
        try {
            const data = await CategoryService.create(req.body)
            res.status(201).json(data)
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    // PUT /api/category/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            const data = await CategoryService.update(id, req.body)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // DELETE /api/category/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const success = await CategoryService.delete(id)
            return res.json({ success })
        } catch (err) {
            next(err)
        }
    },
}

export default CategoryController
