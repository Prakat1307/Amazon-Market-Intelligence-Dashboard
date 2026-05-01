from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from scraper import run_scraper

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "dataset.json"

@app.get("/api/data")
def get_data():
    from scraper import generate_mock_data
    return generate_mock_data()

@app.post("/api/scrape")
def trigger_scrape():
    success = run_scraper()
    if success:
        return {"status": "success", "message": "Scraping completed and dataset updated."}
    return {"status": "error", "message": "Scraping failed."}
