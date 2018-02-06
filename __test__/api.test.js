const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// using Chance for testing with random names and emails
const Chance = require('chance');
const chance = Chance();

// config chai to use express app
const { app } = require('../server');

// import start and stop server functions
const { startServer, stopServer } = require('../server');

// import test DB and port number
const { PORT, TEST_DATABASE_URL } = require('../config');

// import model
const { Parent } = require('../models/Parent');

// seed db
function seedDB() {
    console.info('seeding db...');
    const seedData = [];

    seedData.push({
        email: chance.email(),
        username: chance.name(),
        password: "Password321",
        child: chance.name(),
        allergen: chance.animal(),
        reaction: "safe",
        details: "some info about the allergen"
    });

    return Parent.insertMany(seedData);
}

// jest test prep
beforeAll(() => {
    return startServer(TEST_DATABASE_URL);
});

afterAll(() => {
    return stopServer();
});

// tests
test('testing GET', () => {

    seedDB();

    chai.request(app)
        .get('/get-test')
        .then(res => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.include.any.keys('_id');
        })
        .catch(error => {
            throw error;
        });
});

test('testing POST', () => {

    let newUser = {
        email: chance.email(),
        username: chance.name(),
        password: "Password321",
        child: chance.name(),
        allergen: chance.animal(),
        reaction: "safe",
        details: "some info about the allergen"
    };

    chai.request(app)
        .post('/post-test')
        .send(newUser)
        .then(res => {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
        })
        .catch(error => {
            throw error;
        });
});

test('testing PUT', () => {
    let email = chance.email();
    let data = { email };
    let id = "5a7261f77b5ae921cc913e61";
    chai.request(app)
        .put('/put-test/' + id)
        .send(data)
        .then(res => {
            expect(res).to.have.status(200);
        })
        .catch(error => {
            throw error;
        });
});

test('testing DELETE', () => {
    chai.request(app)
        .post('/post-test')
        .send({
            email: chance.email(),
            username: chance.name(),
            password: "testPasswordForDeleteAPI"
        })
        .then(res => {
            console.log("deleting response from post: ", res.body);
            let id = res.body._id;
            chai.request(app)
                .delete('/delete-test/' + id)
                .end((err, res) => {
                    expect(res).to.have.status(204);
                });
        })
        .catch(error => {
            throw error;
        });
});