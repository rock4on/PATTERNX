FROM python:3.12-slim

# Set non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p logs tmp \
    && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set production environment variables
ENV FLASK_APP=run.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1


# Expose port
EXPOSE 8080

# Run with gunicorn for production
CMD ["gunicorn",
     "--bind", "0.0.0.0:8080",
     "--workers", "4",
     "--timeout", "120",
     "--keep-alive", "2",
     "--max-requests", "1000",
     "--max-requests-jitter", "100",
     "--log-level", "debug",                 # capture Flask’s debug/info logs
     "--access-logfile", "-",               # stream access logs (werkzeug) to stdout
     "--error-logfile", "-",                # stream error logs to stderr
     "run:app"]
