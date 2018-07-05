require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { User } = require('./model/user');
const { Todo } = require('./model/todo');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

const errFn = (res) => {
  return (err) => {
    res.status(400).send(err);
  };
};

const prepareTodoDataBeforeDBUpdate = (data) => {
  const newData = _.pick(data, ['text', 'completed']);

  if (_.isBoolean(newData.completed) && newData.completed) {
    newData.completedAt = (new Date()).toDateString();
  } else {
    newData.completed = false;
    newData.completedAt = null;
  }

  return newData;
};

// const handleIDValidation = (id, res) => {
//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send();
//   }
//   return true;
// };

app.post('/todos', (req, res) => {
  const body = prepareTodoDataBeforeDBUpdate(req.body);
  const newTodo = new Todo(body);

  newTodo.save().then(
    (doc) => {
      res.send(doc);
    },
    errFn(res)
  );
});

app.get('/todos', (req, res) => {
  Todo.find().then(
    (todos) => {
      res.send({ todos });
    },
    errFn(res)
  );
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then(
    (todo) => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    },
    errFn(res)
  )
    .catch(errFn(res));
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then(
    (todo) => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    },
    errFn(res)
  )
    .catch(errFn(res));
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  const body = prepareTodoDataBeforeDBUpdate(req.body);

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(
    (todo) => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    },
    errFn(res)
  )
    .catch(errFn(res));
});

app.post('/users', (req, res) => {
  const newUser = new User(req.body);

  newUser.save().then(
    (doc) => {
      res.send(doc);
    },
    errFn(res)
  );
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
