const router = require('express').Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const ctrl = require('../controllers/projectController');

router.get('/', auth, ctrl.getProjects);
router.get('/users', auth, ctrl.getAllUsers);
router.get('/:id', auth, ctrl.getProjectById);
router.post('/', auth, roleCheck(['admin']), ctrl.createProject);
router.delete('/:id', auth, roleCheck(['admin']), ctrl.deleteProject);

module.exports = router;