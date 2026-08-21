from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import EmailNotificationLog

def generate_luxury_html_template(subject: str, client_name: str, body_content_html: str, call_to_action_url: str = None, cta_text: str = None) -> str:
    """
    Generates a responsive, editorial luxury HTML email template adhering to AGAMOS brand identity.
    """
    cta_html = ""
    if call_to_action_url and cta_text:
        cta_html = f"""
        <div style="text-align: center; margin: 35px 0;">
            <a href="{call_to_action_url}" style="background-color: #D4AF37; color: #111111; padding: 14px 32px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; display: inline-block; border-radius: 0px;">
                {cta_text}
            </a>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #111111; font-family: 'Montserrat', Helvetica, Arial, sans-serif; color: #F5F5F7;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111111; padding: 40px 10px;">
            <tr>
                <td align="center">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #181818; border: 1px solid #2A2A2A;">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 25px 40px; text-align: center; border-bottom: 1px solid #2E2E2E;">
                                <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: 6px; color: #FFFFFF;">
                                    AGAMOS
                                </h1>
                                <p style="margin: 6px 0 0 0; font-size: 10px; font-weight: 500; letter-spacing: 3px; color: #D4AF37; text-transform: uppercase;">
                                    Salon · Beauty Store · Spa
                                </p>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 40px 30px 40px; line-height: 1.7; font-size: 14px; color: #CCCCCC;">
                                <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: #FFFFFF; margin-top: 0;">
                                    Dear {client_name},
                                </p>
                                {body_content_html}
                                {cta_html}
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 40px; background-color: #141414; border-top: 1px solid #2E2E2E; text-align: center; font-size: 11px; color: #777777; line-height: 1.6;">
                                <p style="margin: 0 0 8px 0; color: #999999;">
                                    AGAMOS Luxury Flagship Suite
                                </p>
                                <p style="margin: 0 0 8px 0;">
                                    12A Victoria Island Luxury Boulevard, Lagos, Nigeria<br>
                                    Concierge: +234 800 242 6670 &bull; concierge@agamos.com
                                </p>
                                <p style="margin: 15px 0 0 0; color: #555555; font-size: 10px;">
                                    &copy; 2026 AGAMOS. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
