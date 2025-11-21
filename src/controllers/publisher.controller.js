import PublisherService from '../services/publisher.service.js'

const PublisherController = {
    // GET /admin/publisher
    async getAll(req, res, next) {
        try {
            const data = await PublisherService.getAll()
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // GET /admin/publisher/:id
    async getById(req, res, next) {
        try {
            const { id } = req.params
            const data = await PublisherService.getById(id)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // POST /api/publisher
    async create(req, res, next) {
        try {
            const data = await PublisherService.create(req.body)
            res.status(201).json(data)
        } catch (err) {
            next(err)
        }
    },

    // PUT /api/publisher/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            console.log(req.body)
            const data = await PublisherService.update(id, req.body)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // DELETE /api/publisher/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const success = await PublisherService.delete(id)
            return res.json({ success })
        } catch (err) {
            next(err)
        }
    },
}

export default PublisherController
