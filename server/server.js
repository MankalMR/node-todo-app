const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {User} = require('./model/user');
const {Todo} = require('./model/todo');

var app = express();

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

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};
