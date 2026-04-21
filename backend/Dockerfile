FROM python:3.11-slim

WORKDIR /backend

# Install system dependencies for scipy/numpy/psycopg2
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Create models directory for saving the hmmlearn model
RUN mkdir -p /backend/saved_models

COPY ./app /backend/app

# Command to run uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
