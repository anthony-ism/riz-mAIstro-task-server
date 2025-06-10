from fastapi import FastAPI
from mangum import Mangum
from fastapi_mcp import FastApiMCP

app = FastAPI()

@app.get("/api")
async def root():
    return {"message`": "Hello World!"}

mcp = FastApiMCP(app)

# Mount the MCP server directly to your FastAPI app
mcp.mount()
handler = Mangum(app)
