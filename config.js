exports.DATABASE_URL =
    process.env.DATABASE_URL || 'mongodb://localhost/peach-of-mind';
exports.TEST_DATABASE_URL =
    process.env.TEST_DATABASE_URL || 'mongodb://localhost/peach-of-mind-test';
// !Important! process.env.PORT is needed for deploying to Heroku
// the build will crash if the port is hard coded
// heroku configures it with a dynamic port at build time
exports.PORT = process.env.PORT || 8080;
// exports.JWT_SECRET = process.env.JWT_SECRET || 'idontknow';
// exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.SESSION_SECRET = process.env.SESSION_SECRET || 'random';