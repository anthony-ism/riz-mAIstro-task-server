import { z } from 'zod';
import { TaskModel } from './task_model.mjs';

// Define reusable schemas
const TaskStatusSchema = z.enum(['not started', 'in progress', 'done', 'archived']);
const UUIDSchema = z.string().uuid('Invalid task ID format');
const TaskDescriptionSchema = z.string().min(1, 'Task description cannot be empty').max(500, 'Task description too long');
const TimeToCompleteSchema = z.number().positive('Time to complete must be positive').max(10080, 'Time cannot exceed a week in minutes'); // Max 1 week in minutes
const DeadlineSchema = z.string().datetime('Invalid deadline format - use ISO 8601 format');
const SolutionsSchema = z.array(z.string().min(1, 'Solution cannot be empty')).max(10, 'Too many solutions - maximum 10 allowed');
const LimitSchema = z.number().positive().max(100, 'Limit cannot exceed 100').default(50);

export const taskTools = {
  // Create task tool
  createTask: {
    name: 'create_task',
    description: 'Create a new task with optional time estimate, deadline, and solutions',
    inputSchema: z.object({
      task: TaskDescriptionSchema,
      time_to_complete: TimeToCompleteSchema.optional(),
      deadline: DeadlineSchema.optional(),
      solutions: SolutionsSchema.optional(),
      status: TaskStatusSchema.optional().default('not started')
    }),
    handler: async ({ task, time_to_complete, deadline, solutions, status }) => {
      try {
        // Additional validation for deadline
        if (deadline) {
          const deadlineDate = new Date(deadline);
          const now = new Date();
          if (deadlineDate <= now) {
            return {
              content: [{ 
                type: 'text', 
                text: JSON.stringify({
                  error: 'Deadline must be in the future',
                  provided_deadline: deadline
                }, null, 2)
              }]
            };
          }
        }

        const result = await TaskModel.createTask({
          task: task.trim(),
          time_to_complete,
          deadline,
          solutions,
          status: status || 'not started'
        });
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              ...result
            }, null, 2) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: error.message,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }
    }
  },

  // Get task tool
  getTask: {
    name: 'get_task',
    description: 'Retrieve a specific task by its unique identifier',
    inputSchema: z.object({
      task_id: UUIDSchema
    }),
    handler: async ({ task_id }) => {
      try {
        const task = await TaskModel.getTask(task_id);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              task
            }, null, 2) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: error.message,
              task_id,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }
    }
  },

  // Update task tool
  updateTask: {
    name: 'update_task',
    description: 'Update an existing task with new information',
    inputSchema: z.object({
      task_id: UUIDSchema,
      task: TaskDescriptionSchema.optional(),
      time_to_complete: TimeToCompleteSchema.optional(),
      deadline: DeadlineSchema.optional(),
      solutions: SolutionsSchema.optional(),
      status: TaskStatusSchema.optional()
    }).refine(
      (data) => {
        // Ensure at least one field is being updated
        const { task_id, ...updates } = data;
        return Object.keys(updates).length > 0;
      },
      {
        message: "At least one field must be provided for update",
        path: []
      }
    ),
    handler: async ({ task_id, task, time_to_complete, deadline, solutions, status }) => {
      try {
        // Additional validation for deadline
        if (deadline) {
          const deadlineDate = new Date(deadline);
          const now = new Date();
          if (deadlineDate <= now) {
            return {
              content: [{ 
                type: 'text', 
                text: JSON.stringify({
                  success: false,
                  error: 'Deadline must be in the future',
                  provided_deadline: deadline,
                  task_id
                }, null, 2)
              }]
            };
          }
        }

        const updates = {};
        if (task !== undefined) updates.task = task.trim();
        if (time_to_complete !== undefined) updates.time_to_complete = time_to_complete;
        if (deadline !== undefined) updates.deadline = deadline;
        if (solutions !== undefined) updates.solutions = solutions;
        if (status !== undefined) updates.status = status;

        const result = await TaskModel.updateTask(task_id, updates);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              task_id,
              ...result
            }, null, 2) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: error.message,
              task_id,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }
    }
  },

  // Delete task tool
  deleteTask: {
    name: 'delete_task',
    description: 'Permanently delete a task from the system',
    inputSchema: z.object({
      task_id: UUIDSchema
    }),
    handler: async ({ task_id }) => {
      try {
        const result = await TaskModel.deleteTask(task_id);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              message: result.message,
              task_id,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: error.message,
              task_id,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }
    }
  },

  // List tasks tool
  listTasks: {
    name: 'list_tasks',
    description: 'Retrieve a list of tasks, optionally filtered by status',
    inputSchema: z.object({
      status: TaskStatusSchema.optional(),
      limit: LimitSchema
    }),
    handler: async ({ status, limit }) => {
      try {
        const result = await TaskModel.listTasks(status, limit);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              filter: status ? { status } : 'none',
              limit,
              ...result,
              timestamp: new Date().toISOString()
            }, null, 2) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: error.message,
              filter: status ? { status } : 'none',
              limit,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }
    }
  },
};