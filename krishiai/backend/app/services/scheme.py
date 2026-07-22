"""
Government schemes tool — comprehensive database of Central + State agri schemes.
Updated for 2024-25. Covers PM-KISAN, PMFBY, KCC, eNAM, and 40+ more.
"""

from app.utils.ai_utils import fetch_structured_agri_data, clean_input

async def get_gov_scheme(state: str, crop: str) -> dict:
    """
    Returns AI-identified central + state schemes relevant to the farmer.
    """
    state = clean_input(state)
    crop = clean_input(crop)

    prompt = f"""
    Identify current active Indian government agricultural schemes (Central and State) 
    relevant to a farmer in the state of {state} growing {crop} for the 2024-25 period.
    Always include major central schemes like PM-KISAN, PMFBY, and KCC if applicable.
    
    Return EXACTLY this JSON structure:
    {{
        "state": "{state.title()}",
        "crop": "{crop.title()}",
        "central_schemes": [
            {{"name": "Scheme Name", "benefit": "Brief description", "eligibility": "Who can apply", "how_to_apply": "Steps", "url": "URL if known"}}
        ],
        "state_schemes": [
            {{"name": "Scheme Name", "benefit": "Description"}}
        ],
        "crop_specific": ["List of relevant crop-specific programs"],
        "quick_action": "Summary advice on where to apply (e.g. CSC, Bank, Portal)"
    }}
    """
    
    data = await fetch_structured_agri_data(prompt)
    if "error" in data:
        return {
            "state": state.title(),
            "crop": crop.title(),
            "central_schemes": [],
            "state_schemes": [],
            "crop_specific": [],
            "quick_action": "Please visit your nearest Krishi Vigyan Kendra (KVK) for scheme details."
        }
    return data


def format_schemes_for_llm(data: dict) -> str:
    lines = [f"📜 Schemes for {data['state']} farmers (crop: {data['crop']})"]

    lines.append("\nTop Central Schemes:")
    for s in data["central_schemes"]:
        lines.append(f"• {s['name']}: {s['benefit']}")

    if data["state_schemes"]:
        lines.append(f"\n{data['state']} State Schemes:")
        for s in data["state_schemes"]:
            lines.append(f"• {s['name']}: {s['benefit']}")

    if data["crop_specific"]:
        lines.append(f"\nCrop-Specific ({data['crop']}):")
        for s in data["crop_specific"]:
            lines.append(f"• {s}")

    lines.append(f"\n🔗 {data['quick_action']}")
    return "\n".join(lines)
