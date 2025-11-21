import AuthorService from '../services/author.service.js'

const AuthorController = {
    // GET /admin/author
    async getAll(req, res, next) {
        try {
            const data = await AuthorService.getAll()
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // GET /admin/author/:id
    async getById(req, res, next) {
        try {
            const { id } = req.params
            const data = await AuthorService.getById(id)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // POST /api/author
    async create(req, res, next) {
        try {
            const data = await AuthorService.create(req.body)
            res.status(201).json(data)
        } catch (err) {
            next(err)
        }
    },

    // PUT /api/author/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            const data = await AuthorService.update(id, req.body)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // DELETE /api/author/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const success = await AuthorService.delete(id)
            return res.json({ success })
        } catch (err) {
            next(err)
        }
    },
}

export default AuthorController
