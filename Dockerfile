# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend & Runtime
FROM python:3.11-slim
WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code (now directly into WORKDIR)
COPY backend/ .

# Copy Built Frontend (one level up, at /app/frontend/dist)
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Port
ENV PORT=3000
EXPOSE 3000

# Run uvicorn from /app/backend (current WORKDIR)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
