import os
import PyPDF2
import docx
import chromadb
from chromadb.utils import embedding_functions
from config import settings

class DocumentService:
    def __init__(self):
        self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        self.ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=settings.EMBEDDING_MODEL)
        self.collection = self.chroma_client.get_or_create_collection(
            name="university_docs", embedding_function=self.ef
        )

    def process_document(self, file_path, original_filename, title, category, doc_id):
        ext = original_filename.split('.')[-1].lower()
        text = ""
        try:
            if ext == 'pdf':
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
            elif ext in ['doc', 'docx']:
                doc = docx.Document(file_path)
                for para in doc.paragraphs:
                    text += para.text + "\n"
            elif ext == 'txt':
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
            else:
                return {"status": "error", "message": f"Unsupported file type: {ext}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

        chunks = self.chunk_text(text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
        if not chunks:
            return {"status": "error", "message": "No text could be extracted"}

        ids = [f"doc_{doc_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{"doc_id": doc_id, "title": title, "category": category, "chunk_index": i} for i in range(len(chunks))]
        
        self.collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        return {"status": "ready", "chunk_count": len(chunks)}

    def chunk_text(self, text, chunk_size, overlap):
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i+chunk_size])
            chunks.append(chunk)
            i += chunk_size - overlap
        return chunks

    def delete_document_chunks(self, doc_id):
        try:
            self.collection.delete(where={"doc_id": doc_id})
        except Exception as e:
            pass

    def get_document_stats(self):
        try:
            return {"total_chunks": self.collection.count()}
        except:
            return {"total_chunks": 0}
