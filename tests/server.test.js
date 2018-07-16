const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { app } = require('../server/server');
const { Todo } = require('../server/model/todo');
const { User } = require('../server/model/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
  {
    _id: userOneId,
    email: 'test1@test.com',
    password: 'password1',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userOneId.toHexString(), access: 'auth' }, 'hash_secret').toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'test2@test.com',
    password: 'password2',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userTwoId.toHexString(), access: 'auth' }, 'hash_secret').toString()
    }]
  },
  {
    email: 'test3@test.com',
    password: 'password3'
  }
];

const docs = [
  {
    _id: new ObjectID(),
    text: 'my todo 1',
    _user: userOneId
  },
  {
    _id: new ObjectID(),
    text: 'my todo 2',
    _user: userTwoId
  }
];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  })
    .then(() => {
      done();
    });
};

beforeEach(populateUsers);

describe('/todos API POST suite', () => {
  let postRequest;

  beforeEach((done) => {
    Todo.remove({}).then(() => { done(); });
  });

  describe('when invoked with right params', () => {
    beforeEach(() => {
      postRequest = request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send(docs[0]);
    });

    it('should return the status code 200', (done) => {
      postRequest.expect(200, done);
    });

    it('should successfully add the todo', (done) => {
      postRequest
        .expect((res) => {
          expect(res.body).toInclude({ text: docs[0].text });
        })
        .end(done);
    });

    it('should add one todo to the database', (done) => {
      postRequest
        .end((err) => {
          if (err) {
            return done(err);
          }

          Todo.find().then((todos) => {
            expect(todos.length).toBe(1);
            done();
          })
            .catch((e) => { done(e); });
        });
    });

    it('should create a new todo in database', (done) => {
      postRequest
        .end((err) => {
          if (err) {
            return done(err);
          }

          Todo.find().then((todos) => {
            expect(todos[0].text).toBe(docs[0].text);
            done();
          })
            .catch((e) => { done(e); });
        });
    });
  });

  describe('when invoked with incorrect params or incorrect API', () => {
    it('should return the status code 404', (done) => {
      postRequest = request(app)
        .post('/todos_incorrect')
        .send(docs[0]);
      postRequest.expect(404, done);
    });

    it('when ivoked without x-auth header, should return the status code 401', (done) => {
      postRequest = request(app)
        .post('/todos')
        .send({});
      postRequest.expect(401, done);
    });

    it('should NOT create a todo in the database', (done) => {
      postRequest = request(app)
        .post('/todos')
        .send({})
        .end((err) => {
          if (err) {
            return done(err);
          }

          Todo.find().then((todos) => {
            expect(todos.length).toBe(0);
            done();
          })
            .catch((e) => { done(e); });
        });
    });
  });
});

describe('/todos API GET suite', () => {
  let getRequest;
  beforeEach((done) => {
    Todo.remove({}).then(() => { done(); });
  });

  beforeEach((done) => {
    Todo.insertMany(docs, done);
  });

  describe('when invoked with right params', () => {
    beforeEach(() => {
      getRequest = request(app)
        .get('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send();
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

    it('should fetch 1 todo', (done) => {
      getRequest
        .expect((res) => {
          expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    });
  });

  describe('when invoked without x-auth header', () => {
    it('should return the status code 401', (done) => {
      getRequest = request(app)
        .get('/todos')
        .send();

      getRequest.expect(401, done);
    });
  });
});

describe('/todos/:id API GET suite', () => {
  let getRequest;

  beforeEach((done) => {
    Todo.remove({}).then(() => { done(); });
  });

  beforeEach((done) => {
    Todo.insertMany(docs, done);
  });

  describe('when invoked with right params', () => {
    beforeEach(() => {
      getRequest = request(app)
        .get(`/todos/${docs[0]._id.toHexString()}`)
        .send();
    });

    it('should return the status code 200', (done) => {
      getRequest.expect(200, done);
    });

    it('should successfully fetch the todo by id', (done) => {
      getRequest
        .expect((res) => {
          expect(res.body).toIncludeKey('todo');
        })
        .end(done);
    });

    it('should successfully fetch the right todo text', (done) => {
      getRequest
        .expect((res) => {
          expect(res.body.todo.text).toBe(docs[0].text);
        })
        .end(done);
    });
  });

  describe('when invoked with incorrect id', () => {
    it('should return status code 404', (done) => {
      getRequest = request(app)
        .get('/todos/123')
        .send()
        .end(done)
        .expect(404);
    });
  });
});

describe('/todos/:id API DELETE suite', () => {
  let deleteRequest;

  describe('when invoked with right params', () => {
    beforeEach((done) => {
      Todo.remove({}).then(() => { done(); });
    });

    beforeEach((done) => {
      Todo.insertMany(docs, done);
    });

    beforeEach(() => {
      deleteRequest = request(app)
        .delete(`/todos/${docs[0]._id.toHexString()}`)
        .send();
    });

    it('should return the status code 200', (done) => {
      deleteRequest.expect(200, done);
    });

    it('should successfully delete the todo by id', (done) => {
      deleteRequest
        .expect((res) => {
          expect(res.body.todo).toContain(docs[0]);
        })
        .end(done);
    });
  });

  describe('when invoked with incorrect id', () => {
    it('should return status code 404', (done) => {
      deleteRequest = request(app)
        .delete('/todos/123')
        .send()
        .end(done)
        .expect(404);
    });
  });
});

describe('/users/me API GET suite', () => {
  let usersMeApi;

  describe('if user authenticated', () => {
    beforeEach(() => {
      usersMeApi = request(app).get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .send();
    });

    it('should return 200', (done) => {
      usersMeApi.expect(200)
        .end(done);
    });

    it('should return correct _id', (done) => {
      usersMeApi
        .expect((res) => {
          expect(res.body._id).toBe(userOneId.toHexString());
        })
        .end(done);
    });

    it('should return correct email', (done) => {
      usersMeApi
        .expect((res) => {
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });
  });

  describe('if user NOT authenticated', () => {
    beforeEach(() => {
      usersMeApi = request(app).get('/users/me')
        .send();
    });

    it('should return status 401', (done) => {
      usersMeApi
        .expect(401, done);
    });

    it('should return error body', (done) => {
      usersMeApi
        .expect((res) => {
          expect(res.body).toContain({ name: 'JsonWebTokenError' });
        })
        .end(done);
    });
  });
});


describe('/users API POST suite', () => {
  let usersMeApi;

  describe('if valid data is passed', () => {
    beforeEach(() => {
      usersMeApi = request(app).post('/users')
        .send(users[2]);
    });

    it('should return 200', (done) => {
      usersMeApi.expect(200)
        .end(done);
    });

    it('should return the _id', (done) => {
      usersMeApi
        .expect((res) => {
          expect(res.body._id).toExist();
        })
        .end(done);
    });

    it('should return correct email', (done) => {
      usersMeApi
        .expect((res) => {
          expect(res.body.email).toBe(users[2].email);
        })
        .end(done);
    });
  });

  describe('if invalid data is passed', () => {
    beforeEach(() => {
      usersMeApi = request(app).post('/users')
        .send({ email: 'invalid_email', password: 'some_password' });
    });

    it('should return status 400', (done) => {
      usersMeApi
        .expect(400, done);
    });

    it('should return error body', (done) => {
      usersMeApi
        .expect((res) => {
          expect(res.body).toContain({ _message: 'User validation failed' });
        })
        .end(done);
    });
  });
});

describe('/users/login API POST suite', () => {
  let usersMeApi;

  describe('login when valid credentials are passed', () => {
    beforeEach(() => {
      const { email, password } = users[0];
      usersMeApi = request(app).post('/users/login')
        .send({ email, password });
    });

    it('should return 200', (done) => {
      usersMeApi.expect(200)
        .end(done);
    });

    it('should have return with x-auth header', (done) => {
      usersMeApi
        .expect((res) => {
          expect(res.headers['x-auth']).toExist();
        })
        .end(done);
    });
  });

  describe('login fails when invalid credentials are passed', () => {
    beforeEach(() => {
      usersMeApi = request(app).post('/users/login')
        .send({ email: 'invalid_email', password: 'some_password' });
    });

    it('should return status 400', (done) => {
      usersMeApi
        .expect(400, done);
    });

    it('should return error body', (done) => {
      usersMeApi
        .expect((res) => {
          expect(res.body).toContainKey('error');
        })
        .end(done);
    });
  });
});

describe('/users/me/token API DELETE suite', () => {
  describe('when token passed', () => {
    it('should return 200', (done) => {
      request(app).delete('/users/me/token')
        .set('x-auth', users[1].tokens[0].token)
        .send()
        .expect(200)
        .end(done);
    });

    it('when token does NOT exist, should return 401', (done) => {
      request(app).delete('/users/me/token')
        .set('x-auth', 'abc')
        .send()
        .expect(401)
        .end(done);
    });
  });
});
