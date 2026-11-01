
from fastapi import FastAPI

from app.api.scheduling import router as scheduling_router
from app.api.dataset import router as dataset_router


app = FastAPI(
    title="Campus Scheduler Service",
    description="AI-assisted timetable generation and optimization",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "success": True,
        "message": "Campus Scheduler Service is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "scheduler"
    }


# Register both routers
app.include_router(scheduling_router)
app.include_router(dataset_router)
