const router = require('express').Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const ctrl = require('../controllers/taskController');

router.get('/dashboard', auth, ctrl.getDashboardStats);
router.get('/project/:projectId', auth, ctrl.getTasksByProject);
router.post('/', auth, ctrl.createTask);
router.patch('/:id/status', auth, ctrl.updateTaskStatus);
router.delete('/:id', auth, roleCheck(['admin']), ctrl.deleteTask);

module.exports = router;