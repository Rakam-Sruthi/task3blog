const router = require('express').Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', postController.list); // query: page, limit, search, category, author
router.get('/:id', postController.getById);

// protected for creating
router.post('/', auth, postController.create);
router.put('/:id', auth, postController.update);
router.delete('/:id', auth, postController.remove);

// admin endpoints
router.post('/:id/approve', auth, role(['admin']), postController.approve);
router.get('/admin/pending', auth, role(['admin']), postController.pending);

module.exports = router;