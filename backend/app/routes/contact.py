from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import resend
from app.config import settings

router = APIRouter(prefix="/api/contact", tags=["contact"])

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

@router.post("/send")
async def send_contact_email(form: ContactForm):
    """
    Secure Contact Endpoint for Portfolio & Marliz.
    Sends inquiry emails via Resend.
    """
    try:
        html_content = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e40af;">New Strategic Inquiry</h2>
            <p><strong>Source:</strong> Portfolio / Marliz Contact Form</p>
            <hr>
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Email:</strong> <a href="mailto:{form.email}">{form.email}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6;">
                {form.message}
            </div>
        </div>
        """

        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": "Marliz Security <system@marlizintel.com>",
            "to": "johnmarkoguta@gmail.com",
            "subject": f"Inquiry from {form.name}",
            "html": html_content,
            "reply_to": form.email
        })

        return {"status": "success", "message": "Transmission received."}

    except Exception as e:
        print(f"Email Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to transmit message.")
