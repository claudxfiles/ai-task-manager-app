from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MessageSender(str, Enum):
    user = "user"
    ai = "ai"

class MessageStatus(str, Enum):
    sending = "sending"
    sent = "sent"
    error = "error"

class MessageBase(BaseModel):
    content: str
    sender: MessageSender
    timestamp: datetime = Field(default_factory=datetime.now)
    status: Optional[MessageStatus] = None

class MessageCreate(MessageBase):
    user_id: str
    conversation_id: str

class MessageInDB(MessageBase):
    id: str
    user_id: str
    conversation_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class Message(MessageInDB):
    pass

class ConversationBase(BaseModel):
    title: Optional[str] = "Nueva conversación"

class ConversationCreate(ConversationBase):
    user_id: str

class ConversationUpdate(BaseModel):
    title: Optional[str] = None

class ConversationInDB(ConversationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_deleted: bool = False

class Conversation(ConversationInDB):
    messages: List[Message] = []

class AIChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: str

class AIChatResponse(BaseModel):
    message: str
    conversation_id: str 