import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Razorpay from "razorpay";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

let razorpayInstance: Razorpay | null = null;
function getRazorpay(): Razorpay | null {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return null;
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MOCK DATA / PERSISTENCE ---
  const DATA_FILE = path.join(process.cwd(), "database.json");

  function loadData() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed.users) parsed.users = [];
        return parsed;
      } catch (e) {
        console.error("Error reading database.json", e);
      }
    }
    return {
      lawyers: [
        { id: 'l1', name: "Advocate Pathak", specialization: "Civil & Property Dispute", experience: "5 Years", consultation_fee: 599, city: "Jabalpur", language: ["Hindi", "English"], rating: 4.8, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", mobile_number: "6263364561", bar_enrollment: "MP/1024/2021", is_verified: true, approval_status: "approved" },
        { id: 'l2', name: "Advocate Sharma", specialization: "Family Matter", experience: "8 Years", consultation_fee: 599, city: "Delhi", language: ["Hindi", "English"], rating: 4.9, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", mobile_number: "9876543210", bar_enrollment: "D/4512/2018", is_verified: true, approval_status: "approved" },
        { id: 'l3', name: "Advocate Singh", specialization: "Civil & Property Dispute", experience: "12 Years", consultation_fee: 799, city: "Mumbai", language: ["English", "Marathi"], rating: 4.7, image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80", mobile_number: "9123456780", bar_enrollment: "MAH/7890/2014", is_verified: true, approval_status: "approved" },
        { id: 'l4', name: "Advocate Verma", specialization: "Corporate Law", experience: "4 Years", consultation_fee: 899, city: "Bangalore", language: ["English"], rating: 4.5, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80", mobile_number: "9988776655", bar_enrollment: "KAR/2341/2022", is_verified: true, approval_status: "approved" },
      ],
      bookings: [
        {
          id: "b_demo1",
          name: "Rohan Kumar",
          mobile: "9876543210",
          userEmail: "client.rohan@gmail.com",
          case_type: "Property Dispute",
          appointment_date: "2026-08-28",
          lawyer_id: "l1",
          consultation_mode: "Online Consultation",
          status: "Pending",
          payment_status: "Paid",
          created_at: new Date().toISOString()
        }
      ],
      users: [
        {
          id: "u_admin",
          name: "Prashank Pathak",
          email: "prashankpathak@gmail.com",
          mobile: "6263364561",
          role: "admin",
          created_at: "2026-01-01T00:00:00.000Z"
        },
        {
          id: "u_demo1",
          name: "Rohan Kumar",
          email: "client.rohan@gmail.com",
          mobile: "9876543210",
          role: "client",
          created_at: new Date().toISOString()
        }
      ]
    };
  }

  function saveData(data: any) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  const db = loadData();
  const lawyers = db.lawyers;
  const bookings = db.bookings;
  const users = db.users || [];

  const services = [
    { id: 's1', name: 'Civil Consultation', fee: 599, icon: 'Scale' },
    { id: 's2', name: 'Criminal Consultation', fee: 799, icon: 'Gavel' },
    { id: 's3', name: 'Family Matter Advice', fee: 599, icon: 'Users' },
    { id: 's4', name: 'Property Dispute', fee: 699, icon: 'Home' },
    { id: 's5', name: 'Legal Notice Drafting', fee: 899, icon: 'FileText' },
    { id: 's6', name: 'Bail Consultation', fee: 999, icon: 'Unlock' },
  ];

  // --- API ROUTES ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/services", (req, res) => {
    res.json(services);
  });

  // --- LAWYERS ---
  app.get("/api/lawyers", (req, res) => {
    res.json(lawyers);
  });

  app.delete("/api/lawyers/:id", (req, res) => {
    const index = lawyers.findIndex(l => l.id === req.params.id);
    if (index > -1) {
      lawyers.splice(index, 1);
      saveData({ lawyers, bookings, users });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.put("/api/lawyers/:id", (req, res) => {
    const id = req.params.id;
    const index = lawyers.findIndex(l => l.id === id);
    if (index > -1) {
      lawyers[index] = {
        ...lawyers[index],
        ...req.body,
        id
      };
      saveData({ lawyers, bookings, users });
      res.json({ message: "Lawyer updated successfully", lawyer: lawyers[index] });
    } else {
      // If not found by ID, check by uid
      const uidIndex = lawyers.findIndex(l => l.uid === id);
      if (uidIndex > -1) {
        lawyers[uidIndex] = {
          ...lawyers[uidIndex],
          ...req.body
        };
        saveData({ lawyers, bookings, users });
        res.json({ message: "Lawyer updated successfully", lawyer: lawyers[uidIndex] });
      } else {
        // Create new
        const newLawyer = {
          id: id.startsWith('l') ? id : `l_${id}`,
          ...req.body
        };
        lawyers.push(newLawyer);
        saveData({ lawyers, bookings, users });
        res.json({ message: "Lawyer registered", lawyer: newLawyer });
      }
    }
  });

  app.post("/api/lawyers", (req, res) => {
    const { 
      id, 
      uid, 
      name, 
      email, 
      specialization, 
      experience, 
      consultation_fee, 
      city, 
      state, 
      address, 
      pincode, 
      language, 
      image, 
      upi_id, 
      mobile_number, 
      consultation_mode, 
      bar_enrollment, 
      bio, 
      is_verified, 
      approval_status,
      approval_remarks,
      portal_fee_paid 
    } = req.body;
    
    if (!name || !specialization) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lawyerId = id || (uid ? `l_${uid}` : `l${Date.now()}`);
    const existingIndex = lawyers.findIndex(l => l.id === lawyerId || (uid && l.uid === uid) || (email && l.email?.toLowerCase() === email.toLowerCase()));

    const lawyerData = {
      id: lawyerId,
      uid: uid || "",
      name,
      email: email || "",
      specialization,
      experience: experience || "5 Years",
      consultation_fee: Number(consultation_fee || 599),
      city: city || "Jabalpur",
      state: state || "Madhya Pradesh",
      address: address || "",
      pincode: pincode || "",
      language: Array.isArray(language) ? language : (typeof language === 'string' ? language.split(',').map((s: string) => s.trim()) : ["Hindi", "English"]),
      rating: 5.0,
      image: image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
      upi_id: upi_id || "",
      mobile_number: mobile_number || "",
      consultation_mode: consultation_mode || "Online Consultation",
      bar_enrollment: bar_enrollment || "",
      bio: bio || "",
      is_verified: is_verified !== undefined ? is_verified : false,
      approval_status: approval_status || (is_verified ? "approved" : "pending"),
      approval_remarks: approval_remarks || "",
      portal_fee_paid: portal_fee_paid !== undefined ? portal_fee_paid : true,
      created_at: new Date().toISOString()
    };

    if (existingIndex > -1) {
      lawyers[existingIndex] = { ...lawyers[existingIndex], ...lawyerData };
      saveData({ lawyers, bookings, users });
      return res.json({ message: "Lawyer updated successfully", lawyer: lawyers[existingIndex] });
    }

    lawyers.push(lawyerData);
    saveData({ lawyers, bookings, users });
    res.status(201).json({ message: "Lawyer added successfully", lawyer: lawyerData });
  });

  // --- USERS MANAGEMENT ---
  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    const { name, email, mobile, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existingIndex = users.findIndex(u => u.email?.toLowerCase() === email.toLowerCase() || (u.id && u.id === req.body.id));
    if (existingIndex > -1) {
      // Update existing
      users[existingIndex] = {
        ...users[existingIndex],
        name: name || users[existingIndex].name,
        mobile: mobile || users[existingIndex].mobile,
        role: role || users[existingIndex].role || 'client',
        updated_at: new Date().toISOString()
      };
      saveData({ lawyers, bookings, users });
      return res.json({ message: "User updated", user: users[existingIndex] });
    }

    const newUser = {
      id: req.body.id || `u${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      mobile: mobile || "",
      role: role || (email.toLowerCase() === "prashankpathak@gmail.com" ? "admin" : "client"),
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveData({ lawyers, bookings, users });
    res.status(201).json({ message: "User registered successfully", user: newUser });
  });

  app.delete("/api/users/:id", (req, res) => {
    const id = req.params.id;
    const userIndex = users.findIndex(u => u.id === id || u.email === id);
    if (userIndex > -1) {
      const user = users[userIndex];
      if (user.email?.toLowerCase() === "prashankpathak@gmail.com") {
        return res.status(403).json({ error: "Cannot delete the super administrator." });
      }
      users.splice(userIndex, 1);
      saveData({ lawyers, bookings, users });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // --- BOOKINGS MANAGEMENT & STATUS UPDATES ---
  app.post("/api/book", (req, res) => {
    const { name, mobile, case_type, appointment_date, lawyer_id, consultation_mode, userId, userEmail } = req.body;
    
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
      consultation_mode: consultation_mode || "Online Consultation",
      userId: userId || "",
      userEmail: userEmail || "",
      status: "Pending", // Default appointment status is Pending for admin review
      payment_status: "Paid",
      created_at: new Date().toISOString()
    };

    bookings.push(newBooking);

    // Auto-record user in users list if not present
    if (userEmail) {
      const uIndex = users.findIndex(u => u.email?.toLowerCase() === userEmail.toLowerCase());
      if (uIndex === -1) {
        users.push({
          id: userId || `u${Date.now()}`,
          name: name || userEmail.split('@')[0],
          email: userEmail,
          mobile: mobile || "",
          role: "client",
          created_at: new Date().toISOString()
        });
      }
    }

    saveData({ lawyers, bookings, users });

    res.status(201).json({ message: "Booking initialized", booking: newBooking });
  });

  app.get("/api/bookings", (req, res) => {
    const { userId, userEmail } = req.query;
    if (userId && typeof userId === 'string') {
      const userBookings = bookings.filter((b: any) => b.userId === userId || (userEmail && b.userEmail === userEmail));
      return res.json(userBookings);
    }
    res.json(bookings);
  });

  // Update appointment status (Pending, Accepted, Disposed, Cancelled)
  app.patch("/api/bookings/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ["Pending", "Accepted", "Disposed", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
    }

    const booking = bookings.find((b: any) => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.status = status;
    if (remarks !== undefined) {
      booking.remarks = remarks;
    }
    booking.updated_at = new Date().toISOString();

    saveData({ lawyers, bookings, users });
    res.json({ message: `Appointment status updated to ${status}`, booking });
  });

  // Delete booking
  app.delete("/api/bookings/:id", (req, res) => {
    const { id } = req.params;
    const index = bookings.findIndex((b: any) => b.id === id);
    if (index > -1) {
      bookings.splice(index, 1);
      saveData({ lawyers, bookings, users });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  });

  // --- ADMIN / OWNER AUTHENTICATION ---
  app.post("/api/owner/login", (req, res) => {
    const { email, password, passcode } = req.body;
    
    const adminEmail = "prashankpathak@gmail.com";
    const validPasscodes = ["Prashank@2009", "admin123", "Admin@123", "Vakil@2026"];

    // Case 1: Passcode only
    if (passcode && validPasscodes.includes(passcode)) {
      return res.json({ 
        success: true, 
        email: adminEmail, 
        role: "admin", 
        token: "admin_verified_token_" + Date.now() 
      });
    }

    // Case 2: Email + Password verification
    if (email) {
      if (email.trim().toLowerCase() !== adminEmail) {
        return res.status(403).json({ 
          error: "Access Denied: You are not authorized as Platform Administrator." 
        });
      }

      if (!password || !validPasscodes.includes(password)) {
        return res.status(401).json({ error: "Invalid password for administrator account." });
      }

      return res.json({ 
        success: true, 
        email: adminEmail, 
        role: "admin", 
        token: "admin_verified_token_" + Date.now() 
      });
    }

    res.status(400).json({ error: "Email and password or valid passcode required." });
  });

  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount) return res.status(400).json({ error: "Missing amount" });
      
      const rzp = getRazorpay();
      if (!rzp) {
        return res.status(503).json({ error: "Razorpay is not configured on the server." });
      }
      const order = await rzp.orders.create({
        amount: Math.round(amount * 100), // amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      });
      res.json(order);
    } catch (err: any) {
      console.error("Razorpay error:", err.message);
      res.status(500).json({ error: err.message || "Failed to create Razorpay order." });
    }
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
