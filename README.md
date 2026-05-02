# Backend Task

## Overview

This project implements a backend system for:

- Vehicle task scheduling
- Priority-based notifications

---

## APIs

### 1. Get Depots
GET /depots  
Fetches depot data (mechanic hours)

---

### 2. Get Vehicles
GET /vehicles  
Fetches vehicle tasks (duration and impact)

---

### 3. Schedule Tasks
GET /schedule  

- Assigns tasks to depots  
- Ensures capacity is not exceeded  
- Uses a greedy approach (high impact first)

---

### 4. Notifications
GET /notifications  

- Fetches notifications from external API  
- Sorts based on priority:
  - Placement > Result > Event  
- Returns top 10 latest notifications  

---

## Tech Used

- Node.js  
- Express.js  
- Axios  

---

## How to Run

1. Install dependencies  

npm install


2. Start server  

node index.js


3. Test using Postman  
- /depots  
- /vehicles  
- /schedule  
- /notifications  

---

## Notes

- Logging added for main operations  
- node_modules is excluded using .gitignore  
- External APIs are protected and accessed using token 
