import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
export const config = {
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    taskTableName: process.env.TASK_TABLE_NAME
  },
  server: {
    name: 'Task MCP Server',
    version: '1.0.0',
  }
};

if (!config.aws.taskTableName) {
  throw new Error('TASK_TABLE_NAME environment variable is required');
}


