const router = require('express').Router();
router.get('/', (req, res) => res.json({ message: 'Costs route working' }));
module.exports = router;