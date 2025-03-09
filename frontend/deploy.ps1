param (
    [string]$ServerIP = "93.127.216.71",
    [string]$User = "root",
    [string]$IdentityFile = "patient-path-deploy",
    [string]$RemotePath = "/var/www/patient-path/frontend/build/"
)

# Ensure the identity file exists
if (-not (Test-Path $IdentityFile)) {
    Write-Error "Identity file $IdentityFile not found. Make sure it exists in the current directory."
    exit 1
}

# Build the application
Write-Host "Building the application..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Exiting."
    exit 1
}

# Deploy to server
Write-Host "Deploying to server..." -ForegroundColor Green
Write-Host "This will replace the contents of $RemotePath on $ServerIP" -ForegroundColor Yellow

# Use scp to copy the build directory to the server
$scpCommand = "scp -i $IdentityFile -r build/* $User@$ServerIP`:$RemotePath"
Write-Host "Executing: $scpCommand" -ForegroundColor Cyan
Invoke-Expression $scpCommand

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed. Check your SSH connection and permissions."
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Restarting Nginx on the server..." -ForegroundColor Yellow

# Restart Nginx on the server
$sshCommand = "ssh -i $IdentityFile $User@$ServerIP 'systemctl restart nginx'"
Write-Host "Executing: $sshCommand" -ForegroundColor Cyan
Invoke-Expression $sshCommand

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to restart Nginx. Please check the server logs."
    exit 1
}

Write-Host "Nginx restarted successfully." -ForegroundColor Green
Write-Host "Deployment process completed. Your application should now be available at http://patientpath.org" -ForegroundColor Green 