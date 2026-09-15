from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import List
import json
import logging
from datetime import datetime

from shared.database.connection import get_db, SessionLocal
from farmer.database.models.community_model import CommunityMessage
from shared.backend.core.auth import verify_clerk_token

logger = logging.getLogger("Farmer.Community")

router = APIRouter(prefix="/community", tags=["Community"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New connection. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Connection closed. Active: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to a client: {e}")

manager = ConnectionManager()

@router.get("/history", response_model=List[dict])
async def get_chat_history(db: Session = Depends(get_db), limit: int = 50):
    try:
        messages = db.query(CommunityMessage).order_by(CommunityMessage.timestamp.desc()).limit(limit).all()
        return [
            {
                "id": m.id,
                "user_id": m.user_id,
                "user_name": m.user_name,
                "user_avatar": m.user_avatar,
                "content": m.content,
                "timestamp": m.timestamp.isoformat() if m.timestamp else datetime.utcnow().isoformat()
            }
            for m in reversed(messages)
        ]
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        return []

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            action_type = message_data.get("type", "chat_message")
            
            with SessionLocal() as db:
                if action_type == "delete_message":
                    msg_id = message_data.get("id")
                    if msg_id:
                        msg = db.query(CommunityMessage).filter(CommunityMessage.id == msg_id).first()
                        if msg:
                            db.delete(msg)
                            db.commit()
                            await manager.broadcast({
                                "type": "delete_message",
                                "id": msg_id
                            })
                    continue

                if action_type == "edit_message":
                    msg_id = message_data.get("id")
                    new_content = message_data.get("content")
                    if msg_id and new_content:
                        msg = db.query(CommunityMessage).filter(CommunityMessage.id == msg_id).first()
                        if msg:
                            msg.content = new_content
                            db.commit()
                            await manager.broadcast({
                                "type": "edit_message",
                                "id": msg_id,
                                "content": new_content
                            })
                    continue
                
                new_msg = CommunityMessage(
                    user_id=message_data.get("user_id"),
                    user_name=message_data.get("user_name", "Farmer"),
                    user_avatar=message_data.get("user_avatar"),
                    content=message_data.get("content"),
                    timestamp=datetime.utcnow()
                )
                
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)
                
                broadcast_payload = {
                    "id": new_msg.id,
                    "user_id": new_msg.user_id,
                    "user_name": new_msg.user_name,
                    "user_avatar": new_msg.user_avatar,
                    "content": new_msg.content,
                    "timestamp": new_msg.timestamp.isoformat(),
                    "type": "chat_message"
                }
                await manager.broadcast(broadcast_payload)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
