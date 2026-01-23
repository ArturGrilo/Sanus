const cors = require("cors");

const corsMiddleware = cors({origin: true});

module.exports = {corsMiddleware};