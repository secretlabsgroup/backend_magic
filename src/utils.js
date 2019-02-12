module.exports = {
	transformEvents: function(events) {
		return events.map(event => ({
			id: event.id,
			title: event.title,
			details: {
				url: event.url || null,
				description: event.description || `no description bc we're annoying af`,
				start_time: event.start_time,
				performer: event.performers.performer.name,
				bio: event.performers.performer.short_bio
			},
			location: {
				region: event.olson_path,
				venue: event.venue_name,
				address: event.venue_address,
				zipCode: event.postal_code
			},
			image_url: event.image ? event.image.url : 'default_image_url'
		}));
	}
};
