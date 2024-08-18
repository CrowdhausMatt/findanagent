const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const AIRTABLE_API_KEY = 'patQN8cbYJKHrvtL1.0f833101180f478add1604618e56312c646ed268883ef9d9ddd48f3dfa5b1c32'; // Your new Airtable API token
const AIRTABLE_BASE_ID = 'appTke8M57IxqdO2N'; // Your new Airtable Base ID
const AIRTABLE_TABLE_NAME = 'Estate Agent Directory'; // Adjust if different

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Fetch data from Airtable
async function fetchAgents() {
    try {
        const response = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });
        console.log(response.data.records); // Log the fetched data records to see field names
        return response.data.records.map(record => {
            console.log(record.fields); // Log the fields of each record to see the exact field names
            return {
                name: record.fields.Name,
                email: record.fields.Email,
                location: record.fields.Location,
                photo: record.fields.Photo ? record.fields.Photo[0].url : '',
                aboutMe: record.fields['About Me'], // Ensure this matches exactly with Airtable field name
                sweetSpot: record.fields.SweetSpot,
                agency: record.fields.Agency // Ensure this matches exactly with Airtable field name
            };
        });
    } catch (error) {
        console.error('Error fetching data from Airtable:', error);
        return [];
    }
}

// Endpoint to search for agents by location
app.get('/search', async (req, res) => {
    console.log('Received search request');
    const { location } = req.query;
    const agents = await fetchAgents();
    const results = agents.filter(agent => {
        if (agent.location) {
            const locations = agent.location.split(',').map(loc => loc.trim().toLowerCase());
            return locations.includes(location.toLowerCase());
        }
        return false;
    });
    res.json(results);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
