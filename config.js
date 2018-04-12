exports.PROD_DATABASE_MLAB_URL =
    process.env.PROD_DATABASE_MLAB_URL || 'mongodb://localhost/peach-of-mind-production';
exports.TEST_DATABASE_LOCALHOST_URL =
    process.env.TEST_DATABASE_LOCALHOST_URL || 'mongodb://localhost/peach-of-mind-test';
exports.TEST_DATABASE_MLAB_URL =
    process.env.TEST_DATABASE_MLAB_URL || 'mongodb://localhost/peach-of-mind-test';
// !Important! process.env.PORT is needed for deploying to Heroku
// the build will crash, on Heroku side, if the port is hard coded
// heroku configures it with a dynamic port at build time
exports.PORT = process.env.PORT || 8080;
exports.SESSION_SECRET = process.env.SESSION_SECRET || 'random';