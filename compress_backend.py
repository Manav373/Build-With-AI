"""
compress_backend.py
-------------------
Utility script to package the KrishiAI backend into a lightweight,
production-ready ZIP file (krishiai-backend.zip) for deployment on Render.
"""

import os
import zipfile

def compress_backend():
    repo_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(repo_root, "krishiai", "backend")
    zip_path = os.path.join(repo_root, "krishiai-backend.zip")

    exclude_dirs = {
        "__pycache__", ".venv", "venv", "scratch", 
        "connectivity", ".pytest_cache", ".git"
    }
    exclude_files = {
        "krishiai.db", "requirements-full.txt.bak", ".env", ".DS_Store"
    }
    exclude_exts = {".pyc", ".pyo", ".csv"}

    print(f"📦 Compressing backend from: {backend_dir}")
    total_files = 0

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(backend_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                ext = os.path.splitext(file)[1]
                if ext in exclude_exts:
                    continue
                
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, backend_dir)
                zipf.write(full_path, rel_path)
                total_files += 1

    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"✅ Success! Created: {zip_path}")
    print(f"   Files packaged: {total_files}")
    print(f"   Archive size:   {size_mb:.2f} MB")

if __name__ == "__main__":
    compress_backend()
