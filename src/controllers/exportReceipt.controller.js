import { exportReceiptConfig } from "../configs/adminView.config.js"
import exportFileExcel from '../utils/exportFileExcel.js'
import BookService from '../services/book.service.js'
import ExportReceiptService from '../services/exportReceipt.service.js'

const ImportReceiptController = {
    // GET /admin/export-receipt
    async getViewManager(req, res, next) {
        try {
            const query = req.query
            const data = await ExportReceiptService.getWithParam(query)
            res.render('admin/viewManager', {
                exportReceipts: data.exportReceipts,
                currentPage: data.currentPage,
                totalPage: data.totalPage,
                totalItem: data.totalItem,
                totalItemPerPage: data.exportReceipts.length,
                PAGE_LIMIT: data.PAGE_LIMIT,
                scripts: exportReceiptConfig.scripts,
                entityName: exportReceiptConfig.entityName,
                tablePartial: exportReceiptConfig.tablePartial,
                modalAddSelector: exportReceiptConfig.modalAddSelector,
                modalAddPartial: exportReceiptConfig.modalAddPartial,
                hrefBase: exportReceiptConfig.hrefBase,
                apiBase: exportReceiptConfig.apiBase,
                modalAddId: exportReceiptConfig.modalAddId,
                modalUpdateId: exportReceiptConfig.modalUpdateId,
            })
        } catch (err) {
            next(err)
        }
    },

    // GET /api/export-receipt
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
            const query = req.query
            const data = await ExportReceiptService.getWithParam(query)
            const table = await renderPartial(
                'admin/partials/exportReceipt/tableExportReceipt',
                {
                    exportReceipts: data.exportReceipts,
                    currentPage: data.currentPage,
                    totalPage: data.totalPage,
                    totalItem: data.totalItem,
                    totalItemPerPage: data.exportReceipts.length,
                    PAGE_LIMIT: data.PAGE_LIMIT,
                }
            )

            const pagination = await renderPartial(
                'admin/partials/pagination',
                {
                    currentPage: data.currentPage,
                    totalPage: data.totalPage,
                    hrefBase: exportReceiptConfig.hrefBase,
                    apiBase: exportReceiptConfig.apiBase,
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

    // GET /api/export-receipt/:id
    async getById(req, res, next) {
        try {
            const { id } = req.params
            const data = await ExportReceiptService.getById(id)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // GET /api/export-receipt/detail/:id
    async getDetailById(req, res, next) {
        try {
            const { id } = req.params
            const data = await ExportReceiptService.getDetailById(id)
            return res.json(data)
        } catch (err) {
            next(err)
        }
    },

    // POST /api/export-receipt
    async create(req, res, next) {
        try {
            const data = await ExportReceiptService.create(req.body)
            res.status(201).json(data)
        } catch (err) {
            next(err)
        }
    },

    
}

export default ImportReceiptController