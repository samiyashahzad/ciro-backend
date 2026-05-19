FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Hugging Face Spaces expose port 7860
EXPOSE 7860

# We need the graph to hit the correct internal port
ENV BASE_URL="http://127.0.0.1:7860"

# Command to run the application on Hugging Face Spaces
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
