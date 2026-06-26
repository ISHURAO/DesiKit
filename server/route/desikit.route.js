import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
    createB2BContract,
    getB2BContracts,
    updateB2BContractStatus,
    addRentalItem,
    getRentalItems,
    bookRentalItem,
    createCommunityListing,
    getCommunityListings,
    updateListingStatus,
    logMilkCollection,
    getMilkCollectionLogs,
    bookFarmVisit,
    getFarmVisits,
    updateFarmVisitStatus
} from '../controllers/desikit.controller.js';

const desikitRouter = Router();

// B2B Contracts
desikitRouter.post('/b2b/contract', auth, createB2BContract);
desikitRouter.get('/b2b/contracts', auth, getB2BContracts);
desikitRouter.put('/b2b/contract/status', auth, updateB2BContractStatus);

// Rentals
desikitRouter.post('/rental/add', auth, addRentalItem);
desikitRouter.get('/rental/list', auth, getRentalItems);
desikitRouter.post('/rental/book', auth, bookRentalItem);

// Community Listings
desikitRouter.post('/community/create', auth, createCommunityListing);
desikitRouter.get('/community/list', auth, getCommunityListings);
desikitRouter.put('/community/status', auth, updateListingStatus);

// Milk Collection
desikitRouter.post('/milk-collection/log', auth, logMilkCollection);
desikitRouter.get('/milk-collection/logs', auth, getMilkCollectionLogs);

// Farm Visits
desikitRouter.post('/farm-visit/book', auth, bookFarmVisit);
desikitRouter.get('/farm-visit/list', auth, getFarmVisits);
desikitRouter.put('/farm-visit/status', auth, updateFarmVisitStatus);

export default desikitRouter;
