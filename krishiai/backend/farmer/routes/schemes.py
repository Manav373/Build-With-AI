from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from shared.backend.core.auth import verify_clerk_token
from shared.backend.utils.ai_utils import fetch_agri_text

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

class Scheme(BaseModel):
    id: str
    title: str
    desc: str
    benefit: str
    category: str
    icon: str
    color: str
    link: str
    eligibility: List[str]
    documents: List[str]

SCHEMES_DB = [
    {
        "id": "pm-kisan",
        "title": "PM-KISAN Samman Nidhi",
        "desc": "Income support of ₹6,000 per year in three installments.",
        "benefit": "₹6,000 Yearly",
        "category": "Subsidy",
        "icon": "CreditCard",
        "color": "from-blue-500 to-indigo-600",
        "link": "https://pmkisan.gov.in/",
        "eligibility": ["Small and marginal farmers", "Own cultivable land", "Indian citizenship"],
        "documents": ["Aadhaar card", "Land records", "Bank account"]
    },
    {
        "id": "pmfby",
        "title": "Fasal Bima Yojana (PMFBY)",
        "desc": "Crop insurance against natural risks at very low premiums.",
        "benefit": "Full Crop Cover",
        "category": "Insurance",
        "icon": "ShieldCheck",
        "color": "from-emerald-500 to-teal-600",
        "link": "https://pmfby.gov.in/",
        "eligibility": ["All farmers including sharecroppers", "Crops must be listed"],
        "documents": ["Insurance receipt", "Aadhaar", "Land certificate"]
    },
    {
        "id": "kcc",
        "title": "Kisan Credit Card (KCC)",
        "desc": "Timely credit support from the banking system for agricultural needs.",
        "benefit": "Low Interest Loans",
        "category": "Credit",
        "icon": "CreditCard",
        "color": "from-amber-500 to-orange-600",
        "link": "https://www.rbi.org.in/",
        "eligibility": ["Individual/Joint cultivators", "Tenant farmers"],
        "documents": ["Land passbook", "Identity proof"]
    },
    {
        "id": "pmksy",
        "title": "Krishi Sinchayee Yojana",
        "desc": "Protective irrigation to all farms for 'per drop more crop'.",
        "benefit": "80% Subsidy",
        "category": "Irrigation",
        "icon": "Droplets",
        "color": "from-sky-500 to-blue-600",
        "link": "https://pmksy.gov.in/",
        "eligibility": ["All farmers with cultivable land"],
        "documents": ["Land ownership proof"]
    },
    {
        "id": "pkvy",
        "title": "Paramparagat Krishi Vikas Yojana",
        "desc": "Promotion of commercial organic farming through cluster approach.",
        "benefit": "Organic Growth Support",
        "category": "Organic",
        "icon": "Sparkles",
        "color": "from-green-500 to-emerald-600",
        "link": "https://pkvy.dac.gov.in/",
        "eligibility": ["Farmer clusters only"],
        "documents": ["Cluster certificate"]
    },
    {
        "id": "soil-health",
        "title": "Soil Health Card Scheme",
        "desc": "Nutrient status report with dosage recommendations.",
        "benefit": "Free Soil Testing",
        "category": "Innovation",
        "icon": "Info",
        "color": "from-rose-500 to-pink-600",
        "link": "https://soilhealth.dac.gov.in/",
        "eligibility": ["All Indian farmers"],
        "documents": ["Aadhaar number"]
    },
    {
        "id": "enam",
        "title": "e-NAM",
        "desc": "Unified national market for networking agricultural mandis.",
        "benefit": "Transparent Bidding",
        "category": "Market",
        "icon": "ShoppingBag",
        "color": "from-purple-500 to-indigo-600",
        "link": "https://enam.gov.in/",
        "eligibility": ["Registered farmers", "Traders"],
        "documents": ["Mandi registration", "Bank details"]
    }
]

@router.get("", response_model=List[Scheme])
@router.get("/list", response_model=List[Scheme])
@router.get("/all", response_model=List[Scheme])
async def get_all_schemes(user_data: dict = Depends(verify_clerk_token)):
    return SCHEMES_DB

@router.get("/ai-summary")
async def get_ai_summary(scheme_id: str, lang: str = "en", user_data: dict = Depends(verify_clerk_token)):
    scheme = next((s for s in SCHEMES_DB if s["id"] == scheme_id), None)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    prompt = f"Explain the government scheme '{scheme['title']}' ({scheme['desc']}) in very simple terms for a farmer. "
    prompt += f"Focus on how they benefit and what they need to do. Use {lang} language. "
    prompt += "Keep the response under 100 words and use bullet points for clarity."
    
    summary = await fetch_agri_text(prompt)
    return {"summary": summary}
