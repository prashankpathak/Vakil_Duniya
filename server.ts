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

  const servicesHierarchy = [
    {
      id: 'civil',
      categoryNumber: 1,
      titleHindi: '1. सिविल मामले (दीवानी)',
      titleEnglish: 'Civil Law (दीवानी)',
      badge: 'दीवानी कानून',
      iconName: 'Landmark',
      descriptionHindi: 'जमीन-जायदाद, पारिवारिक विवाद, व्यापारिक अनुबंध, वसीयत और कानूनी दस्तावेजों के सिविल उपचार व दीवानी वाद।',
      subCategories: [
        {
          id: 'property_disputes',
          category: 'civil',
          titleHindi: 'संपत्ति विवाद',
          titleEnglish: 'Property & Land Disputes',
          iconName: 'Home',
          badge: 'जमीन व संपत्ति',
          descriptionHindi: 'पैतृक भूमि, मकान, दुकान के बंटवारे, अवैध कब्जे और मालिकाना हक के दीवानी विवाद।',
          items: [
            {
              id: 'ancestral_partition_possession',
              titleHindi: 'पैतृक संपत्ति बंटवारा और कब्जा',
              titleEnglish: 'Ancestral Property Partition & Possession Suit',
              descriptionHindi: 'पुश्तैनी व पैतृक जायदाद में कानूनी हिस्सेदारी, संयुक्त परिवार संपत्ति का विभाजन एवं वास्तविक कब्जा दिलाना।',
              keyActsOrProvisions: 'Hindu Succession Act & Partition Suit (CPC)'
            },
            {
              id: 'stay_order_title_suit',
              titleHindi: 'स्टे ऑर्डर (Injunction) व टाइटल सूट',
              titleEnglish: 'Stay Order (Temporary / Permanent Injunction) & Title Declaration',
              descriptionHindi: 'अवैध निर्माण, बेदखली या बिक्री पर अंतरिम रोक (Stay) तथा अदालत द्वारा मालिकाना हक की घोषणा (Title Suit)।',
              keyActsOrProvisions: 'Order 39 Rules 1 & 2 CPC / Specific Relief Act'
            }
          ]
        },
        {
          id: 'family_matters',
          category: 'civil',
          titleHindi: 'पारिवारिक मामले',
          titleEnglish: 'Family Matters',
          iconName: 'Users',
          badge: 'पारिवारिक व वैवाहिक',
          descriptionHindi: 'वैवाहिक विवाद, तलाक, गुजारा भत्ता (भरण-पोषण) तथा नाबालिग बच्चों के संरक्षण व कस्टडी के मामले।',
          items: [
            {
              id: 'divorce_alimony',
              titleHindi: 'तलाक (Divorce) व भरण-पोषण (Alimony)',
              titleEnglish: 'Divorce Petition & Maintenance / Alimony',
              descriptionHindi: 'आपसी सहमति या विवादित तलाक याचिका, घरेलू हिंसा से सुरक्षा व मासिक भरण-पोषण (गुजारा भत्ता)।',
              keyActsOrProvisions: 'Section 13 Hindu Marriage Act / Section 125 CrPC'
            },
            {
              id: 'child_custody',
              titleHindi: 'बच्चों की कस्टडी (Child Custody)',
              titleEnglish: 'Child Custody, Guardianship & Visitation Rights',
              descriptionHindi: 'नाबालिग बच्चे के सर्वोत्तम हित में अभिरक्षा (Custody), संरक्षण व मिलने के अधिकार।',
              keyActsOrProvisions: 'Guardians and Wards Act, 1890'
            }
          ]
        },
        {
          id: 'contracts_commerce',
          category: 'civil',
          titleHindi: 'अनुबंध और व्यापार',
          titleEnglish: 'Contracts & Commerce',
          iconName: 'Briefcase',
          badge: 'व्यापार व रिकवरी',
          descriptionHindi: 'बिजनेस एग्रीमेंट्स, बकाया धन वसूली, पार्टनरशिप विवाद एवं अनुबंध के उल्लंघन पर हर्जाना वाद।',
          items: [
            {
              id: 'money_recovery_damages',
              titleHindi: 'धन वसूली (Recovery Suits) व हर्जाना',
              titleEnglish: 'Money Recovery Suits & Damages Claim',
              descriptionHindi: 'बकाया रकम की त्वरित वसूली (Order 37 CPC), चेक बाउंस व अनुबंध उल्लंघन पर आर्थिक नुकसान की भरपाई।',
              keyActsOrProvisions: 'Order 37 CPC / Indian Contract Act'
            },
            {
              id: 'agreement_partnership_disputes',
              titleHindi: 'एग्रीमेंट व पार्टनरशिप विवाद',
              titleEnglish: 'Agreement Breach & Partnership Disputes',
              descriptionHindi: 'व्यापारिक समझौतों का क्रियान्वयन, साझेदारी विलेख विवाद व मध्यस्थता (Arbitration)।',
              keyActsOrProvisions: 'Indian Partnership Act'
            }
          ]
        },
        {
          id: 'wills_drafting',
          category: 'civil',
          titleHindi: 'वसीयत व ड्राफ्टिंग',
          titleEnglish: 'Wills & Drafting',
          iconName: 'FileText',
          badge: 'ड्राफ्टिंग व वसीयत',
          descriptionHindi: 'वसीयतनामा, उत्तराधिकार प्रमाण पत्र, कोर्ट वाद पत्र (Plaint) व लिखित कथन (WS) का सटीक मसौदा।',
          items: [
            {
              id: 'succession_certificate',
              titleHindi: 'उत्तराधिकार प्रमाण पत्र (Succession Certificate)',
              titleEnglish: 'Succession Certificate & Probate',
              descriptionHindi: 'मृतक के बैंक खातों, शेयर्स व चल संपत्तियों के उत्तराधिकार हेतु न्यायालयीन प्रमाण पत्र प्राप्त करना।',
              keyActsOrProvisions: 'Indian Succession Act, 1925'
            },
            {
              id: 'plaint_written_statement',
              titleHindi: 'वाद पत्र (Plaint) व लिखित कथन (Written Statement)',
              titleEnglish: 'Plaint Drafting & Written Statement (WS)',
              descriptionHindi: 'कोर्ट केस का प्राथमिक दावा (वाद पत्र) तथा विपक्षी के दावे का तथ्यात्मक व कानूनी जवाब (लिखित कथन)।',
              keyActsOrProvisions: 'Order 7 & Order 8 CPC'
            }
          ]
        }
      ]
    },
    {
      id: 'criminal',
      categoryNumber: 2,
      titleHindi: '2. क्रिमिनल मामले (आपराधिक)',
      titleEnglish: 'Criminal Law (आपराधिक)',
      badge: 'फौजदारी / आपराधिक',
      iconName: 'Gavel',
      descriptionHindi: 'एफआईआर दर्ज कराना, धारा 156(3), अग्रिम व नियमित जमानत, 482 रद्द (Quashing), ट्रायल डिस्चार्ज और अपील।',
      subCategories: [
        {
          id: 'fir_investigation',
          category: 'criminal',
          titleHindi: 'एफआईआर और जांच',
          titleEnglish: 'FIR & Investigation',
          iconName: 'ShieldAlert',
          badge: 'पुलिस व जांच',
          descriptionHindi: 'पुलिस थाने में एफआईआर, जीरो एफआईआर अथवा पुलिस द्वारा इनकार पर मजिस्ट्रेट के माध्यम से केस दर्ज कराना।',
          items: [
            {
              id: 'fir_zero_fir',
              titleHindi: 'एफआईआर दर्ज कराना / जीरो एफआईआर',
              titleEnglish: 'FIR Registration & Zero FIR Transfer',
              descriptionHindi: 'संज्ञेय अपराधों में थाने पर प्रथम सूचना रिपोर्ट (FIR) दर्ज कराना व Zero FIR प्रक्रिया।',
              keyActsOrProvisions: 'Section 154 CrPC / BNSS'
            },
            {
              id: 'magistrate_156_3',
              titleHindi: 'मजिस्ट्रेट के समक्ष धारा 156(3) आवेदन',
              titleEnglish: 'Application u/s 156(3) CrPC before Magistrate',
              descriptionHindi: 'पुलिस द्वारा एफआईआर न लिखने पर सक्षम न्यायालय में जांच व एफआईआर दर्ज कराने का न्यायिक आदेश प्राप्त करना।',
              keyActsOrProvisions: 'Section 156(3) CrPC'
            }
          ]
        },
        {
          id: 'bail_matters',
          category: 'criminal',
          titleHindi: 'जमानत के मामले',
          titleEnglish: 'Bail Matters',
          iconName: 'Unlock',
          badge: 'जमानत व राहत',
          descriptionHindi: 'गिरफ्तारी से पूर्व अग्रिम जमानत (Anticipatory Bail) तथा हिरासत के बाद नियमित एवं अंतरिम जमानत।',
          items: [
            {
              id: 'anticipatory_bail',
              titleHindi: 'अग्रिम जमानत (Anticipatory Bail)',
              titleEnglish: 'Anticipatory Bail (Pre-Arrest) - Sec 438',
              descriptionHindi: 'झूठे मामले या गिरफ्तारी की आशंका पर सत्र न्यायालय अथवा हाई कोर्ट से अग्रिम राहत।',
              keyActsOrProvisions: 'Section 438 CrPC / Sec 482 BNSS'
            },
            {
              id: 'regular_bail',
              titleHindi: 'नियमित जमानत (Regular Bail)',
              titleEnglish: 'Regular Bail & Interim Bail - Sec 437/439',
              descriptionHindi: 'पुलिस या न्यायिक अभिरक्षा से रिहाई हेतु सक्षम मजिस्ट्रेट, सत्र न्यायालय एवं उच्च न्यायालय में जमानत याचिका।',
              keyActsOrProvisions: 'Section 437 & 439 CrPC'
            }
          ]
        },
        {
          id: 'trial_relief',
          category: 'criminal',
          titleHindi: 'ट्रायल और राहत',
          titleEnglish: 'Trial & Relief',
          iconName: 'Scale',
          badge: 'ट्रायल व जिरह',
          descriptionHindi: 'झूठी एफआईआर को हाई कोर्ट से रद्द कराना (Quashing), आरोप मुक्त (Discharge) याचिका एवं गवाहों की सशक्त जिरह।',
          items: [
            {
              id: 'quashing_sec_482',
              titleHindi: 'झूठी एफआईआर रद्द कराना (Quashing - Sec 482)',
              titleEnglish: 'Quashing of False FIR u/s 482 CrPC',
              descriptionHindi: 'दुर्भावनापूर्ण या निराधार आपराधिक मुकदमों और चार्जशीट को हाई कोर्ट के अंतर्निहित अधिकारों से रद्द कराना।',
              keyActsOrProvisions: 'Section 482 CrPC'
            },
            {
              id: 'discharge_and_cross_exam',
              titleHindi: 'डिस्चार्ज एप्लीकेशन (बचने के लिए) और गवाहों की जिरह',
              titleEnglish: 'Discharge Application & Witness Cross-Examination',
              descriptionHindi: 'ट्रायल शुरू होने से पहले आरोप मुक्त (Discharge) की बहस तथा न्यायालय में अभियोजन के गवाहों की सटीक जिरह।',
              keyActsOrProvisions: 'Section 227/239 CrPC'
            }
          ]
        },
        {
          id: 'appeals_and_sentencing',
          category: 'criminal',
          titleHindi: 'अपील और सजा',
          titleEnglish: 'Appeals',
          iconName: 'Gavel',
          badge: 'अपील व रिवीजन',
          descriptionHindi: 'निचली अदालतों के दोषसिद्धि व दंडादेश के विरुद्ध उच्च न्यायालय (High Court) में आपराधिक अपील व रिवीजन।',
          items: [
            {
              id: 'high_court_appeal',
              titleHindi: 'निचली अदालत के फैसले के खिलाफ हाई कोर्ट में अपील',
              titleEnglish: 'High Court Appeal Against Trial Court Conviction',
              descriptionHindi: 'सत्र न्यायालय द्वारा दी गई सजा, अर्थदंड अथवा आदेश के खिलाफ उच्च न्यायालय में स्थगन (Stay) व अपील।',
              keyActsOrProvisions: 'Section 374 & Section 397/401 CrPC'
            }
          ]
        }
      ]
    }
  ];

  const flatServices = [
    { id: 's1', name: 'Civil Consultation (सिविल परामर्श)', icon: 'Scale', category: 'civil', hindiTitle: 'सिविल परामर्श' },
    { id: 's2', name: 'Criminal Consultation (आपराधिक परामर्श)', icon: 'Gavel', category: 'criminal', hindiTitle: 'आपराधिक परामर्श' },
    { id: 's3', name: 'Family & Matrimonial (पारिवारिक व वैवाहिक)', icon: 'Users', category: 'civil', hindiTitle: 'पारिवारिक व वैवाहिक' },
    { id: 's4', name: 'Property & Land Dispute (संपत्ति विवाद)', icon: 'Home', category: 'civil', hindiTitle: 'संपत्ति विवाद' },
    { id: 's5', name: 'Contracts & Recovery (अनुबंध व धन वसूली)', icon: 'Briefcase', category: 'civil', hindiTitle: 'अनुबंध व धन वसूली' },
    { id: 's6', name: 'Wills & Drafting (वसीयत व ड्राफ्टिंग)', icon: 'FileText', category: 'civil', hindiTitle: 'वसीयत व ड्राफ्टिंग' },
    { id: 's7', name: 'FIR & 156(3) CrPC (एफआईआर व जांच)', icon: 'ShieldAlert', category: 'criminal', hindiTitle: 'एफआईआर व 156(3)' },
    { id: 's8', name: 'Bail Matters (अग्रिम व नियमित जमानत)', icon: 'Unlock', category: 'criminal', hindiTitle: 'अग्रिम व नियमित जमानत' },
    { id: 's9', name: '482 Quashing & Trial Relief (ट्रायल व राहत)', icon: 'Scale', category: 'criminal', hindiTitle: '482 क्वैशिंग व ट्रायल राहत' },
    { id: 's10', name: 'High Court Appeals (हाई कोर्ट अपील)', icon: 'Gavel', category: 'criminal', hindiTitle: 'हाई कोर्ट अपील' },
  ];

  // --- API ROUTES ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/services", (req, res) => {
    res.json(flatServices);
  });

  app.get("/api/services/hierarchy", (req, res) => {
    res.json(servicesHierarchy);
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
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      const systemInstruction = `You are "न्याय सखा (Nyaya Sakha)" — the dedicated, highly intelligent AI Legal Assistant for "Vakil Duniya" (वकील दुनिया - www.vakilduniya.in), India's premier digital platform connecting citizens with verified advocates.

Your primary goal is to help citizens understand Indian legal procedures, their constitutional & statutory rights, civil and criminal remedies, and guide them to find and book appointments with verified advocates on Vakil Duniya.

Core Knowledge Base:
1. 🏛️ सिविल कानून (Civil Law - दीवानी मामले):
   - संपत्ति विवाद: पैतृक संपत्ति बंटवारा (Partition Suit under Hindu Succession Act), स्टे ऑर्डर (Temporary Injunction under Order 39 Rules 1 & 2 CPC), मालिकाना हक का वाद (Title Declaration Suit), अवैध कब्जा हटाना (Specific Relief Act).
   - पारिवारिक कानून: तलाक (Divorce under Section 13 Hindu Marriage Act / Special Marriage Act), भरण-पोषण (Maintenance under Section 125 CrPC / Section 144 BNSS), बच्चों की कस्टडी (Guardians & Wards Act).
   - अनुबंध व व्यापार: बकाया धन वसूली (Summary Suit Order 37 CPC), चेक बाउंस (Section 138 NI Act), एग्रीमेंट उल्लंघन पर हर्जाना.
   - वसीयत व ड्राफ्टिंग: वसीयतनामा (Wills & Probate), उत्तराधिकार प्रमाण पत्र (Succession Certificate under Indian Succession Act), कोर्ट वाद पत्र (Plaint Order 7) व जवाब (Written Statement Order 8).

2. 🚨 आपराधिक कानून (Criminal Law - क्रिमिनल मामले):
   - एफआईआर व जांच: धारा 154 CrPC (Sec 173 BNSS) के तहत एफआईआर / जीरो एफआईआर दर्ज कराना। पुलिस द्वारा एफआईआर न लिखने पर एसपी को शिकायत और धारा 156(3) CrPC (Sec 175 BNSS) के तहत मजिस्ट्रेट से एफआईआर का आदेश प्राप्त करना।
   - जमानत के नियम: गिरफ्तारी से पूर्व सत्र न्यायालय या हाई कोर्ट से अग्रिम जमानत (Anticipatory Bail under Section 438 CrPC / Sec 482 BNSS), गिरफ्तारी के बाद नियमित जमानत (Regular Bail under Section 437/439 CrPC / Sec 480/483 BNSS)।
   - ट्रायल व राहत: झूठी या दुर्भावनापूर्ण एफआईआर को हाई कोर्ट द्वारा रद्द कराना (Quashing under Section 482 CrPC / Sec 528 BNSS), डिस्चार्ज एप्लीकेशन (Section 227/239 CrPC), गवाहों की सशक्त जिरह (Cross-examination under Indian Evidence Act / Bharatiya Sakshya Adhiniyam).
   - अपील व रिवीजन: दोषसिद्धि व सजा के विरुद्ध उच्च न्यायालय (High Court) में आपराधिक अपील (Section 374 CrPC) व रिवीजन (Section 397 CrPC).

3. Vakil Duniya Platform Rules:
   - "वकील खोजें (Find a Lawyer)": उपयोगकर्ता शहर, राज्य, अनुभव, और विशेषज्ञता (सिविल, क्रिमिनल, पारिवारिक, संपत्ति) के अनुसार वकील खोज सकते हैं।
   - "परामर्श बुकिंग (Book Appointment)": उपयोगकर्ता सीधे ऑनलाइन या इन-पर्सन मीटिंग के लिए फॉर्म भर सकते हैं।
   - "परामर्श शुल्क (Consultation Fees)": प्लेटफॉर्म पर कोई फिक्स्ड शुल्क नहीं है; वकील केस की जटिलता के अनुसार सीधे ऑफलाइन अपने स्तर पर शुल्क तय करते हैं।
   - "अस्वीकरण (Legal Disclaimer)": यह चैटबॉट केवल कानूनी जागरूकता और प्रक्रियात्मक मार्गदर्शन प्रदान करता है। विशिष्ट विधिक सलाह के लिए हमेशा वकील से परामर्श लें।

Communication Style:
- Respond in clear, respectful, polite Hindi, English, or Hinglish depending on what the user speaks.
- Structure your answer with clear bullet points, relevant legal sections (धाराएँ / Acts), step-by-step procedures, and direct recommendations.
- Keep responses concise yet complete (typically 2 to 4 structured points).`;

      // Build multi-turn contents
      const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const item of history) {
          if (item && item.content && typeof item.content === 'string' && item.content.trim()) {
            formattedContents.push({
              role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
              parts: [{ text: item.content.trim() }]
            });
          }
        }
      }

      // Append current message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message.trim() }]
      });

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: formattedContents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            topP: 0.95
          }
        });

        const reply = response.text || "नमस्ते! मैं 'न्याय सखा' आपकी कानूनी सहायता के लिए उपलब्ध हूँ। कृपया अपना प्रश्न स्पष्ट करें या वकील से परामर्श के लिए 'Find a Lawyer' विकल्प चुनें।";
        return res.json({ reply });
      } catch (geminiError: any) {
        console.error("Gemini API call error:", geminiError?.message || geminiError);
        
        // Intelligent Fallback Rule Engine if API key is missing or quota exceeded
        const q = message.toLowerCase();
        let fallbackReply = "";

        if (q.includes("fir") || q.includes("एफआईआर") || q.includes("156") || q.includes("police") || q.includes("थाना")) {
          fallbackReply = `**🚨 एफआईआर (FIR) और धारा 156(3) CrPC संबंधी कानूनी प्रक्रिया:**

1. **थाने में रिपोर्ट:** संज्ञेय अपराध में पुलिस धारा 154 CrPC के तहत तुरंत एफआईआर दर्ज करने के लिए बाध्य है (ललिता कुमारी बनाम यूपी राज्य जजमेंट)।
2. **पुलिस मना करे तो:** संबंधित पुलिस अधीक्षक (SP/DCP) को लिखित में स्पीड पोस्ट व ईमेल द्वारा शिकायत भेजें।
3. **मजिस्ट्रेट के समक्ष धारा 156(3) CrPC:** यदि फिर भी कार्रवाई न हो, तो अधिवक्ता के माध्यम से न्यायिक मजिस्ट्रेट के समक्ष धारा 156(3) का आवेदन लगाएं, जिससे कोर्ट पुलिस को तत्काल FIR दर्ज कर जांच का आदेश देती है।

📌 *वकील दुनिया पर सत्यापित क्रिमिनल वकीलों से तुरंत सलाह लेने के लिए 'Find a Lawyer' पर जाएं।*`;
        } else if (q.includes("bail") || q.includes("जमानत") || q.includes("438") || q.includes("439")) {
          fallbackReply = `**🔓 जमानत (Bail) के प्रकार एवं कानूनी प्रावधान:**

1. **अग्रिम जमानत (Anticipatory Bail - Sec 438 CrPC / Sec 482 BNSS):** यदि आपको किसी गैर-जमानती मामले में अनुचित गिरफ्तारी की आशंका है, तो गिरफ्तारी से पूर्व सत्र न्यायालय (Sessions Court) या हाई कोर्ट में अग्रिम जमानत याचिका दायर कर सकते हैं।
2. **नियमित जमानत (Regular Bail - Sec 437/439 CrPC):** यदि व्यक्ति हिरासत में है, तो अदालत से नियमित जमानत हेतु आवेदन किया जाता है।
3. **अंतरिम जमानत (Interim Bail):** मुख्य जमानत याचिका के निपटारे तक त्वरित अल्पकालिक राहत के लिए।

📌 *आप वकील दुनिया से तुरंत अनुभवी बेल एडवोकेट से परामर्श बुक कर सकते हैं।*`;
        } else if (q.includes("stay") || q.includes("स्टे") || q.includes("कब्जा") || q.includes("जमीन") || q.includes("संपत्ति") || q.includes("property") || q.includes("बंटवारा")) {
          fallbackReply = `**🏠 संपत्ति विवाद, बंटवारा एवं स्टे ऑर्डर (Injunction):**

1. **स्टे ऑर्डर (Order 39 Rules 1 & 2 CPC):** जमीन पर अवैध निर्माण, बिक्री या बेदखली रोकने के लिए सिविल कोर्ट से तत्काल स्थगन आदेश (Stay/Temporary Injunction) लिया जाता है। इसके लिए 3 मुख्य बिंदु जरूरी हैं: *Prima Facie Case*, *Balance of Convenience*, और *Irreparable Loss*।
2. **पैतृक संपत्ति बंटवारा (Partition Suit):** यदि सह-खातेदार हिस्सा नहीं दे रहे हैं, तो सिविल जज के समक्ष विभाजन वाद (Partition Suit) दायर कर अपना कानूनी हक प्राप्त करें।
3. **अवैध कब्जा:** Specific Relief Act की धारा 6 के तहत 6 माह के भीतर कब्जा वापस पाने का वाद दाखिल किया जा सकता है।

📌 *वकील दुनिया पर अपनी नजदीकी सिटी के सिविल एडवोकेट खोजें और परामर्श बुक करें।*`;
        } else if (q.includes("divorce") || q.includes("तलाक") || q.includes("maintenance") || q.includes("गुजारा") || q.includes("खर्चा") || q.includes("custody") || q.includes("शादी")) {
          fallbackReply = `**👨‍👩‍👦 पारिवारिक व वैवाहिक मामले (Matrimonial Remedies):**

1. **तलाक (Divorce):** 
   - **आपसी सहमति से (Mutual Consent - Sec 13B HMA):** दोनों पक्षों की सहमति से 6 माह में त्वरित तलाक।
   - **विवादित तलाक (Contested Divorce - Sec 13 HMA):** क्रूरता, परित्याग, या अन्य आधारों पर।
2. **भरण-पोषण व गुजारा भत्ता (Sec 125 CrPC / Domestic Violence Act):** पत्नी और बच्चों के जीवन यापन हेतु मासिक भरण-पोषण की मांग।
3. **बच्चों की कस्टडी:** बच्चे के सर्वोत्तम हित (Welfare of Child) को ध्यान में रखते हुए गार्जियनशिप कोर्ट तय करती है।

📌 *पारिवारिक मामलों के विशेषज्ञ अधिवक्ता से बात करने के लिए अपॉइंटमेंट बुक करें।*`;
        } else if (q.includes("fee") || q.includes("फीस") || q.includes("चार्ज") || q.includes("price") || q.includes("cost")) {
          fallbackReply = `**⚖️ वकील दुनिया परामर्श शुल्क व्यवस्था:**

- **ऑफलाइन व निष्पक्ष व्यवस्था:** वकील दुनिया पर कोई ऑनलाइन निश्चित कंसल्टेशन फीस नहीं ली जाती है। 
- केस की जटिलता, अदालत (District Court / High Court) और आवश्यक ड्राफ्टिंग के आधार पर संबंधित अधिवक्ता सीधे आपके साथ व्यक्तिगत रूप से फीस तय करते हैं।
- आप वेबसाइट पर मुफ्त में अपॉइंटमेंट रिक्वेस्ट भेज सकते हैं!`;
        } else {
          fallbackReply = `**⚖️ न्याय सखा (Nyaya Sakha) - वकील दुनिया AI कानूनी सहायक**

नमस्ते! मैं आपकी निम्नलिखित मामलों में सहायता कर सकता हूँ:
- **🏛️ सिविल मामले:** संपत्ति बंटवारा, स्टे आर्डर (Order 39 CPC), अनुबंध, रिकवरी, वसीयत व Plaint/WS।
- **🚨 क्रिमिनल मामले:** FIR दर्ज कराना, 156(3) CrPC मजिस्ट्रेट आवेदन, अग्रिम व नियमित जमानत, 482 Quashing, हाई कोर्ट अपील।
- **👨‍👩‍👦 पारिवारिक मामले:** तलाक, भरण-पोषण (Sec 125 CrPC), बच्चों की कस्टडी।
- **🤝 वकील खोजें व परामर्श बुक करें:** अपने शहर में सत्यापित अधिवक्ताओं से तुरंत संपर्क।

कृपया अपनी कानूनी समस्या या सवाल यहाँ विस्तार से लिखें!`;
        }

        return res.json({ reply: fallbackReply });
      }
    } catch (error: any) {
      console.error("Chat route critical error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
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
