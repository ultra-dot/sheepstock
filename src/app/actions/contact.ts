"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
    firstName: z.string().min(1, "Nama Awal wajib diisi").max(50, "Nama terlalu panjang"),
    lastName: z.string().max(50, "Nama terlalu panjang").optional(),
    email: z.string().email("Format email tidak valid"),
    livestockCount: z.string().min(1, "Jumlah ternak wajib diisi"),
    message: z.string().min(10, "Pesan terlalu singkat (minimal 10 karakter)").max(500, "Pesan terlalu panjang (maksimal 500 karakter)"),
    botField: z.string().max(0, "Bot detected").optional(), // Honeypot
});

export async function submitContactForm(prevState: any, formData: FormData) {
    try {
        const rawData = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            livestockCount: formData.get("livestockCount"),
            message: formData.get("message"),
            botField: formData.get("bot_field"),
        };

        const validatedData = contactSchema.safeParse(rawData);

        if (!validatedData.success) {
            return {
                error: validatedData.error.issues[0].message,
                success: false,
            };
        }

        const { firstName, lastName, email, livestockCount, message, botField } = validatedData.data;

        // Honeypot check
        // If the hidden field is filled out, it's a bot. We silently return success to trick it.
        if (botField && botField.length > 0) {
            return {
                error: null,
                success: true,
            };
        }

        const adminEmail = process.env.CONTACT_EMAIL_DESTINATION || "info@sheepstock.cloud";
        const senderEmail = process.env.CONTACT_EMAIL_SENDER || "onboarding@resend.dev"; 

        const htmlContent = `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #1e293b;">
                <h2 style="color: #054431; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Pesan Baru dari Website SheepStock</h2>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 5px 0;"><strong>Nama:</strong> ${firstName} ${lastName || ""}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 5px 0;"><strong>Skala Peternakan:</strong> ${livestockCount}</p>
                </div>
                <h3 style="color: #334155; margin-bottom: 10px;">Pesan:</h3>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; white-space: pre-wrap; line-height: 1.6;">
${message}
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
                    Email ini dikirim secara otomatis dari formulir kontak website SheepStock.
                </p>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: `SheepStock System <${senderEmail}>`,
            to: [adminEmail],
            replyTo: email,
            subject: `Pesan Baru dari ${firstName} - SheepStock`,
            html: htmlContent,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return {
                error: "Gagal mengirim pesan. Silakan coba lagi nanti atau hubungi kami langsung via email.",
                success: false,
            };
        }

        return {
            error: null,
            success: true,
        };

    } catch (err) {
        console.error("Contact Form Error:", err);
        return {
            error: "Terjadi kesalahan internal server.",
            success: false,
        };
    }
}
