const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// using Chance for testing with random names and emails
const Chance = require('chance');
const chance = Chance();

// config chai to use express app
const { app } = require('../server');


// TODO: convert tests to use promise with catch
// NOTE: API endpoints still need to be built for put, del, post


// get test using done and end

// test('testing GET', done => {
//     chai.request(app)
//         .get('/get-test')
//         .end((err, res) => {
//             expect(res).to.have.status(200);
//             expect(res).to.be.json;
//             expect(res.body).to.be.an('array');
//             expect(res.body[0]).to.include.any.keys('_id');
//             done();
//         });
// });



// get test converted to use promise with catch
test('testing GET', () => {
    chai.request(app)
        .get('/get-test')
        .then(res => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.include.any.keys('_id');
        })
        .catch(err => {
            throw err;
        })
});

test('testing POST', done => {
    chai.request(app)
        .post('/post-test')
        .send({
            email: chance.email(),
            username: chance.name(),
            password: "Password321",
            child: chance.name(),
            allergen: chance.animal(),
            reaction: "safe",
            details: "some info about the allergen"
        })
        .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            done();
        });
});

test('testing PUT', done => {
    let email = chance.email();
    let data = { email };
    let id = "5a7261f77b5ae921cc913e61";
    chai.request(app)
        .put('/put-test/' + id)
        .send(data)
        .end((err, res) => {
            expect(res).to.have.status(200);
            done();
        });
});

test('testing DELETE', done => {
    chai.request(app)
        .post('/post-test')
        .send({
            email: chance.email(),
            username: chance.name(),
            password: "testPasswordForDeleteAPI"
        })
        .end((err, res) => {
            console.log("deleting response from post: ", res.body);
            let id = res.body._id;
            chai.request(app)
                .delete('/delete-test/' + id)
                .end((err, res) => {
                    expect(res).to.have.status(204);
                });
            done();
        })
});