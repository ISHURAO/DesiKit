import B2BContractModel from '../models/b2bContract.model.js';
import RentalModel from '../models/rental.model.js';
import CommunityListingModel from '../models/communityListing.model.js';
import MilkCollectionModel from '../models/milkCollection.model.js';
import FarmBookingModel from '../models/farmBooking.model.js';
import ProductModel from '../models/product.model.js';
import UserModel from '../models/user.model.js';

// ==========================================
// 1. B2B Contracts
// ==========================================
export const createB2BContract = async (req, res) => {
    try {
        const { farmerId, companyName, gstin, items, deliverySchedule, endDate } = req.body;
        const businessId = req.userId;

        const newContract = new B2BContractModel({
            businessId,
            farmerId,
            companyName,
            gstin,
            items,
            deliverySchedule,
            endDate
        });

        await newContract.save();
        res.status(201).json({
            message: "B2B Contract proposal created successfully",
            success: true,
            data: newContract
        });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

export const getB2BContracts = async (req, res) => {
    try {
        const userId = req.userId;
        // Fetch contracts where user is either the business or the farmer
        const contracts = await B2BContractModel.find({
            $or: [{ businessId: userId }, { farmerId: userId }]
        })
        .populate('businessId', 'name email mobile')
        .populate('farmerId', 'name email mobile')
        .populate('items.productId');

        res.json({ success: true, data: contracts });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

export const updateB2BContractStatus = async (req, res) => {
    try {
        const { contractId, status } = req.body;
        const updated = await B2BContractModel.findByIdAndUpdate(
            contractId,
            { status },
            { new: true }
        );
        res.json({ message: `Contract status updated to ${status}`, success: true, data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

// ==========================================
// 2. Farm Equipment Rentals
// ==========================================
export const addRentalItem = async (req, res) => {
    try {
        const { equipmentName, description, hourlyPrice, securityDeposit, image } = req.body;
        const farmerId = req.userId;

        const newItem = new RentalModel({
            farmerId,
            equipmentName,
            description,
            hourlyPrice,
            securityDeposit,
            image
        });

        await newItem.save();
        res.status(201).json({ message: "Equipment listed for rent", success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

export const getRentalItems = async (req, res) => {
    try {
        const rentals = await RentalModel.find().populate('farmerId', 'name mobile');
        res.json({ success: true, data: rentals });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

export const bookRentalItem = async (req, res) => {
    try {
        const { rentalId, bookingDate, startHour, endHour } = req.body;
        const userId = req.userId;

        const rental = await RentalModel.findById(rentalId);
        if (!rental) {
            return res.status(404).json({ message: "Rental equipment not found", error: true });
        }

        // Check if there is already a confirmed or pending booking overlapping this slot
        const isConflict = rental.bookings.some(b => 
            b.bookingDate === bookingDate && 
            b.status !== 'cancelled' &&
            ((startHour >= b.startHour && startHour < b.endHour) || 
             (endHour > b.startHour && endHour <= b.endHour) ||
             (startHour <= b.startHour && endHour >= b.endHour))
        );

        if (isConflict) {
            return res.status(400).json({ message: "Selected time slot is already booked", error: true });
        }

        rental.bookings.push({
            userId,
            bookingDate,
            startHour,
            endHour,
            status: 'confirmed' // Pre-approve for simplicity
        });

        await rental.save();
        res.json({ message: "Booking confirmed successfully", success: true, data: rental });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

// ==========================================
// 3. Community Bazaar Listings
// ==========================================
export const createCommunityListing = async (req, res) => {
    try {
        const { title, description, category, price, condition, contactPhone, image, location } = req.body;
        const sellerId = req.userId;

        const listing = new CommunityListingModel({
            sellerId,
            title,
            description,
            category,
            price,
            condition,
            contactPhone,
            image,
            location
        });

        await listing.save();
        res.status(201).json({ message: "Listing posted in Community Bazaar", success: true, data: listing });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

export const getCommunityListings = async (req, res) => {
    try {
        const listings = await CommunityListingModel.find().populate('sellerId', 'name');
        res.json({ success: true, data: listings });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

export const updateListingStatus = async (req, res) => {
    try {
        const { listingId, status } = req.body;
        const updated = await CommunityListingModel.findByIdAndUpdate(
            listingId,
            { status },
            { new: true }
        );
        res.json({ message: "Listing status updated", success: true, data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

// ==========================================
// 4. Milk Collection Logs
// ==========================================
export const logMilkCollection = async (req, res) => {
    try {
        const { farmerId, date, quantity, fatPercentage, snfPercentage, ratePerLitre } = req.body;
        const totalAmount = quantity * ratePerLitre;

        const log = new MilkCollectionModel({
            farmerId,
            date,
            quantity,
            fatPercentage,
            snfPercentage,
            ratePerLitre,
            totalAmount,
            paymentStatus: 'pending'
        });

        await log.save();
        res.status(201).json({ message: "Milk collection logged successfully", success: true, data: log });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

export const getMilkCollectionLogs = async (req, res) => {
    try {
        const { farmerId } = req.query;
        const filter = farmerId ? { farmerId } : { farmerId: req.userId };
        const logs = await MilkCollectionModel.find(filter).populate('farmerId', 'name');
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

// ==========================================
// 5. Farm Visit Bookings
// ==========================================
export const bookFarmVisit = async (req, res) => {
    try {
        const { farmerId, visitDate, visitorCount, bookingFee } = req.body;
        const userId = req.userId;

        const booking = new FarmBookingModel({
            farmerId,
            userId,
            visitDate,
            visitorCount,
            bookingFee
        });

        await booking.save();
        res.status(201).json({ message: "Farm visit booked successfully!", success: true, data: booking });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

export const getFarmVisits = async (req, res) => {
    try {
        const userId = req.userId;
        const visits = await FarmBookingModel.find({
            $or: [{ userId }, { farmerId: userId }]
        })
        .populate('userId', 'name mobile')
        .populate('farmerId', 'name location');

        res.json({ success: true, data: visits });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};

export const updateFarmVisitStatus = async (req, res) => {
    try {
        const { bookingId, status } = req.body;
        const updated = await FarmBookingModel.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        );
        res.json({ message: `Farm booking status updated to ${status}`, success: true, data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message || error, error: true, success: false });
    }
};
