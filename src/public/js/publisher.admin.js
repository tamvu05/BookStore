import { initializeManager } from './adminManage.js'
const publisherConfig = {
    apiBaseUrl: '/api/publisher',
    modalAddId: 'add-publisher-modal',
    modalUpdateId: 'update-publisher-modal',
    entityName: 'nhà xuất bản',
    entityIdKey: 'MaNXB',
    entityNameKey: 'TenNXB',
    entityDescKey: 'MoTa',
}

initializeManager(publisherConfig)
