import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { taskTools } from '../src/task_tools.mjs';
import { TaskModel } from '../src/task_model.mjs';

// Mock the TaskModel
vi.mock('../src/task_model.mjs', () => ({
  TaskModel: {
    createTask: vi.fn(),
    getTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    listTasks: vi.fn()
  }
}));

describe('Task Tools Happy Path Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current time to ensure consistent deadline validation
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createTask', () => {
    it('should create a task with minimal required fields', async () => {
      const mockResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        task: 'Complete project documentation',
        status: 'not started',
        created_at: '2024-01-15T10:00:00Z'
      };

      TaskModel.createTask.mockResolvedValue(mockResult);

      const result = await taskTools.createTask.handler({
        task: 'Complete project documentation'
      });

      expect(TaskModel.createTask).toHaveBeenCalledWith({
        task: 'Complete project documentation',
        time_to_complete: undefined,
        deadline: undefined,
        solutions: undefined,
        status: 'not started'
      });

      expect(result.content[0].text).toBe(JSON.stringify({
        success: true,
        ...mockResult
      }, null, 2));
    });

    it('should create a task with all optional fields', async () => {
      const mockResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        task: 'Design user interface',
        time_to_complete: 120,
        deadline: '2024-01-20T15:00:00Z',
        solutions: ['Use Figma', 'Create wireframes first'],
        status: 'in progress',
        created_at: '2024-01-15T10:00:00Z'
      };

      TaskModel.createTask.mockResolvedValue(mockResult);

      const result = await taskTools.createTask.handler({
        task: 'Design user interface',
        time_to_complete: 120,
        deadline: '2024-01-20T15:00:00Z',
        solutions: ['Use Figma', 'Create wireframes first'],
        status: 'in progress'
      });

      expect(TaskModel.createTask).toHaveBeenCalledWith({
        task: 'Design user interface',
        time_to_complete: 120,
        deadline: '2024-01-20T15:00:00Z',
        solutions: ['Use Figma', 'Create wireframes first'],
        status: 'in progress'
      });

      expect(result.content[0].text).toBe(JSON.stringify({
        success: true,
        ...mockResult
      }, null, 2));
    });

    it('should trim whitespace from task description', async () => {
      const mockResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        task: 'Write unit tests',
        status: 'not started',
        created_at: '2024-01-15T10:00:00Z'
      };

      TaskModel.createTask.mockResolvedValue(mockResult);

      await taskTools.createTask.handler({
        task: '  Write unit tests  '
      });

      expect(TaskModel.createTask).toHaveBeenCalledWith({
        task: 'Write unit tests',
        time_to_complete: undefined,
        deadline: undefined,
        solutions: undefined,
        status: 'not started'
      });
    });
  });

  describe('getTask', () => {
    it('should retrieve a task by ID', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        task: 'Review code changes',
        status: 'in progress',
        time_to_complete: 60,
        deadline: '2024-01-16T17:00:00Z',
        solutions: ['Use GitHub PR review'],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T11:30:00Z'
      };

      TaskModel.getTask.mockResolvedValue(mockTask);

      const result = await taskTools.getTask.handler({
        task_id: '123e4567-e89b-12d3-a456-426614174000'
      });

      expect(TaskModel.getTask).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result.content[0].text).toBe(JSON.stringify({
        success: true,
        task: mockTask
      }, null, 2));
    });
  });

  describe('updateTask', () => {
    it('should update a single field', async () => {
      const mockResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        task: 'Updated task description',
        status: 'in progress',
        updated_at: '2024-01-15T12:00:00Z'
      };

      TaskModel.updateTask.mockResolvedValue(mockResult);

      const result = await taskTools.updateTask.handler({
        task_id: '123e4567-e89b-12d3-a456-426614174000',
        task: 'Updated task description'
      });

      expect(TaskModel.updateTask).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { task: 'Updated task description' }
      );

      expect(result.content[0].text).toBe(JSON.stringify({
        success: true,
        task_id: '123e4567-e89b-12d3-a456-426614174000',
        ...mockResult
      }, null, 2));
    });

    it('should update multiple fields', async () => {
      const mockResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        task: 'Implement new feature',
        status: 'done',
        time_to_complete: 240,
        solutions: ['Use React hooks', 'Add unit tests'],
        updated_at: '2024-01-15T12:00:00Z'
      };

      TaskModel.updateTask.mockResolvedValue(mockResult);

      const result = await taskTools.updateTask.handler({
        task_id: '123e4567-e89b-12d3-a456-426614174000',
        task: 'Implement new feature',
        status: 'done',
        time_to_complete: 240,
        solutions: ['Use React hooks', 'Add unit tests']
      });

      expect(TaskModel.updateTask).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          task: 'Implement new feature',
          status: 'done',
          time_to_complete: 240,
          solutions: ['Use React hooks', 'Add unit tests']
        }
      );

      expect(result.content[0].text).toBe(JSON.stringify({
        success: true,
        task_id: '123e4567-e89b-12d3-a456-426614174000',
        ...mockResult
      }, null, 2));
    });

    it('should update with future deadline', async () => {
      const mockResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        deadline: '2024-01-25T15:00:00Z',
        updated_at: '2024-01-15T12:00:00Z'
      };

      TaskModel.updateTask.mockResolvedValue(mockResult);

      const result = await taskTools.updateTask.handler({
        task_id: '123e4567-e89b-12d3-a456-426614174000',
        deadline: '2024-01-25T15:00:00Z'
      });

      expect(TaskModel.updateTask).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { deadline: '2024-01-25T15:00:00Z' }
      );

      expect(result.content[0].text).toBe(JSON.stringify({
        success: true,
        task_id: '123e4567-e89b-12d3-a456-426614174000',
        ...mockResult
      }, null, 2));
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const mockResult = {
        message: 'Task deleted successfully'
      };

      TaskModel.deleteTask.mockResolvedValue(mockResult);

      const result = await taskTools.deleteTask.handler({
        task_id: '123e4567-e89b-12d3-a456-426614174000'
      });

      expect(TaskModel.deleteTask).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.success).toBe(true);
      expect(parsedResult.message).toBe('Task deleted successfully');
      expect(parsedResult.task_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(parsedResult.timestamp).toBe('2024-01-15T10:00:00.000Z');
    });
  });

  describe('listTasks', () => {
    it('should list all tasks with default limit', async () => {
      const mockTasks = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          task: 'Task 1',
          status: 'not started'
        },
        {
          id: '456e7890-e12b-34d5-a678-901234567890',
          task: 'Task 2',
          status: 'in progress'
        }
      ];

      const mockResult = {
        tasks: mockTasks,
        count: 2,
        total: 2
      };

      TaskModel.listTasks.mockResolvedValue(mockResult);

      const result = await taskTools.listTasks.handler({
        limit: 50
      });

      expect(TaskModel.listTasks).toHaveBeenCalledWith(undefined, 50);
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.success).toBe(true);
      expect(parsedResult.filter).toBe('none');
      expect(parsedResult.limit).toBe(50);
      expect(parsedResult.tasks).toEqual(mockTasks);
      expect(parsedResult.count).toBe(2);
      expect(parsedResult.timestamp).toBe('2024-01-15T10:00:00.000Z');
    });

    it('should list tasks filtered by status', async () => {
      const mockTasks = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          task: 'Completed task',
          status: 'done'
        }
      ];

      const mockResult = {
        tasks: mockTasks,
        count: 1,
        total: 5
      };

      TaskModel.listTasks.mockResolvedValue(mockResult);

      const result = await taskTools.listTasks.handler({
        status: 'done',
        limit: 20
      });

      expect(TaskModel.listTasks).toHaveBeenCalledWith('done', 20);
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.success).toBe(true);
      expect(parsedResult.filter).toEqual({ status: 'done' });
      expect(parsedResult.limit).toBe(20);
      expect(parsedResult.tasks).toEqual(mockTasks);
      expect(parsedResult.count).toBe(1);
    });

    it('should list tasks with custom limit', async () => {
      const mockResult = {
        tasks: [],
        count: 0,
        total: 0
      };

      TaskModel.listTasks.mockResolvedValue(mockResult);

      const result = await taskTools.listTasks.handler({
        limit: 10
      });

      expect(TaskModel.listTasks).toHaveBeenCalledWith(undefined, 10);
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.limit).toBe(10);
    });
  });
});