import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FONNTE_TOKEN = Deno.env.get("FONNTE_TOKEN") || "";

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
            },
        });
    }

    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
    }

    try {
        const body = await req.json();
        const { to, customer_name, order_id, items, total, method, address } = body;

        let messageText = `☕ *Pesanan Baru Cofix!*\n\n`;
        messageText += `📦 *Order ID:* #${order_id}\n`;
        messageText += `👤 *Pemesan:* ${customer_name}\n`;
        messageText += `🛵 *Metode:* ${method === "delivery" ? "Delivery" : "Pick Up"}\n`;

        if (method === "delivery" && address) {
            messageText += `📍 *Alamat:* ${address}\n`;
        }

        messageText += `\n📋 *Detail Pesanan:*\n`;
        items.forEach(function(item: { name: string; quantity: number; subtotal: number }) {
            messageText += `  - ${item.name} x${item.quantity} = Rp ${item.subtotal.toLocaleString("id-ID")}\n`;
        });

        messageText += `\n💰 *Total:* Rp ${total.toLocaleString("id-ID")}\n`;
        messageText += `\n_Silakan cek dashboard untuk memproses pesanan._`;

        const formData = new FormData();
        formData.append("target", to);
        formData.append("message", messageText);
        formData.append("countryCode", "62");

        console.log("Sending to Fonnte with token:", FONNTE_TOKEN.substring(0, 5) + "...");

        const response = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
                "Authorization": FONNTE_TOKEN,
            },
            body: formData,
        });

        const result = await response.json();
        console.log("Fonnte response:", JSON.stringify(result));

        if (response.ok && result.status === true) {
            return new Response(
                JSON.stringify({ success: true, result: result }),
                { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
            );
        } else {
            return new Response(
                JSON.stringify({ error: "Fonnte API error", detail: result }),
                { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
            );
        }
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ error: "Internal server error", detail: error.message }),
            { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
    }
});