Stage 1:

Endpoints:

GET /notifications
Headers:
Authorization: Bearer Token

Response:
{
  "notifications": [
    {
      "ID": "string",
      "Type": "Result | Event | Placement",
      "Message": "string",
      "Timestamp": "datetime"
    }
  ]
}

Real-time mechanism:
- Use WebSockets or polling for updates


Stage 2:

Database Choice:
- PostgreSQL (relational DB)

Schema:
notifications (
  id UUID PRIMARY KEY,
  student_id INT,
  type VARCHAR,
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP
)

Scaling Issue:
- Large data → slow queries

Solution:
- Indexing on student_id and created_at
- Partitioning


Stage 3:

Problem:
- Query scans large dataset
- No proper indexing

Fix:
- Add index on (studentID, isRead, createdAt DESC)

Optimized Query:
Use index for faster lookup

Avoid indexing all columns:
- Increases write cost


Stage 4:

Problems:
- DB overload due to frequent requests

Solutions:
- Pagination (limit results)
- Caching (Redis)
- Lazy loading
- Background processing


Stage 5:

Issues:
- Sequential processing → slow
- No retry mechanism
- Failure breaks flow

Solution:
- Use message queue (Kafka/RabbitMQ)
- Retry failed emails
- Separate DB write and email sending

Improved Flow:
1. Save to DB
2. Push to queue
3. Workers process notifications


Stage 6:

Approach:
- Fetch notifications from API
- Assign priority (Placement > Result > Event)
- Sort by priority and timestamp
- Return top 10 notifications

Efficiency:
- Sorting: O(n log n)
- Suitable for real-time filtering