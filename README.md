# Task MCP Server

A Model Context Protocol (MCP) server for managing user tasks using AWS Lambda and DynamoDB.

## Project Structure

```
task-mcp-server/
├── dev/
│   └── local_server.mjs            # Local server for testing
├── src/
│   └── config.mjs                  # Configuration management
│   └── db_client.mjs               # DynamoDB client setup
│   └── lambda.js                   # Main Lambda handler
│   └── task_model.mjs           # Task data model and database operations
│   └── task_tools.js            # MCP tool definitions
│   └── server.mjs                  # MCP server initialization
├── package.json                    # Dependencies and scripts
├── .env.example                    # Environment variables example
└── README.md                       # This file
```

## Features

The server provides the following MCP tools:

- **get_task** - Retrieve a user's task
- **update_task** - Update user task information
- **add_interest** - Add an interest to a user's task
- **remove_interest** - Remove an interest from a user's task
- **add_connection** - Add a connection to a user's task
- **remove_connection** - Remove a connection from a user's task
- **list_tasks** - List all tasks (with optional limit)
- **delete_task** - Delete a user's task

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS configuration
   ```

3. **Set up DynamoDB table:**
   See task-server-cdk project

## Usage

### Local Development

```bash
npm run dev
```

### AWS Lambda Deployment

The server is designed to run as an AWS Lambda function. See task-server-cdk project.

## Task Schema

Each task contains:

```json
{
  "id": "string",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp",
  "name": "string | null",
  "location": "string | null", 
  "job": "string | null",
  "connections": ["array", "of", "strings"],
  "interests": ["array", "of", "strings"]
}
```

## Testing and troubleshooting
```bash
   npx @modelcontextprotocol/inspector
```

