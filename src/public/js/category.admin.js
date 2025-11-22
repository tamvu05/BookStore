import showToast from './toast.js'

const tableWrapper = document.querySelector('#table-view-manager')
const paginationWrapper = document.querySelector('#pagination-view-manager')

/**
 *  Element của Add Modal
 *  Xử lý Add button
 */

const addModal = document.querySelector('#add-category-modal')
const btnAddCategory = addModal.querySelector('.btn-add-category-name')
const nameEmptyAddModal = addModal.querySelector('.empty-name')
const notUniqueAddModal = addModal.querySelector('.not-unique-name')
const newDescriptionElement = addModal.querySelector('#new-category-desc')
const newCategoryNameElement = addModal.querySelector('#new-category-name')

if (btnAddCategory) {
    btnAddCategory.onclick = async () => {
        const TenTL = newCategoryNameElement.value.trim()
        const MoTa = newDescriptionElement.value.trim()

        if (TenTL === '') {
            nameEmptyAddModal.classList.add('active')
            return
        }

        try {
            const res = await fetch('/api/category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ TenTL, MoTa }),
            })

            const data = await res.json()

            if (!res.ok)
                throw new Error(
                    data.message ||
                        data.error ||
                        `Lỗi HTTP ${res.status}: Thao tác thất bại.`
                )

            const dataAttributeElement = tableWrapper.querySelector('#data-attribute')
            const targetPage = dataAttributeElement.dataset.totalPage

            updateView(targetPage)
            showToast('Đã thêm thể loại', 'success')

            if (addModal) {
                const modalInstance = bootstrap.Modal.getInstance(addModal)
                modalInstance.hide()
            }
        } catch (error) {
            if (error.message == 'Trùng tên thể loại') {
                notUniqueAddModal.classList.add('active')
                return
            }
            console.log(error)
            showToast(error.message, 'danger')
        }
    }
}

// Loại bỏ element thông báo invalid
if (newCategoryNameElement) {
    newCategoryNameElement.oninput = () => {
        nameEmptyAddModal.classList.remove('active')
        notUniqueAddModal.classList.remove('active')
    }

    newCategoryNameElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            btnAddCategory.click()
        }
    })
}

if (addModal) {
    addModal.addEventListener('hidden.bs.modal', () => {
        nameEmptyAddModal.classList.remove('active')
        notUniqueAddModal.classList.remove('active')
        newCategoryNameElement.value = ''
        newDescriptionElement.value = ''
    })
}

/**
 * Element của Update Modal
 * Xử lý Delete button
 * Xử lý Update button
 */

if (tableWrapper) {
    tableWrapper.onclick = async (event) => {
        // Delete thể loại
        const btnDelete = event.target.closest('.btn-delete-category')
        if (btnDelete) {
            deleteCategory(btnDelete)
        }

        // update thể loại
        const btnUpdate = event.target.closest('.btn-show-update-category')
        if (btnUpdate) {
            await showModalUpdate(btnUpdate)
        }
    }
}

async function deleteCategory(btnDelete) {
    const rowElement = btnDelete.parentElement.parentElement
    const MaTL = rowElement.dataset.id
    if (MaTL) {
        try {
            const res = await fetch('/api/category/' + MaTL, {
                method: 'DELETE',
            })

            const data = await res.json()

            if (!res.ok)
                throw new Error(
                    data.message ||
                        data.error ||
                        `Lỗi HTTP ${res.status}: Thao tác thất bại.`
                )

            const dataAttributeElement = tableWrapper.querySelector('#data-attribute')
            let newPage = dataAttributeElement.dataset.currentPage
            if (dataAttributeElement.dataset.totalItem < 2) newPage -= 1

            updateView(newPage)
            showToast('Đã xóa thể loại', 'success')
        } catch (error) {
            console.log(error)
            showToast(error.message, 'danger')
        }
    }
}

const updateModal = document.querySelector('#update-category-modal')

async function showModalUpdate(btnUpdate) {
    const row = btnUpdate.parentElement.parentElement
    const id = row.dataset.id

    try {
        const res = await fetch(`/api/category/${id}`, { method: 'GET' })
        const category = await res.json()

        if (!res.ok)
            throw new Error(
                data.message ||
                    data.error ||
                    `Lỗi HTTP ${res.status}: Thao tác thất bại.`
            )

        updateNameElement.value = category.TenTL
        updateDescElement.value = category.MoTa
        updateNameElement.dataset.originalName = category.TenTL
        updateNameElement.dataset.id = category.MaTL

        if (updateModal) {
            const modalInstance = bootstrap.Modal.getInstance(updateModal)
            if (modalInstance) {
                modalInstance.show()
            } else {
                const newInstance = new bootstrap.Modal(updateModal)
                newInstance.show()
            }
        }
    } catch (error) {
        console.log('Có lỗi khi hiện thông tin thể loại: ' + error)
    }
}

// Chỉnh sửa thể loại
const btnUpdate = updateModal.querySelector('.btn-update-category-name')
const updateNameElement = updateModal.querySelector('#update-category-name')
const updateDescElement = updateModal.querySelector('#update-category-desc')
const nameEmptyUpdateModal = updateModal.querySelector('.empty-name')
const notUniqueUpdateModal = updateModal.querySelector('.not-unique-name')

if (btnUpdate) {
    btnUpdate.onclick = async () => {
        const TenTL = updateNameElement.value.trim()
        const MoTa = updateDescElement.value.trim()

        if (TenTL === '') {
            nameEmptyUpdateModal.classList.add('active')
            return
        }

        try {
            const id = updateNameElement.dataset.id
            const res = await fetch(`/api/category/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ TenTL, MoTa }),
            })

            const data = await res.json()

            if (!res.ok)
                throw new Error(
                    data.message ||
                        data.error ||
                        `Lỗi HTTP ${res.status}: Thao tác thất bại.`
                )

            const dataAttributeElement = tableWrapper.querySelector('#data-attribute')
            updateView(dataAttributeElement.dataset.currentPage)
            showToast('Đã cập nhật thể loại', 'success')

            if (updateModal) {
                const modalInstance = bootstrap.Modal.getInstance(updateModal)
                modalInstance.hide()
            }
        } catch (error) {
            if (error.message === 'Trùng tên thể loại') {
                notUniqueUpdateModal.classList.add('active')
                return
            }
            console.log(error)
            showToast(error.message, 'danger')
        }
    }
}

// Loại bỏ element thông báo invalid
if (updateNameElement) {
    updateNameElement.oninput = () => {
        nameEmptyUpdateModal.classList.remove('active')
        notUniqueUpdateModal.classList.remove('active')
    }

    updateNameElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            btnUpdate.click()
        }
    })
}

if (updateModal) {
    updateModal.addEventListener('hidden.bs.modal', () => {
        nameEmptyUpdateModal.classList.remove('active')
        notUniqueUpdateModal.classList.remove('active')
        updateNameElement.value = ''
        updateDescElement.value = ''
    })
}

/**
 * Cập nhật lại table và pagination
 * @param {*} page : page muốn chuyển đến
 */

async function updateView(page = 1) {
    try {
        if (isNaN(page) || Number(page) < 1) page = 1

        const res = await fetch(`/api/category/partials?page=${page}`)
        const data = await res.json()

        if (tableWrapper) tableWrapper.innerHTML = data.table
        if (paginationWrapper) paginationWrapper.innerHTML = data.pagination
    } catch (error) {
        console.log(error)
        showToast(error.message, 'danger')
    }
}
