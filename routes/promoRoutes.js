// routes/promoRoutes.js
const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');


// CRUD routes
router.get('/', promoController.getPromotions); // List all
router.get('/:id', promoController.getPromotionById); // Get one
router.post('/', promoController.createPromotion); // Create
router.put('/:id', promoController.updatePromotion); // Update
router.delete('/:id', promoController.deletePromotion); // Delete

module.exports = router;
