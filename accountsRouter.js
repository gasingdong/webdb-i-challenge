const express = require('express');
const db = require('./data/dbConfig.js');

const router = express.Router();

router.use(express.json());

const validateAccount = async (req, res, next) => {
  if (!req.body) {
    res.status(400).json({ error: 'Request body is empty.' });
    return;
  }

  const { name, budget } = req.body;

  if (name && budget) {
    try {
      const existing = await db('accounts')
        .where({ name })
        .first();

      if (!existing) {
        next();
      } else {
        res.status(400).json({ error: 'This account name already exists.' });
      }
    } catch (err) {
      next(err);
    }
  } else {
    res
      .status(400)
      .json({ error: 'All accounts require a name and a budget.' });
  }
};

router
  .route('/')
  .get(async (req, res, next) => {
    try {
      const accounts = await db('accounts');
      res.status(200).json(accounts);
    } catch (err) {
      next(err);
    }
  })
  .post(validateAccount, async (req, res, next) => {
    try {
      const { name, budget } = req.body;
      const [newId] = await db('accounts').insert({ name, budget });
      res.status(200).json({ id: newId });
    } catch (err) {
      next(err);
    }
  });

const accountsErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
  }
  console.log(err);
  res.status(500).json({ error: 'Error while processing accounts operation.' });
};

router.use(accountsErrorHandler);

module.exports = router;
