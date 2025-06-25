# Deployment Guide - Employee Feedback Portal

## 🚀 Deployment Options

### Option 1: Replit Deployment (Recommended)

#### Automatic Deployment
1. Click the "Deploy" button in Replit interface
2. Configure deployment settings:
   - **Name**: employee-feedback-portal
   - **Environment**: Production
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `gunicorn --bind 0.0.0.0:5000 main:app`

#### Manual Configuration
```yaml
# .replit file (auto-configured)
modules = ["python-3.11"]

[nix]
channel = "stable-22_11"

[deployment]
run = ["gunicorn", "--bind", "0.0.0.0:5000", "main:app"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80
```

### Option 2: Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Git repository

#### Setup Steps
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL=your_database_url
heroku config:set SESSION_SECRET=your_secret_key

# Deploy
git push heroku main
```

#### Procfile
```
web: gunicorn --bind 0.0.0.0:$PORT main:app
```

### Option 3: AWS EC2 Deployment

#### EC2 Instance Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip nginx postgresql postgresql-contrib -y

# Clone repository
git clone your-repo-url
cd employee-feedback-portal

# Install dependencies
pip3 install -r requirements.txt

# Configure PostgreSQL
sudo -u postgres createdb employee_feedback_db
sudo -u postgres createuser --interactive
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your_domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Systemd Service
```ini
[Unit]
Description=Employee Feedback Portal
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/employee-feedback-portal
Environment=PATH=/home/ubuntu/employee-feedback-portal/venv/bin
ExecStart=/home/ubuntu/employee-feedback-portal/venv/bin/gunicorn --bind 127.0.0.1:5000 main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

### Option 4: Docker Deployment

#### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "main:app"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/employee_feedback_db
      - SESSION_SECRET=your-secret-key
    depends_on:
      - db
    
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=employee_feedback_db
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 🔧 Production Configuration

### Environment Variables
```env
# Production Database
DATABASE_URL=postgresql://prod_user:secure_password@prod_host:5432/prod_db

# Security
SESSION_SECRET=ultra-secure-random-key-256-bits
FLASK_ENV=production
FLASK_DEBUG=False

# File Upload
MAX_CONTENT_LENGTH=16777216
UPLOAD_FOLDER=/app/uploads

# Optional: Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Gunicorn Configuration
Create `gunicorn.conf.py`:
```python
import multiprocessing

bind = "0.0.0.0:5000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 2
max_requests = 1000
max_requests_jitter = 50
preload_app = True
```

### Database Optimization
```sql
-- Performance indexes
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_team ON employees(team);
CREATE INDEX idx_employees_is_manager ON employees(is_manager);
CREATE INDEX idx_feedback_employee_id ON feedback(employee_id);
CREATE INDEX idx_feedback_manager_id ON feedback(manager_id);
CREATE INDEX idx_billing_employee_id ON billing_details(employee_id);

-- Optimize PostgreSQL settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

## 📊 Monitoring & Logging

### Application Logging
```python
import logging
import sys

if not app.debug:
    # Production logging
    file_handler = logging.FileHandler('logs/app.log')
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
```

### Health Check Endpoint
Add to `routes.py`:
```python
@app.route('/health')
def health_check():
    try:
        # Check database connection
        db.session.execute('SELECT 1')
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500
```

## 🔒 Security Checklist

### Pre-Deployment Security
- [ ] Change default SESSION_SECRET
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up proper database user permissions
- [ ] Enable firewall rules
- [ ] Update all dependencies
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting

### SSL/HTTPS Configuration
```nginx
server {
    listen 443 ssl;
    server_name your_domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.11
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        python -m pytest tests/
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 📈 Performance Optimization

### Database Connection Pooling
```python
# In app.py
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_size": 20,
    "pool_recycle": 300,
    "pool_pre_ping": True,
    "max_overflow": 0
}
```

### Caching Strategy
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@app.route('/api/hierarchy')
@cache.cached(timeout=300)  # Cache for 5 minutes
def get_hierarchy():
    # Expensive hierarchy calculation
    pass
```

### Static File Optimization
```python
# Use CDN for static files in production
if not app.debug:
    app.config['STATIC_URL'] = 'https://cdn.yourdomain.com/static/'
```

## 🔍 Troubleshooting

### Common Deployment Issues

1. **Database Connection Errors**
   ```bash
   # Check database connectivity
   pg_isready -h your_host -p 5432
   
   # Test connection string
   python -c "import psycopg2; psycopg2.connect('your_connection_string')"
   ```

2. **Permission Errors**
   ```bash
   # Fix file permissions
   chmod +x main.py
   chown -R www-data:www-data /var/www/your-app
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   htop
   
   # Optimize Gunicorn workers
   workers = min(4, (2 * cpu_count()) + 1)
   ```

4. **Static Files Not Loading**
   ```python
   # Check static file configuration
   app.static_folder = 'static'
   app.static_url_path = '/static'
   ```

### Performance Monitoring
```bash
# Monitor application performance
htop
iotop
netstat -tuln
journalctl -u your-app-service -f
```

## 📋 Post-Deployment Checklist

- [ ] Application starts without errors
- [ ] Database migrations completed
- [ ] Static files serve correctly
- [ ] Login functionality works
- [ ] File upload functionality works
- [ ] All API endpoints respond correctly
- [ ] HTTPS certificate valid
- [ ] Monitoring and logging active
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security scan passed

## 🆘 Rollback Strategy

### Quick Rollback
```bash
# Heroku rollback
heroku rollback v123

# Git-based rollback
git revert HEAD
git push origin main

# Database rollback
pg_restore --clean --no-acl --no-owner -h localhost -U user -d database backup.sql
```

### Automated Rollback
```yaml
# In CI/CD pipeline
- name: Health Check
  run: |
    sleep 30
    curl -f http://your-app.com/health || exit 1

- name: Rollback on Failure
  if: failure()
  run: |
    heroku releases:rollback --app=your-app-name
```

---

**Deployment Success Checklist**: Verify all components are working correctly before marking deployment as complete.