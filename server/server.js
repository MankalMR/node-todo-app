const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {User} = require('./model/user');
const {Todo} = require('./model/todo');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const errFn = (res) => {
    return (err) => {
        res.status(400).send(err);
    };
};

app.post('/todos', (req, res) => {
    const newTodo = new Todo(req.body);

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
            res.send({todos});
        },
        errFn(res)
    );
});

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then(
        (todo) => {
            if (!todo) {
                return res.status(404).send();
            }

            res.send({todo});
        },
        errFn(res)
    )
    .catch(errFn(res));
});

app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then(
        (todo) => {
            if (!todo) {
                return res.status(404).send();
            }

            res.send({todo});
        },
        errFn(res)
    )
    .catch(errFn(res));
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};
