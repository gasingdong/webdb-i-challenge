const express = require('express');
const db = require('./data/dbConfig.js');

const router = express.Router();

router.use(express.json());

const validateAccountId = async (req, res, next) => {
  const { id } = req.params;

  if (Number.isNaN(Number(id)) || !Number.isFinite(Number(id))) {
    res.status(400).json({ error: 'The id is not a valid number.' });
    return;
  }

  try {
    const account = await db('accounts')
      .where({ id })
      .first();

    if (account) {
      req.account = account;
      next();
    } else {
      res.status(404).json({ error: 'There is no account with this id.' });
    }
  } catch (err) {
    next(err);
  }
};

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

router
  .route('/:id')
  .all(validateAccountId)
  .get(async (req, res) => {
    res.status(200).json(req.account);
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
