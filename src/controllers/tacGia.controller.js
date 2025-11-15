import TacGiaService from '../services/tacGia.service.js'

const TacGiaController = {
    // GET /tacgia
    async getAll(req, res, next) {
        try {
            const data = await TacGiaService.getAll()
            res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // GET /tacgia/:id
    async getById(req, res, next) {
        try {
            const { id } = req.params
            const data = await TacGiaService.getById(id)
            res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // POST /tacgia
    async create(req, res, next) {
        try {
            const data = await TacGiaService.create(req.body)
            res.status(201).json(data)
        } catch (err) {
            next(err)
        }
    },

    // PUT /tacgia/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            const data = await TacGiaService.update(id, req.body)
            res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // DELETE /tacgia/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const success = await TacGiaService.delete(id)
            res.json({ success })
        } catch (err) {
            next(err)
        }
    },
}

export default TacGiaController
