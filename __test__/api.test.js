const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// using Chance for testing with random names and emails
const Chance = require('chance');
const chance = Chance();

// config chai to use express app
const { app } = require('../server');

test('testing GET', done => {
    chai.request(app)
        .get('/')
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            done();
        });
});