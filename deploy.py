from huggingface_hub import HfApi

api = HfApi()

print("Starting strict allowlist deployment...")

api.upload_folder(
    folder_path=".",
    # FIX: Removed 'spaces/' from the repo_id. 
    # The repo_type="space" handles that routing automatically.
    repo_id="sofiajeon/ciro-backend", 
    repo_type="space",
    allow_patterns=[
        "main.py",
        "ciro_graph.py",
        "Dockerfile",
        "requirements.txt",
        "README.md",
        "*.json"  
    ]
)

print("Deployment complete!")