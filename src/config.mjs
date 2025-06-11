import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  aws: {
    region: process.env.AWS_REGION,
    taskTableName: process.env.TASK_TABLE_NAME
  },
  server: {
    name: 'Task MCP Server',
    version: '1.0.0',
  }
};

