const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// All network device routes require authentication and Admin or IT Support role
router.use(verifyToken);
router.use(requireRole(['Admin', 'IT Support']));

// 1. GET /api/network-devices - Fetch list with search & filter
router.get('/', networkController.getAllDevices);

// 2. GET /api/network-devices/:id - Fetch single device details
router.get('/:id', networkController.getDeviceById);

// 3. POST /api/network-devices - Create new device (IP duplicate check)
router.post('/', networkController.createDevice);

// 4. PUT /api/network-devices/:id - Update device
router.put('/:id', networkController.updateDevice);

// 5. DELETE /api/network-devices/:id - Delete device (Admin only)
router.delete('/:id', requireRole(['Admin']), networkController.deleteDevice);

// 6. POST /api/network-devices/:id/reveal-passwords - Unmask real passwords with audit log
router.post('/:id/reveal-passwords', networkController.revealPasswords);

module.exports = router;
