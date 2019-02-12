const cookieParser = require('cookie-parser');

require('dotenv').config({ path: '.env' });
const createServer = require('./createServer');

const server = createServer();
server.express.use(cookieParser());

server.start(deets => {
	console.log(`Server is now running on port http://localhost:${deets.port}`);
});
