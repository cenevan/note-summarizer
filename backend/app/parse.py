import os
import shutil
import uuid
from tika import parser
import magic
from PIL import Image
import pytesseract

# --- File upload and extraction helpers ---
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload(tmp_file):
    """Save an UploadFile to disk and return its filesystem path."""
    ext = os.path.splitext(tmp_file.filename)[1] or ""
    file_id = str(uuid.uuid4())
    path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    with open(path, "wb") as out:
        shutil.copyfileobj(tmp_file.file, out)
    return path

def detect_mime(path):
    """Detect MIME type of file at given path."""
    ms = magic.Magic(mime=True)
    return ms.from_file(path)

def extract_with_tika(path):
    """Extract text content using OCR for images or Apache Tika for other files."""
    mime = detect_mime(path)
    if mime and mime.startswith("image/"):
        try:
            img = Image.open(path)
            return pytesseract.image_to_string(img)
        except Exception as e:
            raise RuntimeError(f"OCR extraction failed: {e}")
    # fallback to Tika for non-image types
    parsed = parser.from_file(path)
    return parsed.get("content", "") or ""