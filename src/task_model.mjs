import dynamoDb from './db_client.mjs';
import { config } from './config.mjs';
import { v4 as uuidv4 } from 'uuid';

const tableName = config.aws.taskTableName;

export class TaskModel {
  static async createTask({
    task,
    time_to_complete = null,
    deadline = null,
    solutions = null,
    status = "not started"
  }) {
    try {
      const taskId = uuidv4();
      const timestamp = new Date().toISOString();
      
      const taskItem = {
        id: taskId,
        created_at: timestamp,
        updated_at: timestamp,
        task: task,
        status: status
      };
      
      if (time_to_complete !== null) {
        taskItem.time_to_complete = time_to_complete;
      }
      
      if (deadline !== null) {
        taskItem.deadline = deadline;
      }
      
      if (solutions !== null) {
        taskItem.solutions = solutions;
      }
      
      const params = {
        TableName: tableName,
        Item: taskItem
      };

      await dynamoDb.put(params).promise();
      
      return {
        taskId,
        message: `Task created successfully with ID: ${taskId}`,
        task: taskItem
      };
    } catch (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }
  }

  static async getTask(taskId) {
    try {
      const params = {
        TableName: tableName,
        Key: { id: taskId }
      };

      const result = await dynamoDb.get(params).promise();
      
      if (!result.Item) {
        throw new Error(`Task not found with ID: ${taskId}`);
      }

      return result.Item;
    } catch (error) {
      throw new Error(`Error getting task: ${error.message}`);
    }
  }

  static async updateTask(taskId, updates) {
    try {
      // Check if task exists first
      const existingTask = await this.getTask(taskId);
      
      // Prepare update expression
      const updateParts = [];
      const expressionValues = {
        ":updated_at": new Date().toISOString()
      };
      const expressionNames = {};
      
      updateParts.push("updated_at = :updated_at");
      
      if (updates.task !== undefined) {
        updateParts.push("#task_name = :task");
        expressionValues[":task"] = updates.task;
        expressionNames["#task_name"] = "task";
      }
      
      if (updates.time_to_complete !== undefined) {
        updateParts.push("time_to_complete = :time");
        expressionValues[":time"] = updates.time_to_complete;
      }
      
      if (updates.deadline !== undefined) {
        updateParts.push("deadline = :deadline");
        expressionValues[":deadline"] = updates.deadline;
      }
      
      if (updates.solutions !== undefined) {
        updateParts.push("solutions = :solutions");
        expressionValues[":solutions"] = updates.solutions;
      }
      
      if (updates.status !== undefined) {
        updateParts.push("#status_name = :status");
        expressionValues[":status"] = updates.status;
        expressionNames["#status_name"] = "status";
      }
      
      // Update in DynamoDB
      const params = {
        Key: { id: taskId },
        TableName: tableName,
        UpdateExpression: "SET " + updateParts.join(", "),
        ExpressionAttributeValues: expressionValues,
        ReturnValues: "ALL_NEW"
      };

      // Only add ExpressionAttributeNames if we have reserved words
      if (Object.keys(expressionNames).length > 0) {
        params.ExpressionAttributeNames = expressionNames;
      }
      
      const result = await dynamoDb.update(params).promise();
      
      return {
        message: "Task updated successfully",
        task: result.Attributes
      };
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  }

  static async deleteTask(taskId) {
    try {
      // Check if task exists first
      await this.getTask(taskId);
      
      const params = {
        TableName: tableName,
        Key: { id: taskId }
      };

      await dynamoDb.delete(params).promise();
      
      return {
        message: `Task deleted successfully: ${taskId}`
      };
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  static async listTasks(status = null, limit = 50) {
    try {
      let params = {
        TableName: tableName,
        Limit: limit
      };

      if (status) {
        params.FilterExpression = "#status = :status";
        params.ExpressionAttributeNames = { "#status": "status" };
        params.ExpressionAttributeValues = { ":status": status };
      }

      const result = await dynamoDb.scan(params).promise();
      
      return {
        tasks: result.Items || [],
        count: result.Items ? result.Items.length : 0
      };
    } catch (error) {
      throw new Error(`Error listing tasks: ${error.message}`);
    }
  }
}