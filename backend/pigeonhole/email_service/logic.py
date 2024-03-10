import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from pigeonhole.common.exceptions import InternalServerError

def send_dynamic_template_mail(email, template_id, template_data):
    message = Mail(
        from_email=f'iReflect Admin <{os.getenv("SENDER_EMAIL_ADDRESS")}>',
        to_emails=email)
    message.template_id = template_id
    message.dynamic_template_data = template_data

    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
    except Exception as e:
        print(e.message)
        raise InternalServerError(
            detail="An error has occurred while sending the email."
        )


def send_password_reset_mail(name, email, host, uid, token):
    
    template_id = os.getenv('PASSWORD_RESET_EMAIL_TEMPLATE_ID')
    template_data = {
        "name": name,
        "host": host,
        "uid": uid,
        "token": token
    }

    send_dynamic_template_mail(email, template_id, template_data)
    

def send_password_reset_confirmation_mail(name, email):

    template_id = os.getenv('PASSWORD_RESET_CONFIRMATION_EMAIL_TEMPLATE_ID')
    template_data = {
        "name": name
    }

    send_dynamic_template_mail(email, template_id, template_data)