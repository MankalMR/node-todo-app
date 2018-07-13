require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { User } = require('./model/user');
const { Todo } = require('./model/todo');
const { authenticate } = require('./middleware/authenticate');

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

const prepareUserDataBeforeDBUpdate = (data) => {
  const newData = _.pick(data, ['email', 'password']);

  return newData;
};

const handleIDValidation = (id, res) => {
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
};

app.post('/todos', (req, res) => {
  const body = prepareTodoDataBeforeDBUpdate(req.body);
  const newTodo = new Todo(body);

  newTodo.save().then((doc) => {
    res.send(doc);
  })
    .catch(errFn(res));
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({ todos });
  })
    .catch(errFn(res));
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;

  handleIDValidation(id, res);

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
  })
    .catch(errFn(res));
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;

  handleIDValidation(id, res);

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
  })
    .catch(errFn(res));
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;

  handleIDValidation(id, res);

  const body = prepareTodoDataBeforeDBUpdate(req.body);

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
  })
    .catch(errFn(res));
});

app.post('/users', (req, res) => {
  const body = prepareUserDataBeforeDBUpdate(req.body);
  const newUser = new User(body);

  newUser.save().then(() => {
    return newUser.generateAuthToken();
  })
    .then((token) => {
      res.header('x-auth', token).send(newUser);
    })
    .catch(errFn(res));
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) => {
  const authToken = req.headers['x-auth'];
  req.user.removeToken(authToken).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.post('/users/login', (req, res) => {
  const { email, password } = req.body;

  User.findByCredentials(email, password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send();
    });
  }).catch((err) => {
    const error = err.toString();
    res.status(400).send({ error });
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
