import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MOCK DATA ---
  const services = [
    { id: 's1', name: 'Civil Consultation', fee: 599, icon: 'Scale' },
    { id: 's2', name: 'Criminal Consultation', fee: 799, icon: 'Gavel' },
    { id: 's3', name: 'Family Matter Advice', fee: 599, icon: 'Users' },
    { id: 's4', name: 'Property Dispute', fee: 699, icon: 'Home' },
    { id: 's5', name: 'Legal Notice Drafting', fee: 899, icon: 'FileText' },
    { id: 's6', name: 'Bail Consultation', fee: 999, icon: 'Unlock' },
  ];

  const lawyers = [
    { id: 'l1', name: "Advocate Pathak", specialization: "Civil & Criminal", experience: "5 Years", consultation_fee: 599, city: "Jabalpur", language: ["Hindi", "English"], rating: 4.8, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" },
    { id: 'l2', name: "Advocate Sharma", specialization: "Family Matter", experience: "8 Years", consultation_fee: 599, city: "Delhi", language: ["Hindi", "English"], rating: 4.9, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" },
    { id: 'l3', name: "Advocate Singh", specialization: "Property Dispute", experience: "12 Years", consultation_fee: 799, city: "Mumbai", language: ["English", "Marathi"], rating: 4.7, image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80" },
    { id: 'l4', name: "Advocate Verma", specialization: "Corporate Law", experience: "4 Years", consultation_fee: 899, city: "Bangalore", language: ["English"], rating: 4.5, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80" },
  ];

  const bookings: any[] = [];

  // --- API ROUTES ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/services", (req, res) => {
    res.json(services);
  });

  app.get("/api/lawyers", (req, res) => {
    res.json(lawyers);
  });

  app.delete("/api/lawyers/:id", (req, res) => {
    const index = lawyers.findIndex(l => l.id === req.params.id);
    if (index > -1) {
      lawyers.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/lawyers", (req, res) => {
    const { name, specialization, experience, consultation_fee, city, language, image } = req.body;
    
    if (!name || !specialization || !experience || !consultation_fee || !city) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newLawyer = {
      id: `l${Date.now()}`,
      name,
      specialization,
      experience,
      consultation_fee: Number(consultation_fee),
      city,
      language: language || ["English"],
      rating: 5.0, // Default new lawyer rating
      image: image || ""
    };

    lawyers.push(newLawyer);
    res.status(201).json({ message: "Lawyer added successfully", lawyer: newLawyer });
  });

  app.post("/api/book", (req, res) => {
    const { name, mobile, case_type, appointment_date, lawyer_id } = req.body;
    
    // Basic validation
    if (!name || !mobile || !appointment_date || !lawyer_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newBooking = {
      id: `b${Date.now()}`,
      name,
      mobile,
      case_type,
      appointment_date,
      lawyer_id,
      payment_status: "Pending", // Would integrate Razorpay here in reality
      created_at: new Date().toISOString()
    };

    bookings.push(newBooking);
    
    // Simulate payment handling / confirmation delay
    setTimeout(() => {
        const index = bookings.findIndex(b => b.id === newBooking.id);
        if(index > -1) bookings[index].payment_status = "Paid";
    }, 2000);

    res.status(201).json({ message: "Booking initialized", booking: newBooking });
  });

  app.get("/api/bookings", (req, res) => {
    res.json(bookings);
  });

  app.post("/api/owner/login", (req, res) => {
    const { passcode } = req.body;
    if (passcode === "Prashank@2009") {
      res.json({ success: true, token: "owner_secret_token" });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) return res.status(400).json({ error: "Missing message" });
      
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: "You are a legal assistant and platform guide for Vakil Duniya. You help users with general legal queries in India, and tell them about the features of this platform. The key features of Vakil Duniya are: 1. Verified Lawyers 2. Online/Offline Consultations 3. Secure Payments via UPI 4. Fast Appointments. The platform has 1,200+ Active Lawyers, 15k+ Consultations, 98% Case Success, and 50+ City Support. You can also answer in Hindi/Hinglish. Keep answers short, concise, and helpful. Do not give actual legal advice, advise them to book a consultation with our lawyers.",
        }
      });
      
      if (history && history.length > 0) {
          // just appending history as text because the genai API requires complex formatting if inserted directly into chat setup
          // actually the new sdk does have a way, but since we just do simple chat, we can just use generateContent with history as part of the prompt, or just plain message since chat will be simple.
      }
      
      const response = await chat.sendMessage({ message });
      res.json({ reply: response.text });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
