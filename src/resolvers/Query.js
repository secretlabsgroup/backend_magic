const { forwardTo } = require('prisma-binding');

const Query = {
	users: forwardTo('db'),
	events: forwardTo('db')
};

module.exports = Query;
