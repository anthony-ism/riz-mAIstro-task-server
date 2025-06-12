import { z } from 'zod';
import { TaskModel } from './task_model.mjs';

export const taskTools = {
  // Create task tool
  createTask: {
    name: 'create_task',
    description: 'Create a new task',
    inputSchema: {
      task: z.string().describe('The task to be completed'),
      time_to_complete: z.number().optional().describe('Estimated time to complete the task (minutes)'),
      deadline: z.string().optional().describe('When the task needs to be completed by (ISO format)'),
      solutions: z.array(z.string()).optional().describe('List of specific, actionable solutions'),
      status: z.enum(['not started', 'in progress', 'done', 'archived']).optional().default('not started').describe('Current status of the task')
    },
    handler: async ({ task, time_to_complete, deadline, solutions, status }) => {
      try {
        const result = await TaskModel.createTask({
          task,
          time_to_complete,
          deadline,
          solutions,
          status
        });
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(result, null, 2) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: error.message 
          }]
        };
      }
    }
  },

  // Get task tool
  getTask: {
    name: 'get_task',
    description: 'Get a task by ID',
    inputSchema: {
      task_id: z.string().describe('The ID of the task to retrieve')
    },
    handler: async ({ task_id }) => {
      try {
        const task = await TaskModel.getTask(task_id);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(task, null, 2) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: error.message 
          }]
        };
      }
    }
  },

  // Update task tool
  updateTask: {
    name: 'update_task',
    description: 'Update an existing task',
    inputSchema: {
      task_id: z.string().describe('The ID of the task to update'),
      task: z.string().optional().describe('The task to be completed'),
      time_to_complete: z.number().optional().describe('Estimated time to complete the task (minutes)'),
      deadline: z.string().optional().describe('When the task needs to be completed by (ISO format)'),
      solutions: z.array(z.string()).optional().describe('List of specific, actionable solutions'),
      status: z.enum(['not started', 'in progress', 'done', 'archived']).optional().describe('Current status of the task')
    },
    handler: async ({ task_id, task, time_to_complete, deadline, solutions, status }) => {
      try {
        const updates = {};
        if (task !== undefined) updates.task = task;
        if (time_to_complete !== undefined) updates.time_to_complete = time_to_complete;
        if (deadline !== undefined) updates.deadline = deadline;
        if (solutions !== undefined) updates.solutions = solutions;
        if (status !== undefined) updates.status = status;

        const result = await TaskModel.updateTask(task_id, updates);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              task_id,
              ...result
            }, null, 2) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: error.message 
          }]
        };
      }
    }
  },

  // Delete task tool
  deleteTask: {
    name: 'delete_task',
    description: 'Delete a task',
    inputSchema: {
      task_id: z.string().describe('The ID of the task to delete')
    },
    handler: async ({ task_id }) => {
      try {
        const result = await TaskModel.deleteTask(task_id);
        
        return {
          content: [{ 
            type: 'text', 
            text: result.message 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: error.message 
          }]
        };
      }
    }
  },

  // List tasks tool
  listTasks: {
    name: 'list_tasks',
    description: 'List all tasks or filter by status',
    inputSchema: {
      status: z.enum(['not started', 'in progress', 'done', 'archived']).optional().describe('Filter tasks by status'),
      limit: z.number().optional().default(50).describe('Maximum number of tasks to return')
    },
    handler: async ({ status, limit }) => {
      try {
        const result = await TaskModel.listTasks(status, limit);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(result, null, 2) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: error.message 
          }]
        };
      }
    }
  }
};