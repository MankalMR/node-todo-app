const expect = require('expect');
const request = require('supertest');

const {app} = require('../server/server');
const {Todo} = require('../server/model/todo');

const text = 'Test todo app';

describe('/todos API POST suite', () => {
    let postRequest;

    beforeEach((done) => {
        Todo.remove({}).then(() => done());
    });

    describe('when invoked with right params', () => {
        beforeEach(() => {
            postRequest = request(app)
                .post('/todos')
                .send({text});
        });

        it('should return the status code 200', (done) => {
            postRequest.expect(200, done);
        });

        it('should successfully add the todo', (done) => {
            postRequest
                .expect((res) => {
                    expect(res.body).toInclude({text});
                })
                .end(done);
        });

        it('should add one todo to the database', (done) => {
            postRequest
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    Todo.find().then((todos) => {
                        expect(todos.length).toBe(1);
                        done();
                    })
                    .catch((e) => done(e));
                });
        });

        it('should create a new todo in database', (done) => {
            postRequest
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    Todo.find().then((todos) => {
                        expect(todos[0].text).toBe(text);
                        done();
                    })
                    .catch((e) => done(e));
                });
        });
    });

    describe('when invoked with incorrect params or incorrect API', () => {

        it('should return the status code 404', (done) => {
            postRequest = request(app)
                .post('/todos_incorrect')
                .send({text});
            postRequest.expect(404, done);
        });

        it('should return the status code 400', (done) => {
            postRequest = request(app)
                .post('/todos')
                .send({});
            postRequest.expect(400, done);
        });

        it('should NOT create a todo in the database', (done) => {
            postRequest = request(app)
                .post('/todos')
                .send({})
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    Todo.find().then((todos) => {
                        expect(todos.length).toBe(0);
                        done();
                    })
                    .catch((e) => done(e));
                });
        });
    });
});

describe('/todos API GET suite', () => {
    let getRequest;

    describe('when invoked with right params', () => {
        beforeEach(() => {
            postRequest = request(app)
                .post('/todos')
                .send({text});

            getRequest = request(app)
                .get('/todos')
                .send();
        });

        afterEach((done) => {
            Todo.remove({}).then(() => done());
        });

        it('should return the status code 200', (done) => {
            getRequest.expect(200, done);
        });

        it('should successfully fetch the todos', (done) => {
            getRequest
                .expect((res) => {
                    expect(res.body).toIncludeKey('todos');
                })
                .end(done);
        });
    });

    describe('when invoked with incorrect params or incorrect API', () => {

        it('should return the status code 404', (done) => {
            getRequest = request(app)
                .get('/todos_incorrect')
                .send({text});

            getRequest.expect(404, done);
        });
    });
});
