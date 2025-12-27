import CartService from '../services/cart.service.js';
import CheckoutService from '../services/checkout.service.js';
import UserService from '../services/user.service.js';

const CheckoutController = {
    // GET /checkout
    async index(req, res) {
        if (!req.session.user) return res.redirect('/login');

        const customerId = req.session.user.customerId;
        const userId = req.session.user.id;
        
        const voucherCode = req.query.voucher || null;
        // 👇 NHẬN DANH SÁCH ID SÁCH ĐÃ CHỌN (Dạng chuỗi "1,2,3")
        const selectedStr = req.query.selected || ''; 
        const selectedIds = selectedStr ? selectedStr.split(',').map(Number) : [];

        const data = await CartService.getCartDetails(customerId);
        if (data.items.length === 0) return res.redirect('/cart');

        // 👇 LỌC SÁCH: Chỉ giữ lại sách có trong danh sách đã chọn
        let checkoutItems = data.items;
        if (selectedIds.length > 0) {
            checkoutItems = data.items.filter(item => selectedIds.includes(item.MaSach));
        }

        // Nếu lọc xong mà không có món nào (do user hack URL xóa hết ID) -> Về giỏ hàng
        if (checkoutItems.length === 0) return res.redirect('/cart');

        // 👇 TÍNH LẠI TỔNG TIỀN CHO CÁC MÓN ĐÃ LỌC
        const grandTotal = checkoutItems.reduce((sum, item) => sum + item.ThanhTien, 0);

        const customerInfo = await UserService.getProfile(userId);
        const discountAmount = await CheckoutService.calculateDiscount(voucherCode, grandTotal, customerId);
        const finalTotal = grandTotal - discountAmount;

        res.render('user/checkout', {
            title: 'Thanh toán',
            path: '/checkout',
            cartItems: checkoutItems, // Chỉ truyền sách đã chọn
            
            grandTotal: grandTotal,    
            discountAmount: discountAmount,
            finalTotal: finalTotal,        
            voucherCode: voucherCode,       
            
            // 👇 TRUYỀN DANH SÁCH ID SANG VIEW ĐỂ GỬI KHI ORDER
            selectedItems: selectedStr, 

            user: customerInfo || { HoTen: '', SDT: '', DiaChi: '' } 
        });
    },

    // POST /checkout/order
    async order(req, res) {
        if (!req.session.user) return res.redirect('/login');

        try {
            const customerId = req.session.user.customerId;
            // 👇 NHẬN THÊM BIẾN selectedItems TỪ FORM
            const { voucherCode, selectedItems, ...orderInfo } = req.body; 

            // Chuyển chuỗi "1,2,3" thành mảng [1, 2, 3]
            const selectedIds = selectedItems ? selectedItems.split(',').map(Number) : [];

            // Gọi Service với danh sách ID cụ thể
            const orderId = await CheckoutService.placeOrder(customerId, orderInfo, voucherCode, selectedIds);

            res.locals.totalQuantity = 0;
            res.render('user/order-success', {
                title: 'Đặt hàng thành công',
                path: '/checkout',
                orderId: orderId
            });

        } catch (error) {
            console.error('Lỗi Controller Order:', error);
            res.status(500).send('Lỗi đặt hàng. Vui lòng thử lại.');
        }
    }
};

export default CheckoutController;