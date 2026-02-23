import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGODB_URI);

let db;

async function getDB() {
  if (!db) {
    await client.connect();
    db = client.db("update_db");
  }
  return db;
}

app.get("/api/users", async (req, res) => {
  const database = await getDB();
  const users = database.collection("users");
  const data = await users.find().toArray();
  res.json(data);
});

app.post("/api/register", async (req, res) => {
  const { fullName, email, phone, role } = req.body;

  if (!fullName || !email || !phone || !role) {
    return res.status(400).json({ error: "All fields required" });
  }

  const database = await getDB();
  const users = database.collection("users");

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

export default app;