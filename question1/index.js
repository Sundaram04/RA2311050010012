
const crypto = require("crypto");
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = 3000;

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzcDM3MjhAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMzk3MCwiaWF0IjoxNzc3NzAzMDcwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOTY2MzAwYzEtNDQzMy00ODYyLWE2ODgtNTUxNjU5ZDVlMDlmIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic3VuZGFyYW0gcGFuZGV5Iiwic3ViIjoiMTQ2ZGU1MzAtNTgwZS00YWU5LWJkZTUtOTgzZjI0MDc4M2FkIn0sImVtYWlsIjoic3AzNzI4QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoic3VuZGFyYW0gcGFuZGV5Iiwicm9sbE5vIjoicmEyMzExMDUwMDEwMDEyIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiMTQ2ZGU1MzAtNTgwZS00YWU5LWJkZTUtOTgzZjI0MDc4M2FkIiwiY2xpZW50U2VjcmV0IjoiVXpNdXlZUG5jWVVGWHpZdCJ9.BkcGsXpVDV-RC8I8GYRpM4FQJ6hzFAac5vZ3Uu1ar4w";
const headers = {
    Authorization: `Bearer ${TOKEN}`
};

let notifications = [];

function log(level, msg) {
    console.log(`[${level}] ${msg}`);
}



app.get("/depots", async (req, res) => {
    try {
        const { data } = await axios.get(
            "http://20.207.122.201/evaluation-service/depots",
            { headers }
        );

        log("info", "depots fetched");
        res.json(data);
    } catch (err) {
        log("error", "failed to fetch depots");
        res.status(500).json({
            message: "Error fetching depots",
            error: err.response?.data || err.message
        });
    }
});

app.get("/vehicles", async (req, res) => {
    try {
        const { data } = await axios.get(
            "http://20.207.122.201/evaluation-service/vehicles",
            { headers }
        );

        log("info", "vehicles fetched");
        res.json(data);
    } catch (err) {
        log("error", "failed to fetch vehicles");
        res.status(500).json({
            message: "Error fetching vehicles",
            error: err.response?.data || err.message
        });
    }
});

app.get("/schedule", async (req, res) => {
    try {
        const depotRes = await axios.get(
            "http://20.207.122.201/evaluation-service/depots",
            { headers }
        );

        const vehicleRes = await axios.get(
            "http://20.207.122.201/evaluation-service/vehicles",
            { headers }
        );

        const depots = depotRes.data.depots;
        const vehicles = vehicleRes.data.vehicles;

        vehicles.sort((a, b) => b.Impact - a.Impact);

        const result = depots.map(d => ({
    depotID: d.ID,
    remaining: d.MechanicHours,
    assignedTasks: []
}));

let idx = 0;

for (let v of vehicles) {
    let assigned = false;

    for (let i = 0; i < result.length; i++) {
        let d = result[(idx + i) % result.length];

        if (v.Duration <= d.remaining) {
            d.assignedTasks.push({
                TaskID: v.TaskID,
                Duration: v.Duration,
                Impact: v.Impact
            });

            d.remaining -= v.Duration;
            idx = (idx + 1) % result.length;
            assigned = true;
            break;
        }
    }

    if (!assigned) continue;
}

        log("info", "schedule generated");
        res.json(result);
    } catch (err) {
        log("error", "scheduling failed");
        res.status(500).json({
            message: "Scheduling failed",
            error: err.response?.data || err.message
        });
    }
});




app.get("/notifications", async (req, res) => {
    try {
        const response = await axios.get(
            "http://20.207.122.201/evaluation-service/notifications",
            { headers }
        );

        const notifications = response.data.notifications;

        const priorityMap = {
            Placement: 3,
            Result: 2,
            Event: 1
        };

        notifications.sort((a, b) => {
            const p1 = priorityMap[a.Type] || 0;
            const p2 = priorityMap[b.Type] || 0;

            if (p1 !== p2) return p2 - p1;

            return new Date(b.Timestamp) - new Date(a.Timestamp);
        });

        const top10 = notifications.slice(0, 10);

        res.json({
            notifications: top10
        });

    } catch (err) {
        res.status(500).json({
            message: "Error fetching priority notifications",
            error: err.response?.data || err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});