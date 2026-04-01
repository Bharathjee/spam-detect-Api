# SMS Spam Detector

A simple Python Flask app that detects spammy SMS content using keyword matching.

## Features

- Web UI for entering an SMS message
- Mobile-friendly UI with PWA support for installable mobile usage
- POST `/check` endpoint that returns spam detection results as JSON
- Spam keyword detection with three categories:
  - `SPAM 🚨`
  - `SUSPICIOUS ⚠️`
  - `NOT SPAM ✅`

## Files

- `app.py` - Flask application and spam detection logic
- `requirements.txt` - Python dependencies
- `Dockerfile` - Container build instructions
- `Jenkinsfile` - Jenkins pipeline definition
- `Procfile` - Heroku process definition
- `k8s/` - Kubernetes deployment and service manifests
- `test_spam.py` - Unit tests

## Requirements

- Python 3.11+
- `pip`

## Install

```bash
python -m pip install -r requirements.txt
```

## Run locally

```bash
python app.py
```

Then open from the same machine:

- `http://127.0.0.1:5000`

From a phone on the same Wi-Fi network, open:

- `http://<computer-ip>:5000`

Replace `<computer-ip>` with your PC's local IP address (for example, `192.168.1.100`).

## API

### POST `/check`

Request body:

```json
{
  "message": "Your SMS message here"
}
```

Response body:

```json
{
  "result": "SPAM 🚨",
  "keywords": ["free", "winner"]
}
```

## Docker

Build the image:

```bash
docker build -t spam-detector .
```

Run the container:

```bash
docker run -p 5000:5000 spam-detector
```

## Kubernetes

Apply the Kubernetes manifests to a cluster:

```bash
kubectl apply -f k8s/
```

Access the service inside the cluster with the `spam-detector-service` service on port `80`.

## GitHub Actions

This repository includes a GitHub Actions workflow in `.github/workflows/ci.yml`.
It runs on push and pull request events to `main`, installs dependencies, runs `pytest`, and builds the Docker image.

## Jenkins

A declarative Jenkins pipeline is provided in `Jenkinsfile`.
It checks out the repository, installs dependencies, runs tests, and builds the Docker image.

## Heroku

If you deploy to Heroku, the app will start using the `web: python app.py` command from `Procfile`.

## Tests

```bash
pytest
```

## Notes

- The spam detector uses a simple keyword-based heuristic.
- Adjust `SPAM_KEYWORDS` in `app.py` to change detection behavior.
