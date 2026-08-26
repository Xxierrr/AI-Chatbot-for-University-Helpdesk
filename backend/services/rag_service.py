import json
from services.document_service import DocumentService
from services.llm_service import LLMService
from config import settings

class RAGService:
    def __init__(self):
        self.doc_service = DocumentService()
        self.llm_service = LLMService()

    def search(self, query: str, top_k: int):
        try:
            results = self.doc_service.collection.query(
                query_texts=[query],
                n_results=top_k
            )
            parsed_results = []
            if results['documents'] and len(results['documents']) > 0:
                docs = results['documents'][0]
                metas = results['metadatas'][0]
                dists = results['distances'][0]
                for d, m, dist in zip(docs, metas, dists):
                    parsed_results.append({
                        "content": d,
                        "metadata": m,
                        "score": dist
                    })
            return parsed_results
        except Exception as e:
            return []

    def build_context(self, results):
        if not results:
            return ""
        context = "Here is some relevant context from the university knowledge base:\n\n"
        for i, res in enumerate(results):
            source = res.get('metadata', {}).get('title', 'Unknown Source')
            context += f"[Source: {source}]\n{res['content']}\n\n"
        return context

    def generate_answer(self, query: str, conversation_history: list):
        results = self.search(query, settings.TOP_K_RESULTS)
        context = self.build_context(results)
        
        messages = conversation_history.copy()
        
        if context:
            messages.append({"role": "system", "content": context})
            
        messages.append({"role": "user", "content": query})
        
        answer = self.llm_service.generate_response(messages)
        
        sources = []
        for r in results:
            meta = r.get('metadata', {})
            if meta not in sources:
                sources.append(meta)
                
        return {
            "answer": answer,
            "sources": sources
        }
