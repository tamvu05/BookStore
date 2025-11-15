import { json } from 'stream/consumers';
import TheLoaiService from  '../services/theLoai.service.js'

const TheLoaiController = {
    // GET /admin/theloai
    async getAll(req, res, next) {
        try {
            const data = await TheLoaiService.getAll()
            console.log(data);
            res.render('admin/theloai', {
                title: 'Admin Dashboard',
                data,
                scripts: ['/js/theLoai.admin.js']
            })
        } catch (err) {
            next(err)
        }
    },

    // GET /admin/theloai/:id
    async getById(req, res, next) {
        try {
            const { id } = req.params
            const data = await TheLoaiService.getById(id)
            res.json(data)
        } catch (err) {
            next(err)
        }
    },

// GET /theloai
    async getAllUser(req, res, next) {
        try {
            const data = await TheLoaiService.getAll()
             res.render('user/theloai', {
                title: 'Nhà sách ...',
                layout: res.userLayout,
                data
            })
        } catch (err) {
            next(err)
        }
    },

    // GET /theloai/:id
    async getByIdUser(req, res, next) {
        try {
            const { id } = req.params
            const data = await TheLoaiService.getById(id)
            res.json(data)
        } catch (err) {
            next(err)
        }
    },



    // POST /api/theloai
    async create(req, res, next) {
        try {
            const data = await TheLoaiService.create(req.body)
            res.status(201).json(data)
        } catch (err) {
            next(err)
        }
    },

    // PUT /api/theloai/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            const data = await TheLoaiService.update(id, req.body)
            res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // DELETE /api/theloai/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const success = await TheLoaiService.delete(id)
            res.json({ success })
        } catch (err) {
            next(err)
        }
    },
}

export default TheLoaiController
