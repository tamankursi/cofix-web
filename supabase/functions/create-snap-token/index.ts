import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY") || "";
const MIDTRANS_API_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, x-sb-client-info",
            },
        });
    }

    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const body = await req.json();
        const { order_id, gross_amount, customer_name, customer_email, customer_phone } = body;

        const midtransPayload = {
            transaction_details: {
                order_id: order_id,
                gross_amount: gross_amount,
            },
            customer_details: {
                first_name: customer_name,
                email: customer_email || "customer@cofix.com",
                phone: customer_phone,
            },
        };

        const response = await fetch(MIDTRANS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Basic " + btoa(MIDTRANS_SERVER_KEY + ":"),
            },
            body: JSON.stringify(midtransPayload),
        });

        const data = await response.json();

        if (response.ok) {
            return new Response(
    JSON.stringify({ token: data.token, redirect_url: data.redirect_url }),
    { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
);
        } else {
            return new Response(
    JSON.stringify({ error: data.error_messages || "Midtrans error" }),
    { status: 400, headers: { "Content-Type": "application/json" } }
);
        }
    } catch (error) {
       return new Response(
    JSON.stringify({ error: "Internal server error", detail: error.message }),
    { status: 500, headers: { "Content-Type": "application/json" } }
);
    }
});