import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import mcpMiddleware from 'middy-mcp';
import { createMcpServer } from './server/index.js';

// Create the MCP server with all task tools
const server = createMcpServer();

// Export Lambda handler with middleware
export const handler = middy()
  .use(mcpMiddleware({ server }))
  .use(httpErrorHandler());