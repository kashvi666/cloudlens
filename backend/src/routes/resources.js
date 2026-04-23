const router = require('express').Router();
router.get('/', (req, res) => res.json({ message: 'Resources route working' }));
module.exports = router;