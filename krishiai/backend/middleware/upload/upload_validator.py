from fastapi import UploadFile, HTTPException

MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".webp"}

def validate_uploaded_file(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid file: filename is empty")
    
    ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed. Supported: {ALLOWED_EXTENSIONS}")
    
    return True
