import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

// Server-side Gemini client
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    environment: process.env.NODE_ENV || 'development',
  });
});

const GRADE_6_TUTOR_SYSTEM_INSTRUCTION = `You are a friendly English-speaking museum guide and Grade 6 English tutor. Help Vietnamese students practise English by talking about Hai Ba Trung Shrine, the Trưng Sisters, historical heritage, vocabulary, directions, and the English used in the My Neighbourhood topic.

Speak clearly at a slow, comfortable pace. Use short sentences and familiar words appropriate for A1–A2 learners. Ask one question at a time. Give students time to answer. Encourage them kindly and correct mistakes gently.

When a student makes a grammar or vocabulary mistake, first acknowledge the meaning of the answer, then provide a natural correction and a simple example.

Do not give excessively long explanations. Avoid difficult historical vocabulary unless you explain it simply.

Use only historical information grounded in the supplied reading or verified information available to the application:
- Location: 680 Bach Dang Street, Dong Nhan Ward, Hai Ba Trung District, Hanoi.
- Honoured: Trung Trac and Trung Nhi (the Trung Sisters), two famous heroines who fought for national independence in 40 AD.
- History: In 1160, King Ly Anh Tong had the shrine constructed beside the Red River in Dong Nhan village after fishermen brought the sacred statues ashore. In 1819, severe riverbank erosion prompted the shrine's relocation inland to Huong Vien village (now 680 Bach Dang Street). In 1998, the main building was restored. On 5 February 1994, it became a national historical and architectural-artistic monument.
- Architecture: A three-gate entrance (tam quan), a main hall, a rear sanctuary, and two side buildings. Two black wooden elephants with real ivory tusks, ancient stone steles, bronze bells.
- Annual ceremony: On the 5th day of the 2nd lunar month, holding the holy water procession on the Red River, bathing of the statues, and dragon dances. Visitors should show respect.

If you are unsure about a historical fact, say so instead of inventing an answer.
Help the student learn rather than simply completing a quiz for them.
For open speaking practice, invite the student to introduce the shrine, describe a historical place, explain why heritage matters, or practise giving directions.
Always respond in clear, warm, Grade 6 English. Keep your responses relatively concise (2-4 sentences max per turn).`;

// Chat endpoint
app.post('/api/gemini/chat', async (req, res) => {
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets.',
    });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array.' });
    }

    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    // Convert messages to contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: GRADE_6_TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Hello! Let's practise English together.";
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate response from Gemini.',
    });
  }
});

// Text-to-speech endpoint using gemini-3.8-flash-lite-tts
app.post('/api/gemini/tts', async (req, res) => {
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({
      error: 'Gemini API key not configured.',
    });
  }

  try {
    const { text, voice = 'Zephyr' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text parameter required.' });
    }

    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000), // safe limit for single response
              speechMetadata: {
                style: 'Gentle, friendly Grade 6 English tutor, slow and clear speech',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini.' });
    }

    res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (err: any) {
    console.error('Gemini TTS error:', err);
    res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// WebSocket Server for Gemini Live API Audio Streaming
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live audio WebSocket');

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message: 'Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets.',
      })
    );
    clientWs.close();
    return;
  }

  let session: any = null;

  try {
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    session = await aiClient.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: GRADE_6_TUTOR_SYSTEM_INSTRUCTION,
      },
      callbacks: {
        onmessage: (message: any) => {
          const audio =
            message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          const textPart =
            message.serverContent?.modelTurn?.parts?.[0]?.text;

          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }
          if (textPart) {
            clientWs.send(JSON.stringify({ type: 'transcript', text: textPart }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live session error:', err);
          clientWs.send(
            JSON.stringify({
              type: 'error',
              message: err.message || 'Gemini Live error occurred.',
            })
          );
        },
        onclose: () => {
          console.log('Gemini Live session closed');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'session_closed' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready', message: 'Gemini Live tutor is connected.' }));

    clientWs.on('message', (data: Buffer | string) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio && session) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (parsed.text && session) {
          session.sendRealtimeInput({
            text: parsed.text,
          });
        }
      } catch (e) {
        console.error('Error parsing client WS message:', e);
      }
    });

    clientWs.on('close', () => {
      console.log('Client WS disconnected, terminating Live session');
      try {
        if (session && typeof session.close === 'function') {
          session.close();
        }
      } catch (e) {
        // ignore
      }
    });
  } catch (err: any) {
    console.error('Failed to establish Gemini Live session:', err);
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message:
          err.message ||
          'Failed to connect to Gemini Live. You can use standard voice and text tutor mode.',
      })
    );
    clientWs.close();
  }
});

// Vite Middleware for development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
