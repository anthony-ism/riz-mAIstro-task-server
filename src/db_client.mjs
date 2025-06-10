import AWS from 'aws-sdk';
import { config } from './config.mjs';

// Configure AWS
AWS.config.update({
  region: config.aws.region
});

// Create DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export default dynamoDb;