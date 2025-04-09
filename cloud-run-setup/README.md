# Giselle AI Interview System - Google Cloud Run Deployment

This guide provides instructions for deploying the Giselle AI Interview System backend on Google Cloud Run.

## Prerequisites

- Google Cloud Platform account with billing enabled
- Google Cloud SDK installed and initialized
- Docker installed locally

## Google Cloud Setup

1. Create a new Google Cloud project (or use an existing one)
2. Enable the following APIs:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API
   - Cloud Storage API
   - Secret Manager API (if using for environment variables)

```bash
gcloud services enable run.googleapis.com \
                        cloudbuild.googleapis.com \
                        containerregistry.googleapis.com \
                        storage.googleapis.com \
                        secretmanager.googleapis.com
```

## Storage Bucket Setup

Create a Google Cloud Storage bucket for file uploads:

```bash
gsutil mb -l us-central1 gs://giselle-uploads
# Set bucket to be publicly readable
gsutil iam ch allUsers:objectViewer gs://giselle-uploads
```

## Environment Configuration

1. Copy `.env.example` to `.env`
2. Update with your actual API keys and configuration
3. For production, store sensitive values in Secret Manager

```bash
# Example: Creating secrets
echo -n "your-actual-api-key" | gcloud secrets create openrouter-api-key --data-file=-
echo -n "your-actual-api-key" | gcloud secrets create elevenlabs-api-key --data-file=-
```

## Local Testing

Test the application locally before deploying:

```bash
# Install dependencies
npm install

# Run the application
npm start
```

## Building and Deploying to Cloud Run

### Option 1: Using Cloud Build

```bash
# Build and deploy using Cloud Build and Cloud Run
gcloud builds submit --tag gcr.io/[PROJECT_ID]/giselle-backend
gcloud run deploy giselle-backend \
  --image gcr.io/[PROJECT_ID]/giselle-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GCS_BUCKET_NAME=giselle-uploads,USE_MOCK_DATA=false" \
  --set-secrets="OPENROUTER_API_KEY=openrouter-api-key:latest,ELEVENLABS_API_KEY=elevenlabs-api-key:latest"
```

### Option 2: Using Docker and gcloud

```bash
# Build the container locally
docker build -t gcr.io/[PROJECT_ID]/giselle-backend .

# Push to Container Registry
docker push gcr.io/[PROJECT_ID]/giselle-backend

# Deploy to Cloud Run
gcloud run deploy giselle-backend \
  --image gcr.io/[PROJECT_ID]/giselle-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GCS_BUCKET_NAME=giselle-uploads,USE_MOCK_DATA=false" \
  --set-secrets="OPENROUTER_API_KEY=openrouter-api-key:latest,ELEVENLABS_API_KEY=elevenlabs-api-key:latest"
```

## Continuous Deployment Setup

For continuous deployment, set up a Cloud Build trigger connecting to your GitHub repository.

1. Connect Cloud Build to your GitHub repository
2. Create a trigger to build and deploy on commits to your main branch
3. Use the provided `cloudbuild.yaml` file for the build configuration

## Important Notes for Cloud Run

- Cloud Run is stateless - do not store data in memory
- Cloud Run has an ephemeral filesystem - do not store files locally
- Use environment variables for configuration
- The container must listen on the port defined by the PORT environment variable
- Containers must start quickly (under 4 minutes)
- Use a production-ready process manager like PM2 for more complex deployments

## Scaling Considerations

- Cloud Run scales automatically based on traffic
- Ensure your application handles concurrent requests properly
- For database connections, use connection pooling
- Add retry logic for API calls that might fail

## Future Improvements

For production use, consider:

1. Implementing a database (Cloud SQL or Firestore) for persistent storage
2. Setting up proper authentication and authorization
3. Implementing monitoring and logging using Cloud Monitoring and Cloud Logging
4. Creating a separate staging environment
5. Setting up alerts for errors and performance issues 