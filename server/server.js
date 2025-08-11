// server/server.js
import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import Message from "./models/Message.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:5173"], // same as above
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// MongoDB and Database connection
try {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`✅ MongoDB connected to database: ${conn.connection.name}`);
} catch (err) {
  console.error("❌ MongoDB connection error:", err);
}

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});


io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const changes = req.body?.metaData?.entry?.[0]?.changes?.[0]?.value;

    if (!changes) {
      return res.status(400).json({ ok: false, msg: 'Invalid payload format' });
    }

    // Handle messages
    if (changes.messages && Array.isArray(changes.messages)) {
      for (const m of changes.messages) {
        const contact = changes.contacts?.[0] || {};
        const wa_id = contact.wa_id || m.from;

        // Try getting the contact name from payload
        let contact_name = contact.profile?.name || null;

        // If no name in payload, check DB for an existing name for this wa_id
        if (!contact_name) {
          const existing = await Message.findOne({ wa_id })
            .sort({ timestamp: -1 })
            .lean();
          if (existing?.contact_name) {
            contact_name = existing.contact_name;
          }
        }

        const direction = m.from === wa_id ? 'inbound' : 'outbound';

        const msgData = {
          wa_id,
          contact_name,
          from: m.from,
          msg_id: m.id,
          meta_msg_id: m.id,
          text: m.text?.body || '',
          timestamp: new Date(Number(m.timestamp) * 1000),
          direction,
          status: 'received',
          raw: req.body
        };

        await Message.updateOne(
          { msg_id: msgData.msg_id },
          { $setOnInsert: msgData },
          { upsert: true }
        );

        io.emit('message:new', msgData);
      }
    }

    // Handle statuses
    if (changes.statuses && Array.isArray(changes.statuses)) {
      for (const s of changes.statuses) {
        const meta_id = s.meta_msg_id || s.id;
        const newStatus = s.status;

        const updated = await Message.findOneAndUpdate(
          { $or: [{ msg_id: meta_id }, { meta_msg_id: meta_id }] },
          { $set: { status: newStatus } },
          { new: true }
        );

        if (updated) {
          io.emit('message:status', {
            msg_id: meta_id,
            status: newStatus,
            wa_id: updated.wa_id
          });
        }
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get all conversations grouped by wa_id
app.get("/api/conversations", async (req, res) => {
  try {
    const agg = await Message.aggregate([
      { $sort: { timestamp: -1 } }, // latest messages first
      {
        $group: {
          _id: "$wa_id",
          wa_id: { $first: "$wa_id" },
          all_names: { $push: "$contact_name" },
          last_text: { $first: "$text" },
          last_time: { $first: "$timestamp" },
          last_status: { $first: "$status" },
        },
      },
      {
        $addFields: {
          contact_name: {
            $first: {
              $filter: {
                input: "$all_names",
                as: "name",
                cond: { $ne: ["$$name", null] },
              },
            },
          },
        },
      },
      { $project: { all_names: 0 } },
      { $sort: { last_time: -1 } },
    ]);

    res.json(agg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a specific wa_id
app.get("/api/messages/:wa_id", async (req, res) => {
  try {
    const { wa_id } = req.params;
    const messages = await Message.find({ wa_id })
      .sort({ timestamp: 1 })
      .lean();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Send a demo message (store only, no external send)
app.post('/api/messages/:wa_id/send', async (req, res) => {
  try {
    const { wa_id } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Message text is required" });
    }

    // Fetch the latest contact name for the present wa_id
    let contact_name = null;
    const lastMsg = await Message.findOne({ wa_id, contact_name: { $ne: null } })
                                 .sort({ timestamp: -1 })
                                 .lean();
    if (lastMsg?.contact_name) {
      contact_name = lastMsg.contact_name;
    }

    const id = `local-${Date.now()}`;
    const msgData = {
      wa_id,
      contact_name, // use stored name if available
      from: process.env.BUSINESS_NUMBER || "BUSINESS",
      msg_id: id,
      meta_msg_id: id,
      text,
      timestamp: new Date(),
      direction: "outbound",
      status: "sent",
      raw: {}
    };

    const msg = await Message.create(msgData);

    io.emit('message:new', msgData); // Notify all clients in real time

    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running!" });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
