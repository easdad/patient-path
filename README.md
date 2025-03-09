# Patient Path

A healthcare application for connecting patients with providers.

## Project Structure

```
/patient-path
├── frontend/         # React frontend application
├── backend/          # Express API server
├── ecosystem.config.js # PM2 configuration
└── nginx.conf        # Nginx server configuration
```

## Server Configuration

### Nginx Setup

The application requires Nginx to be configured properly. The `nginx.conf` file should be placed at `/etc/nginx/sites-available/patientpath.org` on your server, with a symlink to `/etc/nginx/sites-enabled/`.

To set up:
```bash
# Copy the config
sudo cp nginx.conf /etc/nginx/sites-available/patientpath.org

# Create symlink
sudo ln -sf /etc/nginx/sites-available/patientpath.org /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

### PM2 Application Management

The backend API is managed using PM2. The configuration is in `ecosystem.config.js`.

To start:
```bash
pm2 start ecosystem.config.js
```

To restart:
```bash
pm2 restart patient-path-api
```

### Deployment

The application is deployed automatically via GitHub Actions. When changes are pushed to the main branch, the workflow in `.github/workflows/deploy.yml` handles deployment to the VPS. 