#!/usr/bin/env bash
# ==============================================================================
# Enterprise Deployment Script: Personal Gemini Journal Python Microservice
# Target: Google Cloud Run with Secret Manager & Firebase Service Accounts
# ==============================================================================
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-gen-lang-client-0083334339}"
REGION="${GCP_REGION:-asia-southeast1}"
SERVICE_NAME="gemini-journal-microservice"
SERVICE_ACCOUNT="gemini-journal-sa@${PROJECT_ID}.iam.gserviceaccount.com"

echo "==> Deploying ${SERVICE_NAME} to Google Cloud Run (Project: ${PROJECT_ID}, Region: ${REGION})..."

# 1. Ensure GCP Services are enabled
gcloud services enable \
    run.googleapis.com \
    secretmanager.googleapis.com \
    firestore.googleapis.com \
    identitytoolkit.googleapis.com \
    --project="${PROJECT_ID}"

# 2. Build Container Image via Cloud Build
echo "==> Building container image via Google Cloud Build..."
gcloud builds submit --tag "gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest" . --project="${PROJECT_ID}"

# 3. Deploy to Cloud Run with Secret Manager Bindings & Zero-Trust IAM
echo "==> Deploying to Cloud Run with Secret Manager references..."
gcloud run deploy "${SERVICE_NAME}" \
    --image="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest" \
    --region="${REGION}" \
    --platform="managed" \
    --service-account="${SERVICE_ACCOUNT}" \
    --set-secrets="GEMINI_API_KEY=projects/${PROJECT_ID}/secrets/GEMINI_API_KEY:latest" \
    --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID},ENV=production" \
    --allow-unauthenticated \
    --cpu=1 \
    --memory=512Mi \
    --min-instances=0 \
    --max-instances=10 \
    --project="${PROJECT_ID}"

echo "==> Deployment Complete! Microservice live on Cloud Run."
