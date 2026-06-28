import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'

// DesiKit Additions
import wishlistRouter from './route/wishlist.route.js'
import walletRouter from './route/wallet.route.js'
import couponRouter from './route/coupon.route.js'
import farmerRouter from './route/farmer.route.js'
import deliveryRouter from './route/delivery.route.js'
import adminRouter from './route/admin.route.js'
import reviewRouter from './route/review.route.js'
import supportRouter from './route/support.route.js'
import notificationRouter from './route/notification.route.js'
import bannerRouter from './route/banner.route.js'
import desikitRouter from './route/desikit.route.js'

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ["GET", "POST", "PUT"]
    }
})

app.use(cors({
    credentials : true,
    origin : process.env.FRONTEND_URL || 'http://localhost:5173'
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(helmet({
    crossOriginResourcePolicy : false
}))

const PORT = process.env.PORT || 8080 

app.get("/",(request,response)=>{
    response.json({
        message : "DesiKit API Server is running on port " + PORT
    })
})

app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)

// DesiKit Routes Registration
app.use('/api/wishlist', wishlistRouter)
app.use('/api/wallet', walletRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/farmer', farmerRouter)
app.use('/api/delivery', deliveryRouter)
app.use('/api/admin', adminRouter)
app.use('/api/review', reviewRouter)
app.use('/api/support', supportRouter)
app.use('/api/notification', notificationRouter)
app.use('/api/banner', bannerRouter)
app.use('/api/desikit', desikitRouter)

// Real-Time Socket Connection Handlers
io.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Join room specific to an order so events are routed cleanly
    socket.on('joinOrderTracker', (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`Socket ${socket.id} joined room order_${orderId}`);
    });

    // When delivery rider sends location update
    socket.on('riderLocationUpdate', (data) => {
        const { orderId, lat, lng } = data;
        console.log(`Real-Time Location Broadcast for Order #${orderId}: ${lat}, ${lng}`);
        // Broadcast location updates directly to all listening consumers in that room
        socket.to(`order_${orderId}`).emit('liveRiderLocation', { lat, lng });
    });

    socket.on('disconnect', () => {
        console.log(`Socket Client Disconnected: ${socket.id}`);
    });
})

connectDB().then(()=>{
    server.listen(PORT,()=>{
        console.log("Server is running on port",PORT)
    })
})

