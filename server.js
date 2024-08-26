const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const AIRTABLE_API_KEY = 'patKeCizXhNuzfMV9.17dfdd7073e389379b63a74412f1f83f5bcec2eba680c2fea213c0c6ff55d74f';
const AIRTABLE_BASE_ID = 'appTke8M57IxqdO2N';
const AIRTABLE_TABLE_NAME = 'Table 1'; // Adjust if different

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Fetch data from Airtable
async function fetchAgents() {
    let allRecords = [];
    let offset;

    try {
        do {
            const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?${offset ? `offset=${offset}` : ''}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
            });

            allRecords = allRecords.concat(response.data.records);
            offset = response.data.offset; // If there are more pages, Airtable provides an offset for the next request.
        } while (offset);

        console.log('All fetched records:', allRecords); // Log all records to verify what was fetched

        return allRecords.map(record => {
            return {
                name: record.fields.Name,
                email: record.fields.Email,
                location: record.fields.Location,
                photo: record.fields.Photo ? record.fields.Photo[0].url : '',
                aboutMe: record.fields['About Me'],
                sweetSpot: record.fields.SweetSpot,
                agency: record.fields.Agency
            };
        });
    } catch (error) {
        console.error('Error fetching data from Airtable:', error);
        return [];
    }
}

// Endpoint to search for agents by location
app.get('/search', async (req, res) => {
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

// New endpoint to fetch all agents for the carousel
app.get('/carousel-agents', async (req, res) => {
    const agents = await fetchAgents(); // Fetch all agents without filtering
    res.json(agents);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
