import json
import os
import logging

logger = logging.getLogger("KrishiMCP.Memory")

class FarmerMemoryStore:
    def __init__(self):
        # In a real production system, this would be Redis/PostgreSQL.
        # For this hackathon/MVP, an in-memory dictionary achieves the same context logic.
        self.sessions = {}

    def get_context(self, phone: str):
        """Retrieve the farmer's session, or provision a clean slate context."""
        if phone not in self.sessions:
            logger.info(f"Creating new context memory for new farmer: {phone}")
            self.sessions[phone] = {
                "farmer_location": "Unknown",
                "crop_type": "Unknown",
                "language": None,   # None = not yet selected
                "sowing_date": None, # Date text or ISO string
                "tasks": [],         # List of reminders/tasks
                "history": [],
            }
        return self.sessions[phone]

    def is_language_set(self, phone: str) -> bool:
        """Returns True if the farmer has already chosen a language."""
        return bool(self.get_context(phone).get("language"))
        
    def add_interaction(self, phone: str, query: str, response: str):
        """Appends the recent question/answer loop into context."""
        context = self.get_context(phone)
        context["history"].append(f"Farmer: {query}")
        context["history"].append(f"Advisor: {response}")
        
        # Simple memory trimming (last 6 messages = 3 interactions)
        if len(context["history"]) > 6:
            context["history"] = context["history"][-6:]
            
        self.sessions[phone] = context

    def set_preference(self, phone: str, key: str, value: str):
        """Set a persistent tag (e.g. crop_type='Tomato', location='Gujarat')."""
        context = self.get_context(phone)
        context[key] = value
        self.sessions[phone] = context

    def clear_session(self, phone: str):
        """Wipes all data for a specific phone number."""
        if phone in self.sessions:
            del self.sessions[phone]
            logger.info(f"Session cleared for {phone}")

memory_store = FarmerMemoryStore()
