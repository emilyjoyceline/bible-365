
export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        // Only allow POST
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        try {
            // Get API key from environment variable
            const apiKey = env.GEMINI_API_KEY;

            if (!apiKey) {
                return new Response(JSON.stringify({ error: 'API key not configured' }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Parse request body
            const body = await request.json();

            // Forward to Gemini API
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const geminiResponse = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await geminiResponse.json();

            // Return response with CORS and no-cache headers
            return new Response(JSON.stringify(data), {
                status: geminiResponse.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    },
};
