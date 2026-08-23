import { LegalServiceMainCategory, Service } from '../types';

export const INDIAN_LEGAL_SERVICES_DATA: LegalServiceMainCategory[] = [
  {
    id: 'civil',
    categoryNumber: 1,
    titleHindi: '1. सिविल मामले (दीवानी)',
    titleEnglish: 'Civil Law & Property Matters',
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
        titleEnglish: 'Family Matters & Matrimonial Law',
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
            descriptionHindi: 'नाबालिग बच्चे के सर्वोत्तम हित में अभिरक्षा (Custody), संरक्षण व मिलने के अधिकार (Visitation Rights)।',
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
            titleEnglish: 'Money Recovery Suits (Summary Suit) & Damages Claim',
            descriptionHindi: 'बकाया रकम की त्वरित वसूली (Order 37 CPC), चेक बाउंस व अनुबंध उल्लंघन पर आर्थिक नुकसान की भरपाई।',
            keyActsOrProvisions: 'Order 37 CPC / Indian Contract Act, 1872'
          },
          {
            id: 'agreement_partnership_disputes',
            titleHindi: 'एग्रीमेंट व पार्टनरशिप विवाद',
            titleEnglish: 'Agreement Breach & Partnership Business Disputes',
            descriptionHindi: 'व्यापारिक समझौतों का क्रियान्वयन, साझेदारी विलेख (Partnership Deed) विवाद व मध्यस्थता (Arbitration)।',
            keyActsOrProvisions: 'Indian Partnership Act / Arbitration & Conciliation'
          }
        ]
      },
      {
        id: 'wills_drafting',
        category: 'civil',
        titleHindi: 'वसीयत व ड्राफ्टिंग',
        titleEnglish: 'Wills & Legal Drafting',
        iconName: 'FileText',
        badge: 'ड्राफ्टिंग व वसीयत',
        descriptionHindi: 'वसीयतनामा, उत्तराधिकार प्रमाण पत्र, कोर्ट वाद पत्र (Plaint) व लिखित कथन (WS) का सटीक मसौदा।',
        items: [
          {
            id: 'succession_certificate',
            titleHindi: 'उत्तराधिकार प्रमाण पत्र (Succession Certificate)',
            titleEnglish: 'Succession Certificate, Probate & Letter of Administration',
            descriptionHindi: 'मृतक के बैंक खातों, शेयर्स व चल संपत्तियों के उत्तराधिकार हेतु न्यायालयीन प्रमाण पत्र प्राप्त करना।',
            keyActsOrProvisions: 'Indian Succession Act, 1925'
          },
          {
            id: 'plaint_written_statement',
            titleHindi: 'वाद पत्र (Plaint) व लिखित कथन (Written Statement)',
            titleEnglish: 'Plaint Drafting (Order 7) & Written Statement (Order 8)',
            descriptionHindi: 'कोर्ट केस का प्राथमिक दावा (वाद पत्र) तथा विपक्षी के दावे का तथ्यात्मक व कानूनी जवाब (लिखित कथन)।',
            keyActsOrProvisions: 'Order 7 & Order 8 Code of Civil Procedure (CPC)'
          }
        ]
      }
    ]
  },
  {
    id: 'criminal',
    categoryNumber: 2,
    titleHindi: '2. क्रिमिनल मामले (आपराधिक)',
    titleEnglish: 'Criminal Law & Defense Matters',
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
            titleEnglish: 'FIR Registration & Zero FIR Jurisdiction Transfer',
            descriptionHindi: 'संज्ञेय अपराधों में थाने पर प्रथम सूचना रिपोर्ट (FIR) दर्ज कराना व किसी भी थाने में तुरंत Zero FIR प्रक्रिया।',
            keyActsOrProvisions: 'Section 154 CrPC / BNSS Provisions'
          },
          {
            id: 'magistrate_156_3',
            titleHindi: 'मजिस्ट्रेट के समक्ष धारा 156(3) आवेदन',
            titleEnglish: 'Application Before Judicial Magistrate u/s 156(3) CrPC',
            descriptionHindi: 'पुलिस द्वारा एफआईआर न लिखने पर सक्षम न्यायालय में जांच व एफआईआर दर्ज कराने का न्यायिक आदेश प्राप्त करना।',
            keyActsOrProvisions: 'Section 156(3) Code of Criminal Procedure (CrPC)'
          }
        ]
      },
      {
        id: 'bail_matters',
        category: 'criminal',
        titleHindi: 'जमानत के मामले',
        titleEnglish: 'Bail Matters & Personal Liberty',
        iconName: 'Unlock',
        badge: 'जमानत व राहत',
        descriptionHindi: 'गिरफ्तारी से पूर्व अग्रिम जमानत (Anticipatory Bail) तथा हिरासत के बाद नियमित एवं अंतरिम जमानत।',
        items: [
          {
            id: 'anticipatory_bail',
            titleHindi: 'अग्रिम जमानत (Anticipatory Bail)',
            titleEnglish: 'Anticipatory Bail (Pre-Arrest Bail) - Sec 438',
            descriptionHindi: 'झूठे मामले या गिरफ्तारी की आशंका पर सत्र न्यायालय (Sessions Court) अथवा हाई कोर्ट से अग्रिम राहत।',
            keyActsOrProvisions: 'Section 438 CrPC / Section 482 BNSS'
          },
          {
            id: 'regular_bail',
            titleHindi: 'नियमित जमानत (Regular Bail)',
            titleEnglish: 'Regular Bail & Interim Bail - Sec 437 / 439',
            descriptionHindi: 'पुलिस या न्यायिक अभिरक्षा से रिहाई हेतु सक्षम मजिस्ट्रेट, सत्र न्यायालय एवं उच्च न्यायालय में जमानत याचिका।',
            keyActsOrProvisions: 'Section 437 & 439 CrPC / BNSS'
          }
        ]
      },
      {
        id: 'trial_relief',
        category: 'criminal',
        titleHindi: 'ट्रायल और राहत',
        titleEnglish: 'Trial & Criminal Defense Relief',
        iconName: 'Scale',
        badge: 'ट्रायल व जिरह',
        descriptionHindi: 'झूठी एफआईआर को हाई कोर्ट से रद्द कराना (Quashing), आरोप मुक्त (Discharge) याचिका एवं गवाहों की सशक्त जिरह।',
        items: [
          {
            id: 'quashing_sec_482',
            titleHindi: 'झूठी एफआईआर रद्द कराना (Quashing - Sec 482)',
            titleEnglish: 'Quashing of False FIR / Chargesheet under Section 482 CrPC',
            descriptionHindi: 'दुर्भावनापूर्ण या निराधार आपराधिक मुकदमों और चार्जशीट को हाई कोर्ट के अंतर्निहित अधिकारों से रद्द कराना।',
            keyActsOrProvisions: 'Section 482 Code of Criminal Procedure (CrPC)'
          },
          {
            id: 'discharge_and_cross_exam',
            titleHindi: 'डिस्चार्ज एप्लीकेशन (बचने के लिए) और गवाहों की जिरह',
            titleEnglish: 'Discharge Application (Sec 227/239) & Witness Cross-Examination',
            descriptionHindi: 'ट्रायल शुरू होने से पहले आरोप मुक्त (Discharge) की बहस तथा न्यायालय में अभियोजन के गवाहों की सटीक जिरह।',
            keyActsOrProvisions: 'Section 227/239 CrPC & Indian Evidence Act'
          }
        ]
      },
      {
        id: 'appeals_and_sentencing',
        category: 'criminal',
        titleHindi: 'अपील और सजा',
        titleEnglish: 'Appeals & Criminal Revisions',
        iconName: 'Gavel',
        badge: 'अपील व रिवीजन',
        descriptionHindi: 'निचली अदालतों (Trial Courts) के दोषसिद्धि व दंडादेश के विरुद्ध उच्च न्यायालय (High Court) में आपराधिक अपील व रिवीजन।',
        items: [
          {
            id: 'high_court_appeal',
            titleHindi: 'निचली अदालत के फैसले के खिलाफ हाई कोर्ट में अपील',
            titleEnglish: 'Criminal Appeal & Revision in High Court against Conviction Orders',
            descriptionHindi: 'सत्र न्यायालय द्वारा दी गई सजा, अर्थदंड अथवा आदेश के खिलाफ उच्च न्यायालय में स्थगन (Stay) व अपील।',
            keyActsOrProvisions: 'Section 374 & Section 397/401 CrPC'
          }
        ]
      }
    ]
  }
];

// Flat services for backward compatibility and quick dropdown selections
export const ALL_FLAT_SERVICES: Service[] = [
  { id: 's_prop_part', name: 'पैतृक संपत्ति बंटवारा और कब्जा', category: 'civil', fee: 0, icon: 'Home', hindiTitle: 'पैतृक संपत्ति बंटवारा और कब्जा', subItems: ['पुश्तैनी भूमि विभाजन', 'वास्तविक कब्जा दिलाना'] },
  { id: 's_prop_stay', name: 'स्टे ऑर्डर (Injunction) व टाइटल सूट', category: 'civil', fee: 0, icon: 'Home', hindiTitle: 'स्टे ऑर्डर व टाइटल सूट', subItems: ['Order 39 स्टे आर्डर', 'टाइटल डिक्लेरेशन'] },
  { id: 's_fam_div', name: 'तलाक (Divorce) व भरण-पोषण (Alimony)', category: 'civil', fee: 0, icon: 'Users', hindiTitle: 'तलाक व भरण-पोषण', subItems: ['आपसी सहमति तलाक', 'Sec 125 गुजारा भत्ता'] },
  { id: 's_fam_cust', name: 'बच्चों की कस्टडी (Child Custody)', category: 'civil', fee: 0, icon: 'Users', hindiTitle: 'बच्चों की कस्टडी', subItems: ['गार्जियनशिप अधिकार', 'विजिटेशन राइट्स'] },
  { id: 's_comm_rec', name: 'धन वसूली (Recovery Suits) व हर्जाना', category: 'civil', fee: 0, icon: 'FileText', hindiTitle: 'धन वसूली व हर्जाना', subItems: ['Order 37 समरी सूट', 'चेक बाउंस व क्षतिपूर्ति'] },
  { id: 's_comm_agr', name: 'एग्रीमेंट व पार्टनरशिप विवाद', category: 'civil', fee: 0, icon: 'FileText', hindiTitle: 'एग्रीमेंट व पार्टनरशिप विवाद', subItems: ['पार्टनरशिप डीड विवाद', 'मध्यस्थता आर्बिट्रेशन'] },
  { id: 's_will_succ', name: 'उत्तराधिकार प्रमाण पत्र (Succession Certificate)', category: 'civil', fee: 0, icon: 'FileText', hindiTitle: 'उत्तराधिकार प्रमाण पत्र', subItems: ['सक्सेशन सर्टिफिकेट', 'प्रोबेट व वसीयत'] },
  { id: 's_will_plaint', name: 'वाद पत्र (Plaint) व लिखित कथन (Written Statement)', category: 'civil', fee: 0, icon: 'FileText', hindiTitle: 'वाद पत्र व लिखित कथन ड्राफ्टिंग', subItems: ['Order 7 वाद पत्र ड्राफ्ट', 'Order 8 कानूनी जवाब'] },
  
  { id: 's_crim_fir', name: 'एफआईआर दर्ज कराना / जीरो एफआईआर', category: 'criminal', fee: 0, icon: 'ShieldAlert', hindiTitle: 'एफआईआर व जीरो एफआईआर', subItems: ['थाना FIR पंजीकरण', 'Zero FIR अंतरण'] },
  { id: 's_crim_156', name: 'मजिस्ट्रेट के समक्ष धारा 156(3) आवेदन', category: 'criminal', fee: 0, icon: 'Gavel', hindiTitle: 'धारा 156(3) CrPC आवेदन', subItems: ['कोर्ट से FIR आदेश', 'न्यायिक मजिस्ट्रेट आवेदन'] },
  { id: 's_crim_abail', name: 'अग्रिम जमानत (Anticipatory Bail)', category: 'criminal', fee: 0, icon: 'Unlock', hindiTitle: 'अग्रिम जमानत (धारा 438)', subItems: ['सत्र न्यायालय अग्रिम जमानत', 'हाई कोर्ट अग्रिम जमानत'] },
  { id: 's_crim_rbail', name: 'नियमित जमानत (Regular Bail)', category: 'criminal', fee: 0, icon: 'Unlock', hindiTitle: 'नियमित जमानत (धारा 437/439)', subItems: ['जमानत याचिका बहस', 'अंतरिम जमानत'] },
  { id: 's_crim_482', name: 'झूठी एफआईआर रद्द कराना (Quashing - Sec 482)', category: 'criminal', fee: 0, icon: 'Scale', hindiTitle: 'धारा 482 Quashing हाई कोर्ट', subItems: ['झूठी FIR रद्द कराना', 'चार्जशीट क्वैशिंग'] },
  { id: 's_crim_disch', name: 'डिस्चार्ज एप्लीकेशन व गवाहों की जिरह', category: 'criminal', fee: 0, icon: 'Gavel', hindiTitle: 'डिस्चार्ज एप्लीकेशन व जिरह', subItems: ['ट्रायल डिस्चार्ज (Sec 227/239)', 'गवाहों की क्रॉस-एग्जामिनेशन'] },
  { id: 's_crim_appeal', name: 'निचली अदालत के फैसले के खिलाफ हाई कोर्ट में अपील', category: 'criminal', fee: 0, icon: 'Gavel', hindiTitle: 'हाई कोर्ट आपराधिक अपील', subItems: ['सजा के विरुद्ध अपील', 'सजा पर रोक (Stay)'] },
];

