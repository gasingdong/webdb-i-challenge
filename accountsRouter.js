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

const validateAccountUpdate = async (req, res, next) => {
  if (!req.body) {
    res.status(400).json({ error: 'Request body is empty.' });
    return;
  }

  const { name, budget } = req.body;

  if (name || budget) {
    if (name) {
      try {
        const existing = await db('accounts')
          .where({ name })
          .first();

        if (existing) {
          res.status(400).json({ error: 'This account name already exists.' });
          return;
        }
      } catch (err) {
        next(err);
      }
    }

    next();
  } else {
    res
      .status(400)
      .json({ error: 'A name or a budget is needed to update an account.' });
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
  .get((req, res) => {
    res.status(200).json(req.account);
  })
  .delete(async (req, res, next) => {
    const { id } = req.account;
    try {
      const deleted = await db('accounts')
        .where({ id })
        .del();

      if (deleted) {
        res.status(200).json(req.account);
      } else {
        throw new Error();
      }
    } catch (err) {
      next(err);
    }
  })
  .put(validateAccountUpdate, async (req, res, next) => {
    try {
      const { id } = req.account;
      const { name, budget } = req.body;
      const updatedAccount = {
        name: name || req.account.name,
        budget: budget || req.account.budget,
      };
      const updated = await db('accounts')
        .where({ id })
        .update(updatedAccount);

      if (updated) {
        res.status(200).json({
          ...updatedAccount,
          id,
        });
      } else {
        throw new Error();
      }
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
