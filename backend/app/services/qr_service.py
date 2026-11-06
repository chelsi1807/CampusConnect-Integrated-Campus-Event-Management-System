import os
import qrcode
import io
import base64
import uuid

def generate_registration_code(event_id: int, user_id: int) -> str:
    random_part = uuid.uuid4().hex[:6].upper()
    return f"CC-E{event_id}-U{user_id}-{random_part}"

def generate_qr_base64(data: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="#1E3A8A", back_color="white")  # Deep blue fill
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

def save_qr_file(data: str, filename: str, output_dir: str = "qr_codes") -> str:
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, filename)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1E3A8A", back_color="white")
    img.save(file_path, format="PNG")
    return file_path
