from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
import json
from pydantic import BaseModel
from typing import List
from datetime import datetime
from ciro_graph import ciro_app, CIROState

app = FastAPI(title="CIRO Mock Data API", description="Serving synthetic crisis signals")

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Load the synthetic data into memory
try:
    with open("crisis_synthetic_data.json", "r") as f:
        mock_data = json.load(f)
except FileNotFoundError:
    print("Error: crisis_synthetic_data.json not found. Make sure it is in the same directory.")
    mock_data = {"tweets": [], "weather_snapshots": [], "traffic_snapshots": []}

@app.get("/")
def read_root():
    return {"message": "CIRO Mock Data Server is running."}

@app.get("/api/v1/social")
def get_social_signals():
    """Returns social media signals without the cheat codes."""
    tweets = mock_data.get("tweets", [])
    cleaned_tweets = []
    
    for tweet in tweets:
        tweet_copy = tweet.copy()
        # MENTOR ENFORCEMENT: Remove the answer key so the agent has to think
        tweet_copy.pop("crisis_relevance", None) 
        cleaned_tweets.append(tweet_copy)
        
    return {"status": "success", "count": len(cleaned_tweets), "data": cleaned_tweets}

@app.get("/api/v1/weather")
def get_weather_signals():
    """Returns weather API snapshots."""
    return {"status": "success", "data": mock_data.get("weather_snapshots", [])}

@app.get("/api/v1/traffic")
def get_traffic_signals():
    """Returns traffic API snapshots."""
    # If the dispatcher has closed roads, return an improved traffic scenario
    if active_system_state["closed_roads"]:
        improved_snapshot = {
            "snapshot_id": "TS-POST-CLOSURE",
            "timestamp": datetime.now().isoformat() + "Z",
            "road_segment": "Srinagar Highway / Kashmir Highway",
            "average_speed_kmh": 28.4,
            "congestion_level": 3,
            "congestion_label": "light"
        }
        return {"status": "success", "data": [improved_snapshot]}
    else:
        # Return the original gridlock scenario (the one with 3.8 km/h)
        snapshots = mock_data.get("traffic_snapshots", [])
        crisis_snapshot = next((s for s in snapshots if s.get("average_speed_kmh", 100) <= 5.0), snapshots[-1] if snapshots else {})
        return {"status": "success", "data": [crisis_snapshot]}

# --- The Mock City Infrastructure State ---
active_system_state = {
    "closed_roads": [],
    "active_alerts": []
}

# --- The Expected Payload Schema ---
class Coordinate(BaseModel):
    lat: float
    lng: float

class ExecutionPayload(BaseModel):
    action_id: str
    action_type: str
    target_name: str
    status: str
    hazard_boundary: List[Coordinate]
    initiate_reroute: bool
    public_alert_payload: str

# --- The Execution Endpoint ---
@app.post("/api/v1/system/execute")
def execute_system_action(payload: ExecutionPayload):
    """Receives the AI's command and alters the city's state."""
    
    # 1. Update the backend state
    active_system_state["closed_roads"].append(payload.target_name)
    active_system_state["active_alerts"].append(payload.public_alert_payload)
    
    # 2. Print a massive alert in the terminal so you know it worked
    print("\n" + "="*50)
    print("[CRITICAL] INFRASTRUCTURE UPDATE INITIATED [CRITICAL]")
    print(f"TARGET: {payload.target_name}")
    print(f"ACTION: {payload.action_type}")
    print(f"ALERT BROADCAST: {payload.public_alert_payload}")
    print("="*50 + "\n")
    
    return {
        "status": "success", 
        "message": f"State updated for {payload.target_name}",
        "current_city_state": active_system_state
    }

# --- Live Streaming WebSocket & Graph Trigger ---
@app.websocket("/ws/trace")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def run_and_stream_graph():
    initial_state = CIROState(
        raw_social_data=[], 
        social_evaluation=None, 
        sensor_evaluation=None,
        final_action_plan=None,
        traffic_before=None,
        traffic_after=None,
        validation_report=None
    )
    
    # Broadcast start
    await manager.broadcast(f"[{datetime.now().strftime('%H:%M:%S')}] 🚀 INITIATING CIRO MULTI-AGENT WORKFLOW...")
    
    async for event in ciro_app.astream(initial_state):
        node_name = list(event.keys())[0]
        state_data = list(event.values())[0]
        time_str = datetime.now().strftime('%H:%M:%S')
        
        if node_name == "social_watcher":
            soc_eval = state_data.get("social_evaluation")
            if soc_eval:
                msg = f"[{time_str}] 🕵️ Social Watcher → analyzed stream, confidence {soc_eval.confidence_score}/10"
                await manager.broadcast(msg)
                
        elif node_name == "sensor_watcher":
            sen_eval = state_data.get("sensor_evaluation")
            if sen_eval:
                msg = f"[{time_str}] 📡 Sensor Watcher → {sen_eval.justification}"
                await manager.broadcast(msg)
                
        elif node_name == "synthesizer":
            plan = state_data.get("final_action_plan")
            if plan and plan.crisis_confirmed:
                zones = ", ".join(plan.target_zones)
                msg = f"[{time_str}] 🧠 Synthesizer → CONFIRMED: urban crisis in {zones}, severity {plan.severity_level}"
                await manager.broadcast(msg)
            elif plan:
                await manager.broadcast(f"[{time_str}] 🧠 Synthesizer → System Normal. No crisis verified.")
                
        elif node_name == "dispatcher":
            msg = f"[{time_str}] 🦾 Dispatcher → executing actions... Road closure posted."
            await manager.broadcast(msg)
            
        elif node_name == "monitor":
            report = state_data.get("validation_report")
            if report:
                msg = f"[{time_str}] 📊 Monitor Agent → {report}"
                await manager.broadcast(msg)

    await manager.broadcast(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Workflow Complete.")

@app.post("/api/v1/system/trigger_graph")
async def trigger_graph(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_and_stream_graph)
    return {"status": "success", "message": "Graph execution started in the background."}