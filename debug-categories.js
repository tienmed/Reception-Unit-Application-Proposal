const axios = require('axios');

const TOKEN = '10Ks6xbTsXf9MWMybY6uIm3WcGYMzqfBfop2cD9ncsRGUsI67rlox7orDLyBz7Pj';
const API_URL = 'https://phongkhamdaihocypnt.edu.vn/nhansu/api/clinics';

async function checkCategories() {
    try {
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${TOKEN}` },
            params: { per_page: 100 }
        });

        const clinics = response.data.data;
        console.log(`Fetched ${clinics.length} clinics.`);

        const categories = {};
        clinics.forEach(c => {
            if (c.category) {
                categories[c.category.id] = c.category.name;
            } else {
                categories['null'] = 'No Category';
            }
        });

        console.log('unique_categories:', categories);

        // Also sample a schedule to see if we can filter by it
        console.log('\nSample Clinic:', JSON.stringify(clinics[0], null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error('Status:', error.response.status);
    }
}

checkCategories();
