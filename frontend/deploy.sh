#!/bin/bash
# This script deploys the simplified Patient PATH frontend to the server.
# Run this script from your local environment with Git Bash or WSL.

# Server information
SERVER_IP="93.127.216.71"
SSH_USER="root"
IDENTITY_FILE="patient-path-deploy"
REMOTE_PATH="/var/www/patient-path/frontend/build/"

echo "=== Patient PATH Deployment ==="
echo "This will deploy the simplified frontend to your server"

# Check if build directory exists
if [ ! -d "build" ]; then
  echo "Error: build directory not found. Run 'npm run build' first."
  exit 1
fi

# Check if identity file exists
if [ ! -f "$IDENTITY_FILE" ]; then
  echo "Error: Identity file $IDENTITY_FILE not found."
  echo "Make sure it exists in the current directory."
  exit 1
fi

# Create backup on server
echo "Creating backup of existing files on server..."
ssh -i "$IDENTITY_FILE" "$SSH_USER@$SERVER_IP" "mkdir -p /var/www/backup && cp -r $REMOTE_PATH /var/www/backup/frontend-$(date +%Y%m%d-%H%M%S)"

# Deploy to server
echo "Deploying to $SERVER_IP..."
scp -i "$IDENTITY_FILE" -r build/* "$SSH_USER@$SERVER_IP:$REMOTE_PATH"

if [ $? -ne 0 ]; then
  echo "Deployment failed. Check your SSH connection and permissions."
  exit 1
fi

echo "Deployment completed successfully!"

# Restart Nginx
echo "Restarting Nginx on the server..."
ssh -i "$IDENTITY_FILE" "$SSH_USER@$SERVER_IP" 'systemctl restart nginx'

echo "=== Deployment Complete ==="
echo "Your application should now be accessible at http://patientpath.org"
echo "If you encounter issues, check the server logs with:"
echo "  ssh -i $IDENTITY_FILE $SSH_USER@$SERVER_IP 'tail -50 /var/log/nginx/error.log'" 