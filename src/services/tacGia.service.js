import TacGiaModel from '../models/tacGia.model.js'

const TacGiaService = {
    async getAll() {
        return await TacGiaModel.getAll()
    },

    async getById(id) {
        if (!id) throw new Error('Thiếu mã tác giả')

        const tg = await TacGiaModel.getById(id)
        if (!tg) throw new Error('Tác giả không tồn tại')

        return tg
    },

    async create(payload) {
        const { TenTG, GhiChu } = payload

        // Validate nghiệp vụ
        if (!TenTG || TenTG.trim() === '') {
            throw new Error('Tên tác giả là bắt buộc')
        }

        const insertId = await TacGiaModel.create({ TenTG, GhiChu })

        return await TacGiaModel.getById(insertId)
    },

    async update(id, payload) {
        if (!id) throw new Error('Thiếu mã tác giả')

        const exist = await TacGiaModel.getById(id)
        if (!exist) throw new Error('Tác giả không tồn tại')

        const { TenTG, GhiChu } = payload

        if (!TenTG || TenTG.trim() === '') {
            throw new Error('Tên tác giả là bắt buộc')
        }

        const success = await TacGiaModel.update(id, { TenTG, GhiChu })
        if (!success) throw new Error('Cập nhật thất bại')

        return await TacGiaModel.getById(id)
    },

    async delete(id) {
        if (!id) throw new Error('Thiếu mã tác giả')

        const exist = await TacGiaModel.getById(id)
        if (!exist) throw new Error('Tác giả không tồn tại')

        const success = await TacGiaModel.delete(id)
        if (!success) throw new Error('Xóa thất bại')

        return true
    },
}

export default TacGiaService
