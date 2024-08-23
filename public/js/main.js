document.addEventListener('DOMContentLoaded', () => {
    const reportButton = document.getElementById('reportButton');
    reportButton.addEventListener('click', reportIncident);

    const liveStreamButton = document.getElementById('liveStreamBtn');
    liveStreamButton.addEventListener('click', startLiveStream);

    const videoElement = document.getElementById('liveStreamVideo');
    let localStream;
    let peerConnection;

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
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';

            peerConnection = new RTCPeerConnection();
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    fetch('http://localhost:4000/signal', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ candidate: event.candidate })
                    });
                }
            };

            peerConnection.ontrack = event => {
                if (event.streams && event.streams[0]) {
                    videoElement.srcObject = event.streams[0];
                }
            };

            peerConnection.createOffer()
                .then(offer => peerConnection.setLocalDescription(offer))
                .then(() => {
                    fetch('http://localhost:4000/signal', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ offer: peerConnection.localDescription })
                    });
                })
                .catch(error => {
                    console.error('Error creating or sending offer:', error);
                });
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
            alert('Unable to access camera/microphone.');
        });
    }
});
