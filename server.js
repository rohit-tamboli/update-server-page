import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const db = client.db("auth-db");
    const users = db.collection("users");

    app.post("/api/register", async (req, res) => {
      const { fullName, email, phone, role } = req.body;

      if (!fullName || !email || !phone || !role) {
        return res.status(400).json({ error: "All fields required" });
      }

      const existing = await users.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const result = await users.insertOne({
        fullName,
        email,
        phone,
        role,
        createdAt: new Date(),
      });

      res.json({ success: true, userId: result.insertedId });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB Error:", err);
  }
}

startServer();