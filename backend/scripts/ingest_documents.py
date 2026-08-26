"""
Script to ingest sample university documents into the vector database.
Run this after setting up the backend to pre-load the knowledge base.

Usage:
    cd backend
    python -m scripts.ingest_documents
"""

import os
import sys

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.document_service import DocumentService

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "data", "documents")


def ingest_all():
    doc_service = DocumentService()
    
    if not os.path.exists(DATA_DIR):
        print(f"Data directory not found: {DATA_DIR}")
        return
    
    files = [f for f in os.listdir(DATA_DIR) if f.endswith(('.txt', '.pdf', '.docx'))]
    
    if not files:
        print("No documents found to ingest.")
        return
    
    print(f"Found {len(files)} document(s) to ingest.\n")
    
    for i, filename in enumerate(files, 1):
        filepath = os.path.join(DATA_DIR, filename)
        title = filename.replace('_', ' ').replace('.txt', '').replace('.pdf', '').replace('.docx', '').title()
        category = "general"
        
        # Guess category from filename
        if "faq" in filename.lower():
            category = "faq"
        elif "admission" in filename.lower():
            category = "admissions"
        elif "fee" in filename.lower():
            category = "finance"
        elif "hostel" in filename.lower():
            category = "facilities"
        elif "exam" in filename.lower():
            category = "examinations"
        
        print(f"[{i}/{len(files)}] Processing: {filename}")
        print(f"  Title: {title}")
        print(f"  Category: {category}")
        
        result = doc_service.process_document(filepath, filename, title, category, doc_id=i)
        
        if result["status"] == "error":
            print(f"  [X] Error: {result['message']}")
        else:
            print(f"  [+] Success: {result['chunk_count']} chunks created")
        print()
    
    stats = doc_service.get_document_stats()
    print(f"Ingestion complete. Total chunks in vector store: {stats['total_chunks']}")


if __name__ == "__main__":
    ingest_all()
