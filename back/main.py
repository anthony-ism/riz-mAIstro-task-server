from fastmcp import FastMCP
import boto3
import os
import uuid
from datetime import datetime
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()
mcp = FastMCP("Task")

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
task_table = dynamodb.Table(os.environ.get('TASK_TABLE_NAME', 'TaskTable'))

@mcp.tool()
def create_task(
    task: str,
    time_to_complete: Optional[int] = None,
    deadline: Optional[str] = None,
    solutions: Optional[List[str]] = None,
    status: Optional[str] = "not started"
) -> str:
    """Create a new task.
    
    Args:
        task: The task to be completed.
        time_to_complete: Estimated time to complete the task (minutes).
        deadline: When the task needs to be completed by (ISO format).
        solutions: List of specific, actionable solutions.
        status: Current status of the task (not started, in progress, done, archived).
    """
    try:
        task_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        task_item = {
            "id": task_id,
            "created_at": timestamp,
            "updated_at": timestamp,
            "task": task,
            "status": status
        }
        
        if time_to_complete is not None:
            task_item["time_to_complete"] = time_to_complete
        
        if deadline is not None:
            task_item["deadline"] = deadline
        
        if solutions is not None:
            task_item["solutions"] = solutions
        
        task_table.put_item(Item=task_item)
        
        return f"Task created successfully with ID: {task_id}"
    except Exception as e:
        return f"Error creating task: {str(e)}"

@mcp.tool()
def get_task(task_id: str) -> str:
    """Get a task by ID.
    
    Args:
        task_id: The ID of the task to retrieve.
    """
    try:
        response = task_table.get_item(Key={"id": task_id})
        task = response.get("Item")
        
        if not task:
            return f"Task not found with ID: {task_id}"
        
        return str(task)
    except Exception as e:
        return f"Error getting task: {str(e)}"

@mcp.tool()
def update_task(
    task_id: str,
    task: Optional[str] = None,
    time_to_complete: Optional[int] = None,
    deadline: Optional[str] = None,
    solutions: Optional[List[str]] = None,
    status: Optional[str] = None
) -> str:
    """Update an existing task.
    
    Args:
        task_id: The ID of the task to update.
        task: The task to be completed.
        time_to_complete: Estimated time to complete the task (minutes).
        deadline: When the task needs to be completed by (ISO format).
        solutions: List of specific, actionable solutions.
        status: Current status of the task.
    """
    try:
        # Check if task exists
        response = task_table.get_item(Key={"id": task_id})
        if "Item" not in response:
            return f"Task not found with ID: {task_id}"
        
        # Prepare update expression
        update_parts = []
        expression_values = {
            ":updated_at": datetime.utcnow().isoformat()
        }
        
        update_parts.append("updated_at = :updated_at")
        
        if task is not None:
            update_parts.append("#task_name = :task")
            expression_values[":task"] = task
        
        if time_to_complete is not None:
            update_parts.append("time_to_complete = :time")
            expression_values[":time"] = time_to_complete
        
        if deadline is not None:
            update_parts.append("deadline = :deadline")
            expression_values[":deadline"] = deadline
        
        if solutions is not None:
            update_parts.append("solutions = :solutions")
            expression_values[":solutions"] = solutions
        
        if status is not None:
            update_parts.append("#status_name = :status")
            expression_values[":status"] = status
        
        # Update in DynamoDB
        response = task_table.update_item(
            Key={"id": task_id},
            UpdateExpression="SET " + ", ".join(update_parts),
            ExpressionAttributeValues=expression_values,
            ExpressionAttributeNames={
                "#task_name": "task",
                "#status_name": "status"
            } if task is not None or status is not None else None,
            ReturnValues="ALL_NEW"
        )
        
        updated_task = response.get("Attributes", {})
        return f"Task updated successfully: {str(updated_task)}"
    except Exception as e:
        return f"Error updating task: {str(e)}"

@mcp.tool()
def delete_task(task_id: str) -> str:
    """Delete a task.
    
    Args:
        task_id: The ID of the task to delete.
    """
    try:
        task_table.delete_item(Key={"id": task_id})
        return f"Task deleted successfully: {task_id}"
    except Exception as e:
        return f"Error deleting task: {str(e)}"

@mcp.tool()
def list_tasks(status: Optional[str] = None, limit: Optional[int] = 50) -> str:
    """List all tasks or filter by status.
    
    Args:
        status: Filter tasks by status (not started, in progress, done, archived).
        limit: Maximum number of tasks to return.
    """
    try:
        if status:
            response = task_table.scan(
                FilterExpression="#status = :status",
                ExpressionAttributeNames={"#status": "status"},
                ExpressionAttributeValues={":status": status},
                Limit=limit
            )
        else:
            response = task_table.scan(Limit=limit)
        
        tasks = response.get("Items", [])
        return str({"tasks": tasks, "count": len(tasks)})
    except Exception as e:
        return f"Error listing tasks: {str(e)}"

mcp.run(transport="streamable-http", host="127.0.0.1", port=8001)
