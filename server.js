const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

const SECRET_PIN = "1234"; 
const BLYNK_TOKEN = "paA92qkJbuRNlsEXmawF9naBXlrNACnm"; 
const BLYNK_URL = "https://blr1.blynk.cloud/external/api";

app.post('/api/login', (req, res) => {
    if (req.body.pin === SECRET_PIN) res.json({ success: true });
    else res.status(401).json({ success: false });
});

app.get('/api/telemetry', async (req, res) => {
    if (req.headers['x-auth-pin'] !== SECRET_PIN) return res.status(401).send("Error");
    try {
        const [v0, v1, v2, v3, v4, v5, v6, hw] = await Promise.all([
            axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v0`),
            axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v1`),
            axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v2`),
            axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v3`),
            axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v4`),
            axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v5`),
            axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v6`),
            axios.get(`${BLYNK_URL}/isHardwareConnected?token=${BLYNK_TOKEN}`)
        ]);
        res.json({ moisture: v0.data, temp: v1.data, hum: v2.data, sysMsg: v6.data, pumpState: v5.data, isOnline: hw.data });
    } catch(e) { res.status(500).send("Error"); }
});

app.post('/api/control', async (req, res) => {
    if (req.headers['x-auth-pin'] !== SECRET_PIN) return res.status(401).send("Error");
    await axios.get(`${BLYNK_URL}/update?token=${BLYNK_TOKEN}&${req.body.pin}=${req.body.value}`);
    res.json({ success: true });
});

app.listen(process.env.PORT || 3000, () => console.log("Backend Live!"));
