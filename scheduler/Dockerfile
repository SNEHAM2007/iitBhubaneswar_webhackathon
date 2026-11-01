
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# FastAPI port
EXPOSE 8000

# Start the scheduling service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
