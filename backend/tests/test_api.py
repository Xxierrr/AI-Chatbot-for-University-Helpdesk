"""
Tests for the AI University Helpdesk API.

Run with: cd backend && python -m pytest tests/ -v
"""
import sys
import os

# Ensure the backend directory is on the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, User
from auth import hash_password, create_access_token

client = TestClient(app)


# --- Health Check ---

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# --- Chat API ---

def test_chat_empty_message():
    """Empty messages should be rejected."""
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 400

def test_chat_whitespace_message():
    """Whitespace-only messages should be rejected."""
    response = client.post("/api/chat", json={"message": "   "})
    assert response.status_code == 400

def test_chat_missing_message():
    """Missing message field should be rejected."""
    response = client.post("/api/chat", json={})
    assert response.status_code == 422  # Pydantic validation error


# --- Authentication ---

def test_login_invalid_credentials():
    """Invalid credentials should return 401."""
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@university.edu", 
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_login_valid_admin():
    """Default admin should be able to log in."""
    response = client.post("/api/auth/login", json={
        "email": "admin@university.edu",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_register_new_user():
    """Should be able to register a new user."""
    response = client.post("/api/auth/register", json={
        "name": "Test Student",
        "email": "test_student@university.edu",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test_student@university.edu"
    assert data["role"] == "student"

def test_register_duplicate_email():
    """Duplicate email should be rejected."""
    response = client.post("/api/auth/register", json={
        "name": "Another Admin",
        "email": "admin@university.edu",
        "password": "somepassword"
    })
    assert response.status_code == 400

def test_get_me_unauthenticated():
    """Unauthenticated /me request should return 401."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_get_me_authenticated():
    """Authenticated user should get their profile."""
    # Login first
    login_res = client.post("/api/auth/login", json={
        "email": "admin@university.edu",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "admin@university.edu"


# --- Admin Authorization ---

def test_admin_documents_unauthorized():
    """Non-admin access to admin endpoints should return 403."""
    response = client.get("/api/admin/documents")
    assert response.status_code == 403

def test_admin_analytics_unauthorized():
    """Non-admin access to analytics should return 403."""
    response = client.get("/api/admin/analytics")
    assert response.status_code == 403

def test_admin_documents_authorized():
    """Admin should be able to list documents."""
    login_res = client.post("/api/auth/login", json={
        "email": "admin@university.edu",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    
    response = client.get("/api/admin/documents", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# --- Feedback ---

def test_feedback_invalid_message():
    """Feedback for non-existent message should return 404."""
    response = client.post("/api/feedback", json={
        "message_id": 99999,
        "rating": 5,
        "comment": "Great answer!"
    })
    assert response.status_code == 404

def test_feedback_invalid_rating():
    """Rating outside 1-5 range should be rejected."""
    response = client.post("/api/feedback", json={
        "message_id": 1,
        "rating": 10,
        "comment": "test"
    })
    # Should be either 404 (no message) or 400 (invalid rating)
    assert response.status_code in [400, 404]


# --- Conversations ---

def test_conversations_unauthenticated():
    """Unauthenticated user should not access conversations."""
    response = client.get("/api/conversations")
    assert response.status_code == 401

def test_conversation_not_found():
    """Non-existent conversation should return 404."""
    login_res = client.post("/api/auth/login", json={
        "email": "admin@university.edu",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    
    response = client.get("/api/conversations/99999", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
