const dotenv = require('dotenv').config();
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables");
}
if (!process.env.GOOGLE_CLIENT_SECRET_ID) {
    throw new Error("GOOGLE_CLIENT_SECRET_ID is not defined in environment variables");
}
if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN is not defined in environment variables");
}
if (!process.env.GOOGLE_USERS) {
    throw new Error("GOOGLE_USERS is not defined in environment variables");
}
const app = require('./src/app');

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});