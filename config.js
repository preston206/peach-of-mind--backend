exports.DATABASE_URL =
    'mongodb://localhost/peach-of-mind' || process.env.DATABASE_URL;
exports.TEST_DATABASE_URL =
    'mongodb://localhost/peach-of-mind-test' || process.env.DATABASE_URL;
exports.PORT = 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'idontknow';
exports.JWT_EXPIRY = '7d';

// exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
// exports.PORT = process.env.PORT || 8080;