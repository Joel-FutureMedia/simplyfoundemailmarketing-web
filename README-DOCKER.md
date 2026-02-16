# Docker Setup Guide - Email Marketing Frontend

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

This will start the frontend along with backend and PostgreSQL:

```bash
cd C:\Email
docker-compose up -d frontend
```

To view logs:
```bash
docker-compose logs -f frontend
```

To stop:
```bash
docker-compose down
```

### Option 2: Build and Run Manually

#### 1. Build the Docker Image

```bash
cd emailmarket
docker build -t emailmarket-frontend:latest .
```

#### 2. Run the Frontend Container

```bash
docker run -d \
  --name emailmarket-frontend \
  -p 3008:3008 \
  emailmarket-frontend:latest
```

## Environment Variables

The frontend is built as a static site, so environment variables need to be set at build time. If you need to change the API URL, you'll need to rebuild the image.

To customize the API URL, you can:

1. **Update the API base URL before building:**
   - Edit `src/services/api.js`
   - Change `API_BASE_URL` to your backend URL
   - Rebuild the Docker image

2. **Use build arguments:**
   ```dockerfile
   ARG API_URL=http://localhost:8585/api
   ENV VITE_API_URL=$API_URL
   ```
   Then build with:
   ```bash
   docker build --build-arg API_URL=http://your-backend-url:8585/api -t emailmarket-frontend .
   ```

## Accessing the Application

Once the container is running, access the frontend at:
- **Local:** http://localhost:3008
- **Network:** http://your-server-ip:3008

## Troubleshooting

### View Container Logs

```bash
docker logs emailmarket-frontend
docker logs emailmarket-frontend -f  # Follow logs
```

### Access Container Shell

```bash
docker exec -it emailmarket-frontend /bin/sh
```

### Check Nginx Configuration

```bash
docker exec -it emailmarket-frontend cat /etc/nginx/conf.d/default.conf
```

### Rebuild After Code Changes

```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi emailmarket-frontend:latest
```

## Production Deployment

For production, consider:

1. **Use environment-specific API URLs**
2. **Set up reverse proxy (nginx) in front**
3. **Configure SSL/TLS certificates**
4. **Set up CDN for static assets**
5. **Configure proper caching headers**

### Example Production Docker Run

```bash
docker run -d \
  --name emailmarket-frontend \
  --restart unless-stopped \
  -p 3008:3008 \
  emailmarket-frontend:latest
```

### Behind Reverse Proxy (Nginx)

If running behind a reverse proxy, update the nginx config to proxy API requests:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8585;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Port Configuration

The frontend runs on port **3008** by default. To change it:

1. Update the Dockerfile `EXPOSE` directive
2. Update the nginx config `listen` directive
3. Update docker-compose.yml port mapping
4. Rebuild the image

