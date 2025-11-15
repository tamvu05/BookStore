import NhaXuatBanModel from '../models/nhaXuatBan.model.js'

const NhaXuatBanService = {
    async getAll() {
        return await NhaXuatBanModel.getAll()
    },

    async getById(id) {
        if (!id) throw new Error('Thiếu mã nhà xuất bản')

        const nxb = await NhaXuatBanModel.getById(id)
        if (!nxb) throw new Error('Nhà xuất bản không tồn tại')

        return nxb
    },

    async create(payload) {
        const { TenNXB, DiaChi, Email, SDT } = payload

        // Validate nghiệp vụ
        if (!TenNXB || TenNXB.trim() === '') throw new Error('Tên nhà xuất bản là bắt buộc')

        const insertId = await NhaXuatBanModel.create({
            TenNXB,
            DiaChi,
            Email,
            SDT,
        })

        return await NhaXuatBanModel.getById(insertId)
    },

    async update(id, payload) {
        if (!id) throw new Error('Thiếu mã nhà xuất bản')

        const exist = await NhaXuatBanModel.getById(id)
        if (!exist) throw new Error('Nhà xuất bản không tồn tại')

        const { TenNXB, DiaChi, Email, SDT } = payload

        if (!TenNXB || TenNXB.trim() === '') throw new Error('Tên nhà xuất bản là bắt buộc')

        const success = await NhaXuatBanModel.update(id, {
            TenNXB,
            DiaChi,
            Email,
            SDT,
        })

        if (!success) throw new Error('Cập nhật thất bại')

        return await NhaXuatBanModel.getById(id)
    },

    async delete(id) {
        if (!id) throw new Error('Thiếu mã nhà xuất bản')

        const exist = await NhaXuatBanModel.getById(id)
        if (!exist) throw new Error('Nhà xuất bản không tồn tại')

        const success = await NhaXuatBanModel.delete(id)
        if (!success) throw new Error('Xóa thất bại')

        return true
    },
}

export default NhaXuatBanService
