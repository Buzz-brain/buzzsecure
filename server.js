const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path')
const app = express();
const port = process.env.PORT || 4000;


// USE SERVER
app.use(express.static(path.join(__dirname, "public")));
// app.use(bodyParser.urlencoded({ extended:false }));
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.json());

// SET ENGINE
app.set("view engine", "ejs")


// MongoDB Connection URL
const url = 'mongodb+srv://chinomsochristian03:ahYZxLh5loYrfgss@cluster0.dmkcl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Use your MongoDB connection string
const dbName = 'buzzsecure';
let db;

// Connect to MongoDB
MongoClient.connect(url)
    .then(client => {
        console.log('Connected to Database');
        db = client.db(dbName);
    })
    .catch(error => console.error(error));

// Basic route
app.get('/', (req, res) => {
    res.render("index")
});
app.get('/report', (req, res) => {
    res.render("report")
});
app.get('/admin-dashboard', (req, res) => {
    res.render("admin-dashboard")
});
app.get('/personnel-dashboard', (req, res) => {
    res.render("personnel-dashboard")
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


// WebRTC signaling via HTTP POST request
app.post('/signal', (req, res) => {
    // Handle WebRTC signaling data here
    const data = req.body;
    // console.log('Received signaling data:', data);

    // Forward the signaling data to all WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

    res.sendStatus(200); // Send OK status
});



const WebSocket = require('ws'); // Correctly import WebSocket
const wss = new WebSocket.Server({ port: 4002 });

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // console.log('Received message:', data);

            if (data.offer || data.answer || data.candidate) {
                // Broadcast the signaling data to all clients
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message); // Ensure data is sent as a JSON string
                        // console.log('Broadcasting data:', data);
                    }
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
