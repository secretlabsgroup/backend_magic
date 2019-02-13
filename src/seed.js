require('dotenv').config({ path: '.env' });
const db = require('./db');
const seedUsers = require('./seedUsers');

const seedContinents = async () => {
	// adding continents to the data
	Promise.all(
		continentData.map(async continentItem => {
			const { imageURL, continent } = continentItem;
			const response = await db.createContinent({
				data: {
					name: continent || 'default name',
					imageURL
				}
			});
			return response;
		})
	);
};

seedContinents();
