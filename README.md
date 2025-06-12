# riz-mAIstro Task Server

A Model Context Protocol (MCP) server for intelligent task management, built with JavaScript, Middy, and middy-mcp. This server enables AI assistants to interact with task management functionality through a standardized protocol, deployed as AWS Lambda functions for scalable, serverless operation.

## Overview

riz-mAIstro Task Server is a JavaScript/Node.js-based MCP server that exposes task management capabilities to AI applications. It leverages the Model Context Protocol through the middy-mcp middleware to provide a standardized interface for creating, managing, and tracking tasks, allowing AI assistants to help users organize their work naturally through conversation.

Built with Middy middleware framework, this server runs efficiently on AWS Lambda, providing serverless scalability and cost-effective operation.

## Project Structure

```
task-mcp-server/
├── dev/
│   └── local_server.mjs            # Local server for testing
├── src/
│   └── config.mjs                  # Configuration management
│   └── db_client.mjs               # DynamoDB client setup
│   └── index.mjs                    # Main Lambda handler
│   └── task_model.mjs              # Task data model and database operations
│   └── task_tools.js               # MCP tool definitions
│   └── server.mjs                  # MCP server initialization
├── package.json                    # Dependencies and scripts
├── .env.example                    # Environment variables example
└── README.md                       # This file
```
## What is Model Context Protocol (MCP)?

The Model Context Protocol (MCP) is an open standard that enables secure, two-way connections between AI applications and external data sources. MCP servers like this one act as bridges, allowing AI assistants to interact with your task management system through natural language while maintaining security and standardization.

## What is Middy and middy-mcp?

- **Middy**: A stylish middleware framework for AWS Lambda that simplifies the development of serverless applications
- **middy-mcp**: A Middy middleware for Model Context Protocol (MCP) server integration with AWS Lambda functions that provides a convenient way to handle MCP requests and responses within your Lambda functions

## Features

- **Natural Language Task Management**: Create, update, and manage tasks through AI conversation
- **MCP Compliant**: Adheres to the Model Context Protocol specification
- **Serverless Architecture**: Runs on AWS Lambda for automatic scaling and cost efficiency
- **Middy Framework**: Leverages Middy middleware for clean, maintainable Lambda functions
- **Easy Integration**: Compatible with Claude Desktop, Cursor, and other MCP-enabled applications
- **AWS Native**: Built for seamless integration with AWS services
- **Extensible**: Built on a flexible architecture for custom task workflows

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- AWS CLI configured with appropriate credentials (for deployment)
- An AWS account (for Lambda deployment)

## Installation

```bash
# Clone the repository
git clone https://github.com/anthony-ism/riz-mAIstro-task-server.git
cd riz-mAIstro-task-server

# Install dependencies
npm install
```

## Local Development

### Running Locally

For local development and testing, you can run the MCP server:

```bash
# Start the development server
npm run dev
```

## Testing and troubleshooting
```bash
   npx @modelcontextprotocol/inspector
```


## AWS Lambda Deployment

This server is designed to be deployed as AWS Lambda functions. Use the companion CDK project for infrastructure deployment:
https://github.com/anthony-ism/riz-mAIstro-task-server-cdk.git

### MCP Client Configuration

To use this server with MCP-enabled applications:

#### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "riz-mAIstro-task-server": {
      "command": "node",
      "args": ["/path/to/riz-mAIstro-task-server/index.js"]
    }
  }
}
```

#### For AWS Lambda Deployment

If deployed to AWS Lambda, configure your MCP client to connect to the Lambda function endpoint:

```json
{
  "mcpServers": {
    "riz-mAIstro-task-server": {
      "url": "https://your-lambda-endpoint.amazonaws.com/mcp"
    }
  }
}
```

## Usage

Once connected to an MCP client, you can interact with the task server through natural language: Examples can include.
- **Create tasks**: "Create a task to review the quarterly report"
- **List tasks**: "Show me all my pending tasks"
- **Update tasks**: "Mark the presentation task as completed"
- **Search tasks**: "Find tasks related to the product launch"
- **Set deadlines**: "Set the deadline for the budget review to next Friday"

## Related Projects

- [riz-mAIstro Task Server CDK](https://github.com/anthony-ism/riz-mAIstro-task-server-cdk) - AWS infrastructure for deploying this server
- [middy-mcp](https://github.com/fredericbarthelet/middy-mcp) - The Middy middleware used to build this MCP server
- [Middy](https://github.com/middyjs/middy) - The core middleware framework for AWS Lambda
- [Model Context Protocol](https://github.com/modelcontextprotocol) - Official MCP repositories
- [Task mAIstro](https://github.com/langchain-ai/task_mAIstro) - AI-powered task management agent

## Acknowledgments

- Built with [Middy](https://middy.js.org/) middleware framework for AWS Lambda
- Powered by [middy-mcp](https://github.com/fredericbarthelet/middy-mcp) for MCP integration
- Based on the [Model Context Protocol](https://modelcontextprotocol.io/) standard
- Inspired by the growing ecosystem of AI-assisted productivity tools
