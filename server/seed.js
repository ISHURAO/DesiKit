import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import bcryptjs from "bcryptjs";

// Import Models
import UserModel from "./models/user.model.js";
import FarmerModel from "./models/farmer.model.js";
import DeliveryPartnerModel from "./models/deliveryPartner.model.js";
import CategoryModel from "./models/category.model.js";
import SubCategoryModel from "./models/subCategory.model.js";
import ProductModel from "./models/product.model.js";
import WalletModel from "./models/wallet.model.js";

const usersData = [
  {
    _id: "65cf11111111111111111111",
    name: "DesiKit Admin",
    email: "admin@desikit.com",
    password: "$2a$10$9.r81QGk8j5HnJ/x9P7GieoU4x4xQe9v3rCj9uH3o8z1t3s6q2Y3S", // password123
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150",
    mobile: "9999999999",
    verify_email: true,
    status: "Active",
    role: "ADMIN",
    wallet_balance: 1000,
    referral_code: "ADMIN123"
  },
  {
    _id: "65cf22222222222222222222",
    name: "Ishu Yadav",
    email: "ishuy066@gmail.com",
    password: "$2a$10$9.r81QGk8j5HnJ/x9P7GieoU4x4xQe9v3rCj9uH3o8z1t3s6q2Y3S", // password123
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
    mobile: "07988826890",
    verify_email: true,
    status: "Active",
    role: "USER",
    wallet_balance: 500,
    referral_code: "ISHU2026"
  },
  {
    _id: "65cf33333333333333333333",
    name: "Ram Singh (Farmer)",
    email: "farmer@desikit.com",
    password: "$2a$10$9.r81QGk8j5HnJ/x9P7GieoU4x4xQe9v3rCj9uH3o8z1t3s6q2Y3S", // password123
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=150",
    mobile: "9876543210",
    verify_email: true,
    status: "Active",
    role: "FARMER",
    wallet_balance: 0,
    referral_code: "FARMER50"
  },
  {
    _id: "65cf44444444444444444444",
    name: "Vijay Kumar (Rider)",
    email: "delivery@desikit.com",
    password: "$2a$10$9.r81QGk8j5HnJ/x9P7GieoU4x4xQe9v3rCj9uH3o8z1t3s6q2Y3S", // password123
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150",
    mobile: "8765432109",
    verify_email: true,
    status: "Active",
    role: "DELIVERY_PARTNER",
    wallet_balance: 0,
    referral_code: "RIDER99"
  }
];

const farmersData = [
  {
    _id: "65cf3333333333333333333a",
    user_id: "65cf33333333333333333333",
    farm_name: "Krishna Organic Dairy",
    farm_address: "Krishna Dham, Mathura Rural, Uttar Pradesh",
    verified: "approved",
    license_doc: "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=400",
    earnings: 450.50
  }
];

const deliveryPartnersData = [
  {
    _id: "65cf4444444444444444444a",
    user_id: "65cf44444444444444444444",
    vehicle_details: "Motorcycle (Hero Splendor)",
    vehicle_number: "UP-85-AB-1234",
    verified: "approved",
    live_location: {
      lat: 27.4924,
      lng: 77.6737
    },
    earnings: 120.00
  }
];

const categoriesData = [
  {
    _id: "65cf55555555555555555551",
    name: "Fresh Dairy",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=300"
  },
  {
    _id: "65cf55555555555555555552",
    name: "Fresh Vegetables",
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=300"
  },
  {
    _id: "65cf55555555555555555553",
    name: "Fruits",
    image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=300"
  },
  {
    _id: "65cf55555555555555555554",
    name: "Honey & Organics",
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=300"
  }
];

const subcategoriesData = [
  {
    _id: "65cf66666666666666666661",
    name: "Milk & Cream",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=200",
    category: [ "65cf55555555555555555551" ]
  },
  {
    _id: "65cf66666666666666666662",
    name: "Paneer & Ghee",
    image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?q=80&w=200",
    category: [ "65cf55555555555555555551" ]
  },
  {
    _id: "65cf66666666666666666663",
    name: "Leafy Greens",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=200",
    category: [ "65cf55555555555555555552" ]
  },
  {
    _id: "65cf66666666666666666664",
    name: "Raw Honey",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=200",
    category: [ "65cf55555555555555555554" ]
  }
];

const productsData = [
  {
    _id: "65cf77777777777777777771",
    name: "A2 Gir Cow Milk",
    image: [ "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600" ],
    category: "65cf55555555555555555551",
    subCategory: "65cf66666666666666666661",
    unit: "1 Litre",
    stock: 50,
    price: 90,
    discount: 5,
    description: "Premium A2 milk from grass-fed Gir cows. High nutritional value, sweet taste, and easy digestibility.",
    farmer_id: "65cf33333333333333333333",
    status: "active"
  },
  {
    _id: "65cf77777777777777777775",
    name: "Sahiwal Cow Fresh Milk",
    image: [ "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600" ],
    category: "65cf55555555555555555551",
    subCategory: "65cf66666666666666666661",
    unit: "1 Litre",
    stock: 45,
    price: 85,
    discount: 0,
    description: "Raw milk from purebred Sahiwal cows, known for its rich fat content and immunity-boosting properties.",
    farmer_id: "65cf33333333333333333333",
    status: "active"
  },
  {
    _id: "65cf77777777777777777776",
    name: "Holstein Friesian Cow Milk",
    image: [ "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?q=80&w=600" ],
    category: "65cf55555555555555555551",
    subCategory: "65cf66666666666666666661",
    unit: "1 Litre",
    stock: 60,
    price: 65,
    discount: 8,
    description: "Pasteurized, light, and digestible daily milk from high-yielding Holstein Friesian cows.",
    farmer_id: "65cf33333333333333333333",
    status: "active"
  },
  {
    _id: "65cf77777777777777777777",
    name: "Murrah Buffalo Creamy Milk",
    image: [ "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600" ],
    category: "65cf55555555555555555551",
    subCategory: "65cf66666666666666666661",
    unit: "1 Litre",
    stock: 40,
    price: 95,
    discount: 5,
    description: "Thick, high-fat cream milk sourced from elite Murrah buffaloes. Ideal for home-made paneer and tea.",
    farmer_id: "65cf33333333333333333333",
    status: "active"
  },
  {
    _id: "65cf77777777777777777778",
    name: "Jaffrabadi Rich Buffalo Milk",
    image: [ "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=600" ],
    category: "65cf55555555555555555551",
    subCategory: "65cf66666666666666666661",
    unit: "1 Litre",
    stock: 35,
    price: 98,
    discount: 10,
    description: "Premium thick milk from Jaffrabadi buffaloes, highly valued for its solid-not-fat content and rich texture.",
    farmer_id: "65cf33333333333333333333",
    status: "active"
  },
  {
    _id: "65cf77777777777777777772",
    name: "Organic Farm Paneer",
    image: [ "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?q=80&w=600" ],
    category: "65cf55555555555555555551",
    subCategory: "65cf66666666666666666662",
    unit: "200 gm",
    stock: 30,
    price: 90,
    discount: 10,
    description: "Soft and fresh home-style paneer made directly on the farm with whole milk.",
    farmer_id: "65cf33333333333333333333",
    status: "active"
  },
  {
    _id: "65cf77777777777777777773",
    name: "Fresh Organic Spinach",
    image: [ "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=600" ],
    category: "65cf55555555555555555552",
    subCategory: "65cf66666666666666666663",
    unit: "250 gm (Bunch)",
    stock: 40,
    price: 30,
    discount: 0,
    description: "Chemical-free green spinach harvested today morning.",
    farmer_id: "65cf33333333333333333333",
    status: "active"
  },
  {
    _id: "65cf77777777777777777774",
    name: "Raw Wild Forest Honey",
    image: [ "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600" ],
    category: "65cf55555555555555555554",
    subCategory: "65cf66666666666666666664",
    unit: "500 gm",
    stock: 25,
    price: 250,
    discount: 15,
    description: "Pure honey harvested organically from forests. Unheated and unfiltered.",
    farmer_id: "65cf33333333333333333333",
    status: "active"
  }
];

async function seed() {
    try {
        console.log("Connecting to database:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected! Wiping old collections...");

        // Wipe
        await UserModel.deleteMany({});
        await FarmerModel.deleteMany({});
        await DeliveryPartnerModel.deleteMany({});
        await CategoryModel.deleteMany({});
        await SubCategoryModel.deleteMany({});
        await ProductModel.deleteMany({});
        await WalletModel.deleteMany({});

        console.log("Collections cleared. Seeding fresh data...");

        // Hash passwords dynamically
        const salt = await bcryptjs.genSalt(10);
        for (const user of usersData) {
            user.password = await bcryptjs.hash("password123", salt);
        }

        // Seed
        await UserModel.insertMany(usersData);
        await FarmerModel.insertMany(farmersData);
        await DeliveryPartnerModel.insertMany(deliveryPartnersData);
        await CategoryModel.insertMany(categoriesData);
        await SubCategoryModel.insertMany(subcategoriesData);
        await ProductModel.insertMany(productsData);

        // Seed wallets for users
        for (const user of usersData) {
            const wallet = new WalletModel({
                userId: user._id,
                balance: user.wallet_balance,
                transactions: user.wallet_balance > 0 ? [{
                    amount: user.wallet_balance,
                    type: 'credit',
                    description: 'Initial Seed Balance'
                }] : []
            });
            await wallet.save();
        }

        console.log("Database seeded successfully! DesiKit is ready.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
