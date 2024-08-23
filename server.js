const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB Connection URL
const url = 'mongodb://localhost:27017'; // Use your MongoDB connection string
const dbName = 'futo_security';
let db;

// Connect to MongoDB
MongoClient.connect(url, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database');
        db = client.db(dbName);
    })
    .catch(error => console.error(error));

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to FUTO Security Web Portal');
});

// Report an incident (POST request)
app.post('/report', (req, res) => {
    const incident = {
        description: req.body.description,
        location: req.body.location,
        timestamp: new Date(),
        status: 'pending'
    };

    const incidentsCollection = db.collection('incidents');

    incidentsCollection.insertOne(incident)
        .then(result => {
            res.status(201).send({ message: 'Incident reported successfully', incidentId: result.insertedId });
        })
        .catch(error => {
            console.error(error);
            res.status(500).send({ message: 'Error reporting incident' });
        });
});

// Get all reported incidents (GET request)
app.get('/incidents', (req, res) => {
    const incidentsCollection = db.collection('incidents');

    incidentsCollection.find().toArray()
        .then(results => {
            res.status(200).send(results);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send({ message: 'Error retrieving incidents' });
        });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
