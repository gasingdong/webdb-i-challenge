const express = require('express');
const db = require('./data/dbConfig.js');

const router = express.Router();

router.use(express.json());

router.route('/').get(async (req, res) => {
  try {
    const accounts = await db('accounts').select('*');
    res.status(200).json(accounts);
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Error while processing account operation.' });
  }
});

module.exports = router;
