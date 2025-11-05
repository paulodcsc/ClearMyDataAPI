# CSV Data Cleansing Server

A robust Node.js server designed to receive, process, and cleanse multiple CSV files using data science best practices. The system handles common data quality issues including missing values, duplicates, outliers, formatting inconsistencies, and data validation.

## Features

- ✅ Concurrent CSV file processing
- ✅ Configurable data cleansing pipelines
- ✅ Streaming for large files
- ✅ Detailed cleansing reports
- ✅ RESTful API interface
- ✅ Queue-based job processing
- ✅ Multiple data cleansing strategies

## Data Cleansing Strategies

1. **Missing Data Handling**: Imputation, removal, or flagging based on data type and missing percentage
2. **Duplicate Detection**: Exact or fuzzy matching with configurable similarity thresholds
3. **Outlier Detection**: IQR and Z-score methods with removal, capping, or flagging options
4. **Data Validation**: Type conversion and business rule validation
5. **Standardization**: Date formatting, text normalization, whitespace trimming

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (for job tracking)
- Redis (for job queue)

## Installation

1. Clone the repository:
```bash
cd ClearMyData
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/csv-cleansing
REDIS_HOST=localhost
REDIS_PORT=6379
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
PROCESSED_DIR=./processed
REPORTS_DIR=./reports
```

4. Start MongoDB and Redis:
```bash
# MongoDB
mongod

# Redis
redis-server
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### 1. Upload CSV Files

Upload one or multiple CSV files for processing.

**Endpoint:** `POST /api/v1/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `files`: CSV file(s) (required)
  - `config`: JSON configuration (optional)

**Example with cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/upload \
  -F "files=@file1.csv" \
  -F "files=@file2.csv" \
  -F 'config={"missingData":{"strategy":"impute","numericMethod":"median"}}'
```

**Response:**
```json
{
  "success": true,
  "jobId": "abc123-def456-ghi789",
  "filesUploaded": 2,
  "message": "Files uploaded and queued for processing"
}
```

### 2. Get Job Status

Check the status of a processing job.

**Endpoint:** `GET /api/v1/jobs/:jobId`

**Response:**
```json
{
  "jobId": "abc123-def456-ghi789",
  "status": "processing",
  "progress": 65,
  "filesProcessed": 1,
  "totalFiles": 2,
  "currentFile": "file1.csv",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:05:00.000Z"
}
```

### 3. Get Cleansing Report

Get detailed report of data cleansing operations.

**Endpoint:** `GET /api/v1/jobs/:jobId/report`

**Response:**
```json
{
  "jobId": "abc123-def456-ghi789",
  "status": "completed",
  "report": {
    "files": [
      {
        "filename": "file1.csv",
        "original": {
          "rowCount": 10000,
          "columnCount": 15
        },
        "cleaned": {
          "rowCount": 9850,
          "columnCount": 14
        },
        "issues": {
          "missingValues": 450,
          "duplicates": 150,
          "outliers": 25
        },
        "corrections": {
          "missingImputed": 400,
          "duplicatesRemoved": 150,
          "outliersHandled": 20
        }
      }
    ]
  }
}
```

### 4. Download Cleansed Data

Download the processed CSV file(s).

**Endpoint:** `GET /api/v1/jobs/:jobId/download`

**Response:**
- Single file: Returns CSV file
- Multiple files: Returns ZIP archive

## Configuration Options

You can customize the cleansing process by providing a configuration object:

```json
{
  "missingData": {
    "strategy": "impute",
    "numericMethod": "median",
    "categoricalMethod": "mode",
    "dropColumnThreshold": 50
  },
  "duplicates": {
    "strategy": "remove",
    "keyColumns": ["email", "id"],
    "fuzzyMatch": false,
    "similarityThreshold": 0.85
  },
  "outliers": {
    "strategy": "flag",
    "method": "iqr",
    "threshold": 1.5
  },
  "validation": {
    "rules": {
      "email": "email",
      "age": { "min": 0, "max": 120 },
      "price": { "min": 0 }
    }
  },
  "standardization": {
    "dates": "ISO8601",
    "text": "lowercase",
    "trimWhitespace": true
  }
}
```

## Project Structure

```
csv-cleansing-server/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middlewares/
│   ├── services/
│   │   ├── cleansing/
│   │   │   ├── strategies/
│   │   │   ├── pipeline.service.js
│   │   │   └── profiler.service.js
│   │   ├── queue.service.js
│   │   ├── queue.processor.js
│   │   ├── cleansing.service.js
│   │   └── storage.service.js
│   ├── models/
│   ├── utils/
│   ├── config/
│   └── app.js
├── uploads/
├── processed/
├── reports/
├── .env
├── package.json
└── README.md
```

## Usage Example

1. **Upload files:**
```bash
curl -X POST http://localhost:3000/api/v1/upload \
  -F "files=@data.csv"
```

2. **Check status:**
```bash
curl http://localhost:3000/api/v1/jobs/YOUR_JOB_ID
```

3. **Download cleaned data:**
```bash
curl http://localhost:3000/api/v1/jobs/YOUR_JOB_ID/download \
  -o cleaned_data.csv
```

## Development

### Running Tests
```bash
npm test
```

### Code Structure
- **API Layer**: Handles HTTP requests and file uploads
- **Queue Service**: Manages asynchronous job processing
- **Cleansing Pipeline**: Orchestrates data cleansing strategies
- **Storage Service**: Manages file storage and retrieval

## Performance Considerations

- Files are processed in parallel (up to 3 concurrent jobs)
- Large files are handled efficiently using streaming
- Jobs are stored in Redis queue for reliability
- Processing progress is tracked and reported

## Error Handling

The server includes comprehensive error handling:
- Validation errors (400)
- File not found errors (404)
- Processing errors (500)
- Detailed error messages in development mode

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


# ClearMyDataAPI
