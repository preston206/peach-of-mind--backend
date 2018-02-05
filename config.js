exports.DATABASE_URL =
    process.env.DATABASE_URL || 'mongodb://localhost/peach-of-mind';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'idontknow';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';