# Simple Serverless FastApi Example

## Installation

### Setup Virtual Environment

```shell
source .venv/bin/activate
```

### Install Dependencies

```shell
uv sync
```

## Run the application

```shell
uv run uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## Deploy

### Package Dependencies

```shell
cd ./.venv/lib/python3.13/site-packages
mkdir -p /tmp/dist ; zip -r /tmp/dist/function.zip .
```

### Package Lambda

```shell
cd /tmp/dist
zip -g function.zip lambda_function.py
```
