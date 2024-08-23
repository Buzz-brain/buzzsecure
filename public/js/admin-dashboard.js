document.addEventListener('DOMContentLoaded', () => {
    const adminLiveStream = document.getElementById('adminLiveStream');
    let peerConnection;

    // Set up WebSocket connection for WebRTC signaling
    const ws = new WebSocket('ws://localhost:4002');

    ws.onopen = () => {
        console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.offer) {
            handleOffer(data.offer);
        } else if (data.answer) {
            handleAnswer(data.answer);
        } else if (data.candidate) {
            handleCandidate(data.candidate);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    function handleOffer(offer) {
        peerConnection = new RTCPeerConnection();

        peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                adminLiveStream.srcObject = event.streams[0];
                console.log('Stream received: ', event.streams[0]);
            } else {
                console.error('No streams found in track event');
            }
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(JSON.stringify({ candidate: event.candidate }));
            }
        };

        peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
            .then(() => peerConnection.createAnswer())
            .then(answer => peerConnection.setLocalDescription(answer))
            .then(() => {
                ws.send(JSON.stringify({ answer: peerConnection.localDescription }));
            })
            .catch(error => {
                console.error('Error handling offer:', error);
            });
    }

    function handleAnswer(answer) {
        if (!peerConnection) {
            console.error('PeerConnection is not initialized.');
            return;
        }

        peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
            .catch(error => {
                console.error('Error handling answer:', error);
            });
    }

    function handleCandidate(candidate) {
        if (!peerConnection) {
            console.error('PeerConnection is not initialized.');
            return;
        }

        peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            .catch(error => {
                console.error('Error handling candidate:', error);
            });
    }
});
