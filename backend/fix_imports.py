import os

replacements = {
    "routers/admin.py": [("from ..", "from ")],
    "routers/auth.py": [("from ..", "from ")],
    "routers/chat.py": [("from ..", "from ")],
    "routers/feedback.py": [("from ..", "from ")],
    "services/analytics_service.py": [("from ..", "from ")],
    "services/document_service.py": [("from ..", "from ")],
    "services/llm_service.py": [("from ..", "from ")],
    "services/rag_service.py": [
        ("from .document_service", "from services.document_service"),
        ("from .llm_service", "from services.llm_service"),
        ("from ..config", "from config")
    ]
}

for file_path, reps in replacements.items():
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        for old, new in reps:
            content = content.replace(old, new)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file_path}")
