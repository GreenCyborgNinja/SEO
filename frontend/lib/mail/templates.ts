import 'server-only'

import { SITE_NAME, absoluteUrl } from '../site'
import type { MailInput } from './mailer'

/** German transactional mails in the shop's dark/orange look. */

function layout(headline: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#F8FAFC;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0F172A">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,.08)">
    <div style="background:#0F172A;padding:24px">
      <span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;background:#F97316;color:#fff;border-radius:8px;font-weight:700">IT</span>
      <span style="color:#fff;font-size:18px;font-weight:700;margin-left:10px">${SITE_NAME}</span>
    </div>
    <div style="padding:28px">
      <h1 style="margin:0 0 16px;font-size:22px;color:#0F172A">${headline}</h1>
      <div style="font-size:15px;line-height:1.6;color:#334155">${body}</div>
      ${
        cta
          ? `<p style="margin:28px 0 0"><a href="${cta.url}" style="display:inline-block;background:#F97316;color:#fff;text-decoration:none;padding:14px 26px;border-radius:12px;font-weight:700">${cta.label}</a></p>`
          : ''
      }
    </div>
    <div style="padding:18px 28px;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8">
      ${SITE_NAME} · Affiliate-Shop · Als Amazon-Partner verdienen wir an qualifizierten Käufen.
    </div>
  </div>
</body></html>`
}

export function newsletterConfirmMail(email: string, token: string): MailInput {
  const url = absoluteUrl(`/newsletter/confirm?token=${token}`)
  return {
    to: email,
    subject: 'Bitte bestätige deine Newsletter-Anmeldung',
    html: layout(
      'Nur noch ein Klick',
      `<p>Du hast dich für den ${SITE_NAME} Deal-Newsletter angemeldet. Bitte bestätige deine E-Mail-Adresse – das ist gesetzlich vorgeschrieben (Double-Opt-in).</p>
       <p style="color:#64748B;font-size:13px">Falls du das nicht warst, ignoriere diese E-Mail einfach. Ohne Bestätigung senden wir dir nichts.</p>`,
      { label: 'Anmeldung bestätigen', url }
    ),
    text: `Bitte bestätige deine Newsletter-Anmeldung bei ${SITE_NAME}:\n\n${url}\n\nFalls du das nicht warst, ignoriere diese E-Mail.`,
  }
}

export function newsletterWelcomeMail(email: string, token: string): MailInput {
  const unsubscribe = absoluteUrl(`/newsletter/unsubscribe?token=${token}`)
  return {
    to: email,
    subject: `Willkommen bei ${SITE_NAME}`,
    html: layout(
      'Anmeldung bestätigt 🎉',
      `<p>Deine Anmeldung ist aktiv. Du erhältst ab jetzt Deal-Alerts zu den größten Preisstürzen und exklusive Member-Rabattcodes.</p>
       <p>Als angemeldetes Mitglied findest du deine Codes jederzeit in deinem Konto.</p>
       <p style="color:#64748B;font-size:13px">Abmelden: <a href="${unsubscribe}" style="color:#F97316">hier klicken</a></p>`,
      { label: 'Aktuelle Deals ansehen', url: absoluteUrl('/deals') }
    ),
    text: `Deine Newsletter-Anmeldung bei ${SITE_NAME} ist bestätigt.\n\nAktuelle Deals: ${absoluteUrl('/deals')}\nAbmelden: ${unsubscribe}`,
  }
}

export function contactNotificationMail(to: string, message: { name: string; email: string; subject?: string | null; message: string }): MailInput {
  return {
    to,
    subject: `Neue Kontaktanfrage: ${message.subject || 'ohne Betreff'}`,
    html: layout(
      'Neue Kontaktanfrage',
      `<p><strong>Von:</strong> ${escapeHtml(message.name)} &lt;${escapeHtml(message.email)}&gt;</p>
       <p><strong>Betreff:</strong> ${escapeHtml(message.subject || '–')}</p>
       <p style="white-space:pre-wrap">${escapeHtml(message.message)}</p>`
    ),
    text: `Von: ${message.name} <${message.email}>\nBetreff: ${message.subject || '–'}\n\n${message.message}`,
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
