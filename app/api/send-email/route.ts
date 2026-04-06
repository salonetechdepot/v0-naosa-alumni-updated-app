import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, memberName, systemReference, status } = await request.json()

    // For demo purposes, we'll log the email that would be sent
    // In production, integrate with an email service like Resend, SendGrid, etc.
    console.log('=== EMAIL NOTIFICATION ===')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Message: ${message}`)
    console.log(`Member: ${memberName}`)
    console.log(`System Reference: ${systemReference}`)
    console.log(`Status: ${status}`)
    console.log('========================')

    // Simulate email sending
    // In production, replace with actual email service:
    // 
    // Example with Resend:
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'NAOSA <noreply@naosa.org>',
    //   to: [to],
    //   subject,
    //   html: `<p>${message}</p>`
    // })

    return NextResponse.json({ 
      success: true, 
      message: 'Email notification logged (demo mode). In production, integrate with an email service.' 
    })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
