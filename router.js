const express = require('express');

const actionDB = require('./data/helpers/actionModel');
const projectDB = require('./data/helpers/projectModel');

const router = express.Router();

router.get('/', getData, async (req, res,) => {
  res.status(200).json(req.body);
});

router.get('/:id', getData, async (req, res) => {
  res.status(200).json(req.body);
});

router.get('/:id/actions', getData, async (req, res) => {
  res.status(200).json(req.body.actions)
});

router.get('/:id/actions/:actId', getData, async (req, res) => {
  res.status(200).json(req.body)
})

router.post('/', validateFields, async (req, res) => {
  const user = await projectDB.insert(req.body);
  res.status(200).json(user);
});

router.post('/:id/actions', validateFields, async (req, res) => {
  const action = await actionDB.insert(req.body)
  res.status(200).json(action);
});

router.put('/:id', validateFields, async (req, res) => {
  const { id } = req.params;
  const project = await projectDB.update(id, req.body);
  res.status(200).json(project);
});

router.put('/:id/actions/:actId', validateFields, async (req, res) => {
  const { actId } = req.params;
  const action = await actionDB.update(actId, req.body);
  res.status(200).json(action);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const data = await projectDB.remove(id);
  res.status(200).json(data);
})

router.delete('/:id/actions/:actId', async (req, res) => {
  const { actId } = req.params;
  const data = await actionDB.remove(actId);
  res.status(200).json(data);
})

// middleware
async function getData(req, res, next) {
  try {
    const { id, actId } = req.params;
    const data = actId ? await projectDB.getProjectActions(id) : id ? await projectDB.get(id) : await projectDB.get();
    if(actId) {
      req.body = data.find(action => action.id === parseInt(actId));
      next();
    } else if(data) {
      req.body = data;
      next();
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'not found'
    })
  }
};

async function validateFields(req, res, next) {
  const { id } = req.params;
  const get_id = await projectDB.get(id);
  const { name, description, notes } = req.body;
  if(get_id && typeof description === 'string' && description.length && typeof notes === 'string' && notes.length) {
    req.body = {
      project_id: get_id.id,
      description: description,
      notes: notes
    }
    next();
  } else if(typeof name === 'string' && name.length && typeof description === 'string' && description.length) {
    next();
  } else {
    res.status(500).json({
      message: 'not found'
    })
  }
};

module.exports = router;