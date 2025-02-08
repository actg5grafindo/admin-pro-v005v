#!/bin/bash

# Ensure you're logged in to Supabase
supabase login

# Set the project reference (replace with your actual project ref)
PROJECT_REF="ixtjeocobjqcqladeaqg"

# Configure additional origins
supabase config set --project-ref $PROJECT_REF \
  --additional-origins "http://localhost:5050,https://admin-pro-two.vercel.app"

echo "CORS configuration updated successfully!"
