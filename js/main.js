document.addEventListener('DOMContentLoaded', () => {
    // Button to submit incident report
    const reportButton = document.getElementById('reportButton');
    reportButton.addEventListener('click', reportIncident);

    // Button to start live streaming
    const liveStreamButton = document.getElementById('liveStreamButton');
    liveStreamButton.addEventListener('click', startLiveStream);

    // Function to report an incident
    function reportIncident() {
        const description = document.getElementById('description').value;
        const location = document.getElementById('location').value;

        if (!description || !location) {
            alert('Please provide both description and location.');
            return;
        }

        fetch('/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description, location })
        })
        .then(response => response.json())
        .then(data => {
            alert('Incident reported successfully. Incident ID: ' + data.incidentId);
            document.getElementById('description').value = '';
            document.getElementById('location').value = '';
        })
        .catch(error => {
            console.error('Error reporting incident:', error);
            alert('There was an error reporting the incident.');
        });
    }

    // Function to start live streaming
    function startLiveStream() {
        
        // Assuming that you have set up the live streaming on the backend
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            const videoElement = document.getElementById('liveStreamVideo');
            videoElement.srcObject = stream;
            videoElement.play();

            // Here, you would implement the logic to stream the video to the server
            const liveStreamData = {
                stream: stream, // This is a placeholder, actual streaming implementation is more complex
                description: document.getElementById('description').value,
                location: document.getElementById('location').value
            };

            fetch('/livestream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(liveStreamData)
            })
            .then(response => response.json())
            .then(data => {
                alert('Live stream started successfully.');
            })
            .catch(error => {
                console.error('Error starting live stream:', error);
                alert('There was an error starting the live stream.');
            });
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
            alert('Unable to access camera/microphone.');
        });
    }
});
