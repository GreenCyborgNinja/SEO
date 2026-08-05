import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'
import { mailOutboxDir } from '../db/paths.mjs'

/**
 * Mail delivery with a zero-configuration local path.
 *
 * With SMTP_HOST set (e.g. Brevo's free tier, 300 mails/day) real mail is sent.
 * Without it, messages are written to data/mail-outbox/*.eml and any contained
 * links are printed to the console — so the newsletter double-opt-in flow is
 * fully testable locally without a mail server.
 */

export interface MailInput {
  to: string
  subject: string
  html: string
  text: string
}

const FROM = process.env.MAIL_FROM || 'Daily Trends <noreply@daily-trends.local>'

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST)
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  if (smtpConfigured()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASSWORD
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
    })
  } else {
    // streamTransport keeps the full RFC822 message so the .eml opens in any mail client.
    transporter = nodemailer.createTransport({ streamTransport: true, newline: 'unix', buffer: true })
  }

  return transporter
}

export async function sendMail({ to, subject, html, text }: MailInput): Promise<void> {
  const info = await getTransporter().sendMail({ from: FROM, to, subject, html, text })

  if (smtpConfigured()) {
    console.log(`[mail] sent "${subject}" to ${to}`)
    return
  }

  fs.mkdirSync(mailOutboxDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.join(mailOutboxDir, `${stamp}-${to.replace(/[^a-z0-9@._-]/gi, '_')}.eml`)
  fs.writeFileSync(file, (info as { message: Buffer }).message)

  console.log(`\n[mail] SMTP not configured — message written to ${file}`)
  console.log(`[mail] to: ${to} | subject: ${subject}`)
  for (const link of text.match(/https?:\/\/\S+/g) ?? []) {
    console.log(`[mail] link: ${link}`)
  }
  console.log('')
}

export function mailDeliveryMode(): 'smtp' | 'file' {
  return smtpConfigured() ? 'smtp' : 'file'
}
