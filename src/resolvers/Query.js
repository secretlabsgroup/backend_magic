const { forwardTo } = require('prisma-binding');
const axios = require('axios');

const Query = {
	users: forwardTo('db'),
	events: forwardTo('db'),
	async getEvents(parent, args, ctx, info) {
		const eventList = await axios.get(
			`https://api.eventful.com/json/events/search?keywords=${args.genre}&app_key=${
				process.env.API_KEY
			}`
		);
		const { event } = eventList.data.events;
		// console.log(event[0]);
		const reduced = event.map(event => ({
			title: event.title,
			location: event.olson_path,
			url: event.url || null,
			eventId: event.id,
			start: event.start_time,
			image: event.image,
			zipCode: event.postal_code
		}));
		// console.log(reduced);
		return reduced;
	}
};

module.exports = Query;
