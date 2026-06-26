import { Router } from 'express'
import { checkoutOrderController, getOrderItemsController, cancelOrderController, calculateDeliveryFeeController } from '../controllers/order.controller.js'
import auth from '../middleware/auth.js'

const orderRouter = Router()

// Point both COD and online/wallet checkouts to the checkout controller
orderRouter.post('/cash-on-delivery', auth, checkoutOrderController)
orderRouter.post('/checkout', auth, checkoutOrderController)
orderRouter.post('/calculate-delivery', auth, calculateDeliveryFeeController)
orderRouter.get('/order-list', auth, getOrderItemsController)
orderRouter.put('/cancel', auth, cancelOrderController)

export default orderRouter