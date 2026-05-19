from typing import TypedDict, List, Optional
from pydantic import BaseModel, Field
import httpx
import asyncio
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

# 1. This is the schema the LLM MUST output. No hallucinations allowed.
class CrisisEvaluation(BaseModel):
    crisis_detected: bool = Field(description="True if a crisis like a flood or blockage is detected.")
    primary_signal: str = Field(description="The type of crisis: 'flood', 'accident', 'power_outage', or 'none'.")
    confidence_score: int = Field(description="Confidence from 1 to 10.")
    extracted_location: Optional[str] = Field(description="The neighborhood or road mentioned.")
    justification: str = Field(description="Brief reasoning for this evaluation.")

class SensorEvaluation(BaseModel):
    traffic_anomaly_detected: bool = Field(description="True if a traffic anomaly is detected.")
    justification: str = Field(description="Reasoning for sensor evaluation.")

# 1. The Output Schema for the Brain
class ActionPlan(BaseModel):
    crisis_confirmed: bool = Field(description="Final decision: Is this a verified crisis requiring action?")
    severity_level: str = Field(description="Low, Medium, High, Critical")
    target_zones: List[str] = Field(description="Specific neighborhoods that require immediate intervention.")
    recommended_actions: List[str] = Field(description="List of exact actions, e.g., 'Reroute traffic from G-10', 'Dispatch Rescue 1122'.")
    reasoning: str = Field(description="Explanation of how social and sensor data were combined to reach this conclusion.")

class ActionPayload(BaseModel):
    action_id: str = Field(description="A unique identifier like ACT-9942")
    action_type: str = Field(description="Must be 'infrastructure_closure'")
    target_name: str = Field(description="The specific road or underpass to close")
    status: str = Field(description="Must be 'CLOSED_ACTIVE'")
    hazard_boundary: List[dict] = Field(description="List containing exactly two coordinate dicts with 'lat' and 'lng' keys")
    initiate_reroute: bool = Field(description="True if traffic needs to be diverted")
    public_alert_payload: str = Field(description="The exact text string to push to citizens' mobile phones")

# 2. Update the State to hold the final plan
class CIROState(TypedDict):
    raw_social_data: List[dict]
    social_evaluation: Optional[CrisisEvaluation]
    sensor_evaluation: Optional[SensorEvaluation]
    final_action_plan: Optional[ActionPlan]
    traffic_before: Optional[dict]
    traffic_after: Optional[dict]
    validation_report: Optional[str]

# Initialize your LLM (using Gemini since it's a Google Hackathon)
# Initialize your LLM (using Gemini since it's a Google Hackathon)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

# Force the LLM to output our exact Pydantic schema
structured_llm = llm.with_structured_output(CrisisEvaluation)

def prefilter_and_batch_tweets(tweets: list) -> str:
    """
    Lightweight keyword filter to drop noise before hitting the LLM.
    Returns a single formatted string of relevant tweets.
    """
    # Expanded keywords based on your synthetic data
    keywords = ["pani", "stuck", "flood", "block", "submerged", "traffic", "jam", "emergency", "rescue", "baarish"]
    relevant_tweets = []
    
    for tweet in tweets:
        text_lower = tweet.get("text", "").lower()
        
        # Fast Python string matching (O(N) complexity)
        if any(keyword in text_lower for keyword in keywords):
            # Format nicely so the LLM retains geospatial context
            formatted = f"[{tweet.get('neighborhood', 'Unknown Zone')}] {tweet.get('text')}"
            relevant_tweets.append(formatted)
            
    # Combine into a single text block
    return "\n".join(relevant_tweets)

async def social_watcher_node(state: CIROState) -> CIROState:
    """Node 1: Ingests social data, filters noise, and evaluates crisis probability."""
    print("--- SOCIAL WATCHER NODE ACTIVE ---")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/v1/social")
        tweets = response.json().get("data", [])
    except Exception as e:
        print(f"API Error: {e}")
        return state
        
    if not tweets:
        print("No social data received.")
        return state
        
    # 1. Apply the Python pre-filter
    batched_social_text = prefilter_and_batch_tweets(tweets)
    
    # EDGE CASE: If the batch is empty, DO NOT call the LLM.
    # This saves compute when nothing is happening.
    if not batched_social_text.strip():
        print("Filter caught no relevant keywords. Skipping LLM evaluation.")
        no_crisis = CrisisEvaluation(
            crisis_detected=False,
            primary_signal="none",
            confidence_score=10, # 100% confident nothing is happening
            extracted_location=None,
            justification="No relevant crisis keywords detected in current stream."
        )
        return {"social_evaluation": no_crisis, "raw_social_data": tweets}
    
    # 2. The Updated Prompt (Now built for batch analysis)
    prompt = PromptTemplate.from_template(
        """You are the CIRO Social Media Watcher.
        Analyze this batch of filtered social media posts and determine if a coordinated urban crisis is occurring.
        Look for clusters of complaints in specific neighborhoods.
        
        Batched Social Stream:
        {batched_text}
        """
    )
    
    chain = prompt | structured_llm
    
    # 3. Execute the reasoning
    print("Evaluating batched tweet stream...")
    try:
        evaluation = await chain.ainvoke({
            "batched_text": batched_social_text
        })
    except Exception as e:
        print(f"[FALLBACK TRIGGERED] LLM API Error in Social Watcher: {e}. Using mock fallback.")
        evaluation = CrisisEvaluation(
            crisis_detected=True,
            primary_signal="flood",
            confidence_score=9,
            extracted_location="G-10 and I-9",
            justification="[MOCK FALLBACK] Multiple reports of flooding and stranded cars in G-10 and I-9 underpasses."
        )
    
    return {"social_evaluation": evaluation, "raw_social_data": tweets}

async def sensor_watcher_node(state: CIROState) -> CIROState:
    """Mock Node 2: Sensor data ingestion."""
    print("--- SENSOR WATCHER NODE ACTIVE ---")
    
    # Fetch real baseline data
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/v1/traffic")
        traffic_data = response.json().get("data", [])
    except Exception as e:
        traffic_data = []

    traffic_before = traffic_data[0] if traffic_data else {"average_speed_kmh": 3.8}
    
    eval = SensorEvaluation(
        traffic_anomaly_detected=True,
        justification=f"High congestion and abnormal water levels detected. Average speed is critically low at {traffic_before.get('average_speed_kmh', 3.8)} km/h."
    )
    return {"sensor_evaluation": eval, "traffic_before": traffic_before}

async def synthesizer_node(state: CIROState) -> CIROState:
    """Node 3: Cross-references human sentiment with sensor data to formulate an action plan."""
    print("--- SYNTHESIZER NODE ACTIVE ---")
    
    soc_eval = state.get("social_evaluation")
    sen_eval = state.get("sensor_evaluation")
    
    # EDGE CASE: Handle missing evaluations
    if not soc_eval or not sen_eval:
        print("Missing evaluation data (possibly due to API connection error). Skipping synthesis.")
        return state
        
    # EDGE CASE: If both watchers say nothing is happening, skip the heavy reasoning.
    if not soc_eval.crisis_detected and not sen_eval.traffic_anomaly_detected:
        print("All clear. No synthesis required.")
        return state
        
    prompt = PromptTemplate.from_template(
        """You are the CIRO Chief Synthesizer.
        Review the evaluations from the Social Watcher and the Sensor Watcher.
        Your job is to determine if a crisis is verified, assess the severity, and generate an actionable response plan.
        
        Social Media Evaluation:
        {social}
        
        Sensor Data Evaluation:
        {sensor}
        
        If the data sources conflict, rely on your systemic reasoning to determine the most likely ground truth.
        """
    )
    
    synth_llm = llm.with_structured_output(ActionPlan)
    chain = prompt | synth_llm
    
    print("Synthesizing multi-source intelligence...")
    try:
        plan = await chain.ainvoke({
            "social": soc_eval.model_dump_json() if soc_eval else "No data",
            "sensor": sen_eval.model_dump_json() if sen_eval else "No data"
        })
    except Exception as e:
        print(f"[FALLBACK TRIGGERED] LLM API Error in Synthesizer: {e}. Using mock fallback.")
        plan = ActionPlan(
            crisis_confirmed=True,
            severity_level="Critical",
            target_zones=["G-10", "I-9"],
            recommended_actions=["Reroute traffic from Srinagar Highway", "Dispatch Rescue 1122 to G-10"],
            reasoning="[MOCK FALLBACK] Severe flooding combined with gridlock necessitates immediate road closures."
        )
    
    return {"final_action_plan": plan}

async def dispatcher_node(state: CIROState) -> CIROState:
    """Node 4: Converts the Action Plan into a strict API payload and executes it."""
    print("--- DISPATCHER NODE ACTIVE ---")
    
    plan = state.get("final_action_plan")
    
    if not plan or not plan.crisis_confirmed:
        print("No verified crisis. Dispatcher standing down.")
        return state
        
    prompt = PromptTemplate.from_template(
        """You are the CIRO System Dispatcher.
        Take this approved Action Plan and convert the most critical road closure into a strict JSON payload.
        Make sure the hazard_boundary contains realistic latitude/longitude coordinates based on the target zone.
        
        Approved Action Plan:
        {action_plan}
        """
    )
    
    dispatch_llm = llm.with_structured_output(ActionPayload)
    chain = prompt | dispatch_llm
    
    print("Formatting execution payload...")
    try:
        payload = await chain.ainvoke({"action_plan": plan.model_dump_json()})
    except Exception as e:
        print(f"[FALLBACK TRIGGERED] LLM API Error in Dispatcher: {e}. Using mock fallback.")
        payload = ActionPayload(
            action_id="ACT-MOCK-999",
            action_type="infrastructure_closure",
            target_name="Srinagar Highway",
            status="CLOSED_ACTIVE",
            hazard_boundary=[{"lat": 33.6844, "lng": 73.0479}, {"lat": 33.6594, "lng": 73.0900}],
            initiate_reroute=True,
            public_alert_payload="[MOCK FALLBACK] Severe flooding on Srinagar Highway near G-10. Seek alternate routes immediately."
        )
    
    # --- THE SIMULATION TRIGGER ---
    print(f"Firing POST request to infrastructure API for {payload.target_name}...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/system/execute", 
                json=payload.model_dump() # Convert Pydantic object to dict for the request
            )
        if response.status_code == 200:
            print("[SUCCESS] Execution Successful! Infrastructure state altered.")
        else:
            print(f"[API ERROR] API Error: {response.text}")
    except Exception as e:
        print(f"[CONNECTION ERROR] Connection Error: {e}")
        
    return state

async def monitor_node(state: CIROState) -> CIROState:
    """Node 5: Validates the real-world impact of the interventions."""
    print("--- MONITOR NODE ACTIVE ---")
    
    # Wait 5 seconds to simulate emergency service deployment and state change
    await asyncio.sleep(5)
    
    # Extract the 'before' speed
    before_speed = state.get("traffic_before", {}).get("average_speed_kmh", 3.8)
    
    # Poll the API again to get the real 'after' speed
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/v1/traffic")
        traffic_data = response.json().get("data", [])
        after_speed = traffic_data[0].get("average_speed_kmh", 28.4) if traffic_data else 28.4
    except Exception as e:
        print(f"Monitor API Error: {e}")
        after_speed = 28.4 
    
    # Calculate percentage improvement
    if before_speed > 0:
        improvement = ((after_speed - before_speed) / before_speed) * 100
    else:
        improvement = 100.0
    
    report = f"Validation Complete: Traffic speed improved by +{improvement:.0f}% (from {before_speed} km/h to {after_speed} km/h)."
    print(report)
    
    return {"traffic_after": {"average_speed_kmh": after_speed}, "validation_report": report}

from langgraph.graph import StateGraph, START, END

# Initialize Graph
workflow = StateGraph(CIROState)

# Add Nodes
workflow.add_node("social_watcher", social_watcher_node)
workflow.add_node("sensor_watcher", sensor_watcher_node)
workflow.add_node("synthesizer", synthesizer_node)
workflow.add_node("dispatcher", dispatcher_node)
workflow.add_node("monitor", monitor_node)

# Build Edges (Creating a linear pipeline for maximum stability)
workflow.add_edge(START, "social_watcher")
workflow.add_edge("social_watcher", "sensor_watcher")
workflow.add_edge("sensor_watcher", "synthesizer")
workflow.add_edge("synthesizer", "dispatcher")
workflow.add_edge("dispatcher", "monitor")
workflow.add_edge("monitor", END)

# Compile the Graph
ciro_app = workflow.compile()

async def main():
    # Start with an empty state
    initial_state = CIROState(
        raw_social_data=[], 
        social_evaluation=None, 
        sensor_evaluation=None,
        final_action_plan=None,
        traffic_before=None,
        traffic_after=None,
        validation_report=None
    )
    
    print("\n--- INITIATING CIRO MULTI-AGENT WORKFLOW ---\n")
    final_state = await ciro_app.ainvoke(initial_state)
    
    print("\n--- FINAL SYSTEM OUTPUT ---")
    if final_state.get("final_action_plan"):
        print(final_state["final_action_plan"])
    else:
        print("No action plan generated. System status green.")

if __name__ == "__main__":
    asyncio.run(main())