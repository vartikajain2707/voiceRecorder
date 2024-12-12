import React, { useState, useRef } from 'react';
import axios from 'axios';
import './recorder.css'
const Recorder = () => {
    const [recording, setRecording] = useState(false);
    const [chunks, setChunks] = useState([]);
    const [message, setMessage] = useState('');
    const recorderRef = useRef(null);

    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // Extract only the Base64 content
            reader.onerror = reject;
            reader.readAsDataURL(blob); // Read the blob as a Data URL
        });
    };
    const sendChunk = async (chunk, sessionId, chunkName) => {
        // const formData = new FormData();
        // formData.append('audio', chunk);
        // const formData = new FormData();
        const base64Chunk = await convertBlobToBase64(chunk);
        // formData.append('chunk', chunk); // The chunk data (audio in base64 format)
        // formData.append('chunkName', chunkName);
        // formData.append('sessionId', sessionId);
        // formData.append('action', 'addChunk');
        // console.log({formData:typeof(formData), chunk})

        const payload = {
            action: 'addChunk',
            payload: {
                chunkBase64: base64Chunk,
                chunkName,
                sessionId,
            },
        };
        try {
            const response = await axios.post('https://2mszyzrxjbhcpubodym5pwmmpm0ikldx.lambda-url.us-east-1.on.aws/audio/add', payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }); // Replace with your backend endpoint
            console.log('Chunk uploaded successfully:', response.data);
        }  catch (error) {
            console.error('Error sending chunk:', error);
        }
    };
    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                console.log({stream})
                const recorder = new MediaRecorder(stream);
                console.log({recorder})
                recorderRef.current = recorder;

                recorder.ondataavailable = (e) => {
                    const chunk = e.data;
                    // const chunk=new Blob(['hello world'], {type:'text/plain'})
                    const chunkName = `chunk_${Date.now()}`; // Create a unique chunk name
                    const sessionId = 'example-session-id';
                    console.log({chunk})
                    setChunks(prev => [...prev, chunk]); // Save the chunk locally
                    sendChunk(chunk,sessionId, chunkName); // Send the chunk to the backend
                };

                recorder.start(10000); // Record in 10-second chunks
                setRecording(true);

                recorder.onstop = () => {
                    setRecording(false);
                    stream.getTracks().forEach(track => track.stop());
                };
            })
            .catch(err => console.error('Error accessing microphone:', err));
    };

    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stop();
        }
        setRecording(false);
    };


    const handleMerge = async () => {
        try {
            const response = await axios.post('/audio/merge'); // Replace with your backend endpoint
            setMessage('Audio merged successfully: ' + response.data.url);
        } catch (err) {
            console.error('Error merging audio:', err);
        }
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center', padding: '2rem' }}>Voice Recorder</h1>
            <div style={{ textAlign: 'center', padding: '2rem', display:'flex', justifyContent:'space-around' }}>
                <button className={`start ${recording ? 'recording' : ''}`} onClick={startRecording} disabled={recording}>Start Recording</button>
                <button className={`stop`} onClick={stopRecording} disabled={!recording}>Stop Recording</button>
                <button onClick={handleMerge} disabled={chunks.length === 0}>Merge Audio</button>
                <p>{message}</p>
            </div>
        </div>

    );
};

export default Recorder;

