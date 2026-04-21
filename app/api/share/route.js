import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email, imageBase64, locationLabel, timestamp, shareUrl } =
      await request.json();

    if (!email || !imageBase64) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      return NextResponse.json(
        {
          error:
            "SMTP not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env.local",
        },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const imageBuffer = Buffer.from(imageBase64.split(",")[1], "base64");
    const filename = `rothko-${timestamp.replace(/[:.]/g, "-")}.png`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Your Rothko — ${locationLabel}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #44403c;">
          <h2 style="font-weight: normal; letter-spacing: 0.05em;">Rothko Art Generator</h2>
          <p>A painting generated for <strong>${locationLabel}</strong> at ${timestamp}.</p>
          <p>View the generator for this location: <a href="${shareUrl}" style="color: #78716c;">${shareUrl}</a></p>
          <p style="color: #a8a29e; font-size: 0.85em; margin-top: 2em;">
            The attached image captures the exact rendering from that moment.
            Weather conditions at your location shape every colour, shape, and edge.
          </p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: imageBuffer,
          contentType: "image/png",
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Share API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send email" },
      { status: 500 },
    );
  }
}
