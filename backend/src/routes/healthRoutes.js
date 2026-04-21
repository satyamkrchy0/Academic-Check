const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Academic Check API is running'
  });
});

module.exports = router;
