import TheLoaiModel from '../models/theLoai.model.js'

const TheLoaiService = {
    async getAll() {
        return await TheLoaiModel.getAll()
    },

    async getById(id) {
        if (!id) throw new Error('Thiếu mã thể loại')

        const tl = await TheLoaiModel.getById(id)
        if (!tl) throw new Error('Thể loại không tồn tại')

        return tl
    },

    async create(payload) {
        const { TenTL, GhiChu } = payload

        // Validate nghiệp vụ
        if (!TenTL || TenTL.trim() === '') {
            throw new Error('Tên thể loại là bắt buộc')
        }

        const insertId = await TheLoaiModel.create({ TenTL, GhiChu })
        return await TheLoaiModel.getById(insertId)
    },

    async update(id, payload) {
        if (!id) throw new Error('Thiếu mã thể loại')

        const exist = await TheLoaiModel.getById(id)
        if (!exist) throw new Error('Thể loại không tồn tại')

        const { TenTL, GhiChu } = payload

        if (!TenTL || TenTL.trim() === '') {
            throw new Error('Tên thể loại là bắt buộc')
        }

        const success = await TheLoaiModel.update(id, { TenTL, GhiChu })
        if (!success) throw new Error('Cập nhật thất bại')

        return await TheLoaiModel.getById(id)
    },

    async delete(id) {
        if (!id) throw new Error('Thiếu mã thể loại')

        const exist = await TheLoaiModel.getById(id)
        if (!exist) throw new Error('Thể loại không tồn tại')

        const success = await TheLoaiModel.delete(id)
        if (!success) throw new Error('Xóa thất bại')

        return true
    },
}

export default TheLoaiService
