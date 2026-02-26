import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Server Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing in Serverless Function");
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export default async function handler(req: any, res: any) {
    // CORS configuration if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "Gemini API Key is not configured in the environment" });

        const ai = new GoogleGenAI({ apiKey });

        const toolDeclarations = [
            {
                name: "create_task",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        project_id: { type: Type.INTEGER },
                        priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
                        estimated_hours: { type: Type.NUMBER }
                    },
                    required: ["title", "project_id"]
                }
            },
            {
                name: "update_task",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        task_id: { type: Type.INTEGER },
                        status: { type: Type.STRING, enum: ["todo", "in_progress", "done"] },
                        priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
                        title: { type: Type.STRING }
                    },
                    required: ["task_id"]
                }
            },
            {
                name: "delete_task",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        task_id: { type: Type.INTEGER },
                        confirmed: { type: Type.BOOLEAN, description: "Must be true. Only set to true after the user has explicitly confirmed the deletion in chat." }
                    },
                    required: ["task_id", "confirmed"]
                }
            },
            {
                name: "create_project",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["name"]
                }
            },
            {
                name: "update_project",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        project_id: { type: Type.INTEGER },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ["active", "completed", "archived"] }
                    },
                    required: ["project_id"]
                }
            },
            {
                name: "delete_project",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        project_id: { type: Type.INTEGER },
                        confirmed: { type: Type.BOOLEAN, description: "Must be true. Only set to true after the user has explicitly confirmed the deletion of the project and all its tasks." }
                    },
                    required: ["project_id", "confirmed"]
                }
            },
            {
                name: "log_time",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        task_id: { type: Type.INTEGER },
                        hours: { type: Type.NUMBER },
                        date: { type: Type.STRING }
                    },
                    required: ["task_id", "hours"]
                }
            },
            {
                name: "get_tasks",
                parameters: { type: Type.OBJECT, properties: {} }
            },
            {
                name: "get_projects",
                parameters: { type: Type.OBJECT, properties: {} }
            },
            {
                name: "undo_last_action",
                parameters: { type: Type.OBJECT, properties: {} }
            },
            {
                name: "get_metrics",
                parameters: { type: Type.OBJECT, properties: {} }
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [{ role: "user", parts: [{ text: message }] }],
            config: {
                systemInstruction: `You are the Work Intelligence Agent. 
        You have access to tools to manage tasks, projects, and time logs.
        
        SAFETY & AUDIT RULES:
        1. Always use tools to fetch data before answering questions about tasks or projects.
        2. MANDATORY CONFIRMATION: For destructive operations (delete_task, delete_project), you MUST ask the user for explicit confirmation first. 
           - First, explain what will be deleted.
           - Wait for the user to say "yes", "confirm", or similar.
           - ONLY THEN call the tool with confirmed=true.
           - The confirmation is logged automatically when you call the tool with the confirmed parameter.
        3. UNDO: If a user wants to revert an action, use the undo_last_action tool.
        4. No Fabricated IDs: Never guess or make up task IDs. Always fetch them using get_tasks.
        5. Professional Tone: Maintain a professional, helpful tone. Frame performance insights in business value terms.
        
        Current projects available: use get_projects to find out.`,
                tools: [{ functionDeclarations: toolDeclarations }]
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];

        // Supabase mutation executor functions
        const tools = {
            create_task: async (args: any) => {
                const { error, data } = await supabase.from('tasks').insert([args]).select();
                const result = error ? { error: error.message } : { success: true, task: data[0] };
                await supabase.from('ai_action_logs').insert([{ action_type: 'create_task', details: args, outcome: result }]);
                return result;
            },
            update_task: async (args: any) => {
                const { task_id, ...updates } = args;
                const { error } = await supabase.from('tasks').update(updates).eq('id', task_id);
                const result = error ? { error: error.message } : { success: true };
                await supabase.from('ai_action_logs').insert([{ action_type: 'update_task', details: args, outcome: result }]);
                return result;
            },
            delete_task: async (args: any) => {
                if (!args.confirmed) return { success: false, error: "Confirmation required." };
                const { error } = await supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', args.task_id);
                const result = error ? { error: error.message } : { success: true };
                await supabase.from('ai_action_logs').insert([{ action_type: 'delete_task', details: args, outcome: result }]);
                return result;
            },
            create_project: async (args: any) => {
                const { error, data } = await supabase.from('projects').insert([args]).select();
                const result = error ? { error: error.message } : { success: true, project: data[0] };
                await supabase.from('ai_action_logs').insert([{ action_type: 'create_project', details: args, outcome: result }]);
                return result;
            },
            update_project: async (args: any) => {
                const { project_id, ...updates } = args;
                const { error } = await supabase.from('projects').update(updates).eq('id', project_id);
                const result = error ? { error: error.message } : { success: true };
                await supabase.from('ai_action_logs').insert([{ action_type: 'update_project', details: args, outcome: result }]);
                return result;
            },
            delete_project: async (args: any) => {
                if (!args.confirmed) return { success: false, error: "Confirmation required." };

                // Get tasks for undo reference
                const { data: tasks } = await supabase.from('tasks').select('id').eq('project_id', args.project_id).is('deleted_at', null);

                const { error: err1 } = await supabase.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', args.project_id);
                await supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('project_id', args.project_id).is('deleted_at', null);

                const result = err1 ? { error: "Failed to delete project" } : { success: true, deleted_task_ids: tasks?.map(t => t.id) };
                await supabase.from('ai_action_logs').insert([{ action_type: 'delete_project', details: args, outcome: result }]);
                return result;
            },
            log_time: async (args: any) => {
                const { task_id, hours, date } = args;
                const entry = { task_id, hours, date: date || new Date().toISOString().split('T')[0] };
                const { error } = await supabase.from('time_logs').insert([entry]);
                const result = error ? { error: error.message } : { success: true };
                await supabase.from('ai_action_logs').insert([{ action_type: 'log_time', details: args, outcome: result }]);
                return result;
            },
            get_tasks: async () => {
                const { data, error } = await supabase.from('tasks').select('*, projects(name)').is('deleted_at', null).order('created_at', { ascending: false });
                return error ? { error: error.message } : { tasks: data };
            },
            get_projects: async () => {
                const { data, error } = await supabase.from('projects').select('*').is('deleted_at', null).order('created_at', { ascending: false });
                return error ? { error: error.message } : { projects: data };
            },
            get_metrics: async () => {
                const { data, error } = await supabase.from('time_logs').select('hours');
                const totalHours = data?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0;
                return error ? { error: error.message } : { total_hours_logged: totalHours };
            },
            undo_last_action: async () => {
                const { data: lastLog, error: logError } = await supabase.from('ai_action_logs').select('*').order('timestamp', { ascending: false }).limit(1).single();
                if (logError || !lastLog) return { success: false, error: "No actions found to undo" };

                const { action_type, details, outcome } = lastLog as any;

                try {
                    if (action_type === 'create_task') {
                        await supabase.from('tasks').delete().eq('id', outcome.task.id);
                    } else if (action_type === 'delete_task') {
                        await supabase.from('tasks').update({ deleted_at: null }).eq('id', details.task_id);
                    } else if (action_type === 'create_project') {
                        await supabase.from('projects').delete().eq('id', outcome.project.id);
                    } else if (action_type === 'delete_project') {
                        await supabase.from('projects').update({ deleted_at: null }).eq('id', details.project_id);
                        if (outcome.deleted_task_ids?.length > 0) {
                            await supabase.from('tasks').update({ deleted_at: null }).in('id', outcome.deleted_task_ids);
                        }
                    } else if (action_type === 'log_time') {
                        await supabase.from('time_logs').delete().eq('task_id', details.task_id).eq('hours', details.hours).match({ date: details.date || new Date().toISOString().split('T')[0] });
                    }

                    await supabase.from('ai_action_logs').delete().eq('id', lastLog.id);
                    return { success: true, message: `Successfully undid the last ${action_type} action` };
                } catch (e: any) {
                    return { success: false, error: `Undo failed: ${e.message}` };
                }
            }
        };

        if (part?.functionCall) {
            const { name, args } = part.functionCall;
            let toolResult: any;

            try {
                if (tools.hasOwnProperty(name)) {
                    toolResult = await (tools as any)[name](args);
                } else {
                    toolResult = { error: "Unknown tool" };
                }
            } catch (err: any) {
                toolResult = { error: err.message };
            }

            const secondResponse = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents: [
                    { role: "user", parts: [{ text: message }] },
                    { role: "model", parts: [{ functionCall: part.functionCall }] },
                    { role: "user", parts: [{ functionResponse: { name, response: toolResult } }] }
                ],
                config: { tools: [{ functionDeclarations: toolDeclarations }] }
            });

            const finalPart = secondResponse.candidates?.[0]?.content?.parts?.[0];
            return res.json({ text: finalPart?.text || "Tool executed, but no final response was generated." });
        }

        return res.json({ text: part?.text || "No response generated." });

    } catch (error: any) {
        console.error('Error in Vercel Chat function:', error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
}
