# Whisper Transcription Service Setup

This guide explains how to set up the OpenAI Whisper transcription service for the Test App project. The service runs locally on your VPS and provides audio transcription capabilities for Russian language content.

## Prerequisites

- Linux VPS (Debian/Ubuntu recommended)
- At least 2GB RAM (4GB recommended for better performance)
- Python 3.8 or higher
- Node.js 14 or higher

## Installation Steps

### 1. System Dependencies

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install required system packages
sudo apt install -y \
    python3-full \
    python3-pip \
    python3-venv \
    ffmpeg \
    git
```

### 2. Create Service Directory

```bash
# Create service directory
sudo mkdir -p /opt/whisper-service
sudo chown $USER:$USER /opt/whisper-service
cd /opt/whisper-service
```

### 3. Set Up Python Virtual Environment

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install required Python packages
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install openai-whisper
pip install fastapi uvicorn python-multipart
```

### 4. Create Service Files

#### Create the Python Server Script

```bash
nano /opt/whisper-service/server.py
```

Paste the server code (provided in the transcription service implementation).

#### Create the SystemD Service File

```bash
sudo nano /etc/systemd/system/whisper-service.service
```

Add the following content:

```ini
[Unit]
Description=Whisper Transcription Service
After=network.target

[Service]
ExecStart=/opt/whisper-service/venv/bin/python /opt/whisper-service/server.py
WorkingDirectory=/opt/whisper-service
User=your-username
Environment=PATH=/opt/whisper-service/venv/bin:/usr/local/bin:/usr/bin:/bin
Environment=MODEL_SIZE=base
Environment=PORT=3001
Restart=always

[Install]
WantedBy=multi-user.target
```

Replace `your-username` with your actual system username.

### 5. Download Whisper Model

```bash
# Activate virtual environment if not already activated
source /opt/whisper-service/venv/bin/activate

# Pre-download the model
python3 -c "import whisper; whisper.load_model('base')"
```

### 6. Start the Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable whisper-service

# Start the service
sudo systemctl start whisper-service

# Check status
sudo systemctl status whisper-service
```

### 7. Test the Installation

```bash
# Test the health endpoint
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","model":"base"}
```

## Configuration Options

### Model Sizes

Available model sizes (adjust in whisper-service.service):

- tiny: ~39M parameters (fastest, least accurate)
- base: ~74M parameters (good balance)
- small: ~244M parameters (better accuracy)
- medium: ~769M parameters (high accuracy)
- large: ~1550M parameters (best accuracy, most resource-intensive)

Set the model size in the service file using:

```ini
Environment=MODEL_SIZE=base
```

### Memory Requirements

- tiny/base: ~1GB RAM
- small: ~2GB RAM
- medium: ~5GB RAM
- large: ~10GB RAM

### Port Configuration

Default port is 3001. Change it in the service file:

```ini
Environment=PORT=3001
```

## Monitoring and Maintenance

### View Logs

```bash
# View service logs
sudo journalctl -u whisper-service -f
```

### Restart Service

```bash
sudo systemctl restart whisper-service
```

### Update Model

```bash
# Stop service
sudo systemctl stop whisper-service

# Activate virtual environment
source /opt/whisper-service/venv/bin/activate

# Update packages
pip install --upgrade openai-whisper

# Start service
sudo systemctl start whisper-service
```

## Troubleshooting

### Common Issues

1. Service fails to start

```bash
# Check logs for errors
sudo journalctl -u whisper-service -e
```

2. Memory issues

```bash
# Check memory usage
free -h
```

3. Permission issues

```bash
# Check service user permissions
sudo ls -l /opt/whisper-service
```

### Performance Optimization

1. If transcription is slow:

- Use a smaller model size
- Ensure no other resource-intensive processes are running
- Consider upgrading VPS RAM

2. If accuracy is poor:

- Try a larger model size
- Ensure audio quality is good
- Check if audio file format is supported

## Security Considerations

1. The service is configured to listen only on localhost by default
2. If exposing to the internet:
   - Add authentication
   - Use HTTPS
   - Configure firewall rules
   - Consider rate limiting

## Integration with Test App

1. Update your environment configuration:

```env
WHISPER_SERVICE_URL=http://localhost:3001
```

2. Update CORS settings if needed in server.py:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["your-frontend-domain"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Support

For issues:

1. Check the logs: `sudo journalctl -u whisper-service -f`
2. Verify system resources: `htop` or `top`
3. Test service health: `curl http://localhost:3001/health`
