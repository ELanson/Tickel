import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import path from 'path';

// Load Vertex AI Credentials securely
let vertexConfig: any = null;
try {
    if (process.env.VERTEX_CREDENTIALS) {
        vertexConfig = JSON.parse(process.env.VERTEX_CREDENTIALS);
    } else {
        const configPath = path.resolve(process.cwd(), '.env.vertex.json');
        if (fs.existsSync(configPath)) {
            vertexConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    }
} catch (e) {
    console.warn("Failed to load Vertex AI credentials for Teakel Vision:", e);
}

function getVertexAI() {
    if (!vertexConfig) throw new Error("Vertex AI credentials not configured");
    return new VertexAI({
        project: vertexConfig.project_id,
        location: 'us-central1',
        googleAuthOptions: {
            credentials: {
                client_email: vertexConfig.client_email,
                private_key: vertexConfig.private_key
            }
        }
    });
}

const SYSTEM_PROMPT = `You are Yuki-Vision, an advanced OCR and data extraction AI for Rickel Industries.
Your task is to analyze the provided image (business card, ID badge, or document) and extract lead contact information with high precision.

You MUST respond with a raw JSON object. NEVER use markdown code blocks (\`\`\`json \`\`\`). Do not include any text before or after the JSON object.

The object must strictly follow this structure:
{
  "name": "Full Name",
  "email": "Business Email",
  "phone": "Phone Number",
  "company": "Company Name",
  "role": "Job Title",
  "website": "Company Website URL",
  "address": "Location/City, Country"
}

If a field cannot be found or deduced confidently from the image, output an empty string "" for that field. Do not makeup data. Ensure the email and website are correctly formatted.`;

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { imageBase64, mimeType } = req.body;
        if (!imageBase64 || !mimeType) {
            return res.status(400).json({ error: "Image base64 data and mimeType are required" });
        }

        if (!vertexConfig) {
            return res.status(500).json({ error: "Vertex AI credentials (.env.vertex.json) not found on server" });
        }

        const vertexAI = getVertexAI();
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-pro',
            systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        console.log(`[TEAKEL VISION] Analyzing image of type: ${mimeType}`);

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { inlineData: { data: imageBase64, mimeType: mimeType } },
                    { text: "Extract lead data from this image." }
                ]
            }]
        });

        const response = await result.response;
        const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            return res.status(500).json({ error: "Failed to extract data from image." });
        }

        try {
            // Attempt to parse to ensure it's valid JSON before sending
            const leadData = JSON.parse(textResponse);
            return res.status(200).json({ lead: leadData });
        } catch (parseError: any) {
            console.error(`[TEAKEL VISION] JSON Parse Error: `, textResponse);
            return res.status(500).json({ error: "Failed to parse extracted JSON", raw: textResponse });
        }

    } catch (error: any) {
        console.error('[TEAKEL VISION ERROR]:', error.message);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
}
