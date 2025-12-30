const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All audit routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// Get audit logs
router.get('/logs', auditController.getAuditLogs);

// Get import history
router.get('/imports', auditController.getImportHistory);

module.exports = router;



