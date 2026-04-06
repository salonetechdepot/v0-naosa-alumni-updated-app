import { Member, RegistrationStatus } from './types'

const ASSOCIATION_EMAIL = 'NAOSAkenema@gmail.com'

export async function sendStatusChangeEmail(member: Member, newStatus: RegistrationStatus): Promise<boolean> {
  if (!member.email) {
    console.log('No email provided for member:', member.firstName, member.surname)
    return false
  }

  const statusMessages: Record<RegistrationStatus, { subject: string; message: string }> = {
    approved: {
      subject: 'NAOSA Registration Approved - Welcome!',
      message: `Dear ${member.firstName} ${member.surname},

Congratulations! Your registration with the Nasir Ahmadiyya Old Students Association (NAOSA) has been approved.

Your Details:
- System Reference: ${member.systemReference}
- Registration Date: ${new Date(member.createdAt).toLocaleDateString()}

You are now an official member of NAOSA. Your name will appear on our members list on the website.

Thank you for joining our community. We look forward to your active participation in our activities and initiatives.

For any inquiries, please contact us at ${ASSOCIATION_EMAIL}

Best regards,
NAOSA Administration
Kenema, Sierra Leone`
    },
    rejected: {
      subject: 'NAOSA Registration Status Update',
      message: `Dear ${member.firstName} ${member.surname},

We regret to inform you that your registration with the Nasir Ahmadiyya Old Students Association (NAOSA) could not be approved at this time.

Your Details:
- System Reference: ${member.systemReference}
- Registration Date: ${new Date(member.createdAt).toLocaleDateString()}

This may be due to incomplete information or payment verification issues. If you believe this is an error, please contact us with your system reference number.

Contact: ${ASSOCIATION_EMAIL}

Best regards,
NAOSA Administration
Kenema, Sierra Leone`
    },
    pending: {
      subject: 'NAOSA Registration Received',
      message: `Dear ${member.firstName} ${member.surname},

Thank you for registering with the Nasir Ahmadiyya Old Students Association (NAOSA).

Your registration has been received and is pending review by our administrators.

Your Details:
- System Reference: ${member.systemReference}
- Registration Date: ${new Date(member.createdAt).toLocaleDateString()}
- Amount Paid: ${member.registrationAmount.toLocaleString()} SLE
- Transaction Reference: ${member.transactionReference}

You will receive another email once your registration has been reviewed.

For any inquiries, please contact us at ${ASSOCIATION_EMAIL}

Best regards,
NAOSA Administration
Kenema, Sierra Leone`
    }
  }

  const { subject, message } = statusMessages[newStatus]

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: member.email,
        subject,
        message,
        memberName: `${member.firstName} ${member.surname}`,
        systemReference: member.systemReference,
        status: newStatus
      })
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
