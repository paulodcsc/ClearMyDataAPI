# Quick Start Guide

## Prerequisites

Make sure you have the following installed:
- Node.js (v14+)
- MongoDB
- Redis

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   # Copy and edit the configuration
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

3. **Start MongoDB:**
   ```bash
   mongod
   ```

4. **Start Redis:**
   ```bash
   redis-server
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Testing the API

### 1. Upload a CSV file:
```bash
curl -X POST http://localhost:3000/api/v1/upload \
  -F "files=@your_file.csv"
```

### 2. Check job status:
```bash
curl http://localhost:3000/api/v1/jobs/YOUR_JOB_ID
```

### 3. Download cleaned CSV:
```bash
curl http://localhost:3000/api/v1/jobs/YOUR_JOB_ID/download \
  -o cleaned_output.csv
```

## Example with Custom Configuration

```bash
curl -X POST http://localhost:3000/api/v1/upload \
  -F "files=@data.csv" \
  -F 'config={"missingData":{"strategy":"impute","numericMethod":"median"},"duplicates":{"strategy":"remove","keyColumns":["email"]}}'
```

## Troubleshooting

- **MongoDB connection error**: Make sure MongoDB is running on the configured port
- **Redis connection error**: Make sure Redis is running on the configured port
- **File upload fails**: Check file size limits and ensure file is a valid CSV
- **Job stuck**: Check Redis queue status and server logs

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Review the [structure.md](structure.md) for architecture details
- Customize cleansing strategies in `src/config/cleansing.config.js`

