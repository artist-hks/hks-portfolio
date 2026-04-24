type SendContactEmailInput = {
  name: string;
  email: string;
  message: string;
};

export async function sendContactEmail({
  name,
  email,
  message,
}: SendContactEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!to) {
    throw new Error("Missing CONTACT_TO_EMAIL");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `New contact form message from ${name}`,
      text: `Name: ${name}
Email: ${email}

Message:
${message}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${errorText}`);
  }

  return response.json();
}
