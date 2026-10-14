import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning up database reports and establishing exactly 10 clean administrative reports...');

  // 1. Delete dependent audit logs, workflow events, verifications, follow-ups
  await prisma.systemAuditLog.deleteMany({});
  await prisma.escalationRecord.deleteMany({});
  await prisma.followUpAction.deleteMany({});
  await prisma.workflowEvent.deleteMany({});
  await prisma.verificationRecord.deleteMany({});
  await prisma.livelihoodReport.deleteMany({});

  // 2. Remove test citizen user accounts (keep official staff / officers)
  await prisma.user.deleteMany({
    where: {
      role: 'CITIZEN',
    },
  });

  console.log('Cleared existing reports and temporary citizen test users.');

  // Fetch or ensure officer users exist
  const volunteer = await prisma.user.findFirst({ where: { role: 'VOLUNTEER' } });
  const bdo = await prisma.user.findFirst({ where: { role: 'BDO' } });

  // 3. Insert exactly 10 high-quality, realistic flood livelihood recovery reports across Bihar
  // Note: citizenEmail is explicitly NULL so they NEVER accidentally attach to any logged-in citizen
  const clean10Reports = [
    // 1. Supaul - Crop & Cattle (Verified)
    {
      reportNumber: 'JS-2027-SUP-8411',
      citizenName: 'भोला यादव (Bhola Yadav)',
      citizenPhone: '9876543210',
      citizenEmail: null,
      preferredLanguage: 'hi',
      isVoiceReport: true,
      rawTranscript: 'कोसी नदी के पानी से हमारे 2 बीघा धान के फसल पूरा पानी में डूब गइल बा और दू गो दुधारू गाय के चारा ना मिल रहल बा',
      confirmedTranscript: 'कोसी नदी के पानी से हमारा 2 बीघा धान का खेत पूर्णतः डूब गया है। साथ ही दो दुधारू गायों के लिए सूखा चारा बिल्कुल नहीं बचा है और मवेशी बीमार हो रहे हैं।',
      district: 'Supaul',
      block: 'Nirmali',
      panchayat: 'Mahuwa',
      village: 'महुवा दक्षिण टोला (Mahuwa)',
      wardNumber: '4',
      livelihoodCategories: JSON.stringify(['CROP', 'LIVESTOCK']),
      lossDescription: '2 बीघा धान जलमग्न, 2 गायों के लिए चारा संकट एवं रोग की संभावना।',
      estimatedLossAmount: 48000,
      disruptionDurationDays: 6,
      householdSize: 6,
      vulnerabilityFlags: JSON.stringify(['MARGINAL_FARMER']),
      priorityScore: 78,
      priorityLevel: 'URGENT',
      priorityRationale: 'पशुधन संकट (+20) • फसल जलमग्नता (+15) • सीमांत कृषक (+5) • बड़ा परिवार (+5) • आधारभूत (+20)',
      status: 'VERIFIED',
      assignedUserId: volunteer?.id,
      assignedRole: 'VOLUNTEER',
      submittedAt: new Date(Date.now() - 36 * 3600 * 1000),
      verifiedAt: new Date(Date.now() - 6 * 3600 * 1000),
      verification: {
        outcome: 'VERIFIED',
        fieldNotes: 'मौके पर पहुंचकर देखा गया कि खेत में 4 फीट पानी भरा है और धान की फसल सड़ चुकी है। दोनों गायें सुरक्षित ऊंचे स्थान पर हैं लेकिन चारे की भारी कमी है।',
        reasonForDecision: 'स्थल निरीक्षण और स्थानीय मुखिया से पुष्टि के उपरांत दावा पूर्णतः सत्य पाया गया।',
        verifiedCropLossBigha: 2.0,
        verifiedCattleLost: 0,
        recommendedAction: 'पशुपालन शिविर से तत्काल 2 बोरी भूसा/दाना एवं कृषि विभाग से आकस्मिक बीज मिनीकिट अनुशंसित।',
      },
    },
    // 2. Supaul - Kirana Shop Inventory (Referred for Recovery)
    {
      reportNumber: 'JS-2027-SUP-8412',
      citizenName: 'सुनीता देवी (Sunita Devi)',
      citizenPhone: '9876543211',
      citizenEmail: null,
      preferredLanguage: 'bho',
      isVoiceReport: true,
      rawTranscript: 'हमार किराना के गुमटी में पानी घुस गइल, आटा दाल सब बोरी भीग के बर्बाद हो गइल, हम विधवा बानी बाल-बच्चा के खियाईब कईसे',
      confirmedTranscript: 'सड़क किनारे हमारी छोटी किराना दुकान में बाढ़ का पानी 3 फीट तक भर गया। आटा, चावल, तेल और चीनी की बोरियां भीगकर पूरी तरह नष्ट हो गईं। मैं एकल महिला हूं और यही जीविका का एकमात्र सहारा था।',
      district: 'Supaul',
      block: 'Nirmali',
      panchayat: 'Mahuwa',
      village: 'दिघिया बाजार टोला (Dighia)',
      wardNumber: '2',
      livelihoodCategories: JSON.stringify(['SHOP_BUSINESS', 'INVENTORY']),
      lossDescription: 'किराना दुकान में पानी भरने से संपूर्ण स्टॉक नष्ट, दैनिक आय पूर्णतः ठप।',
      estimatedLossAmount: 32000,
      disruptionDurationDays: 8,
      householdSize: 4,
      vulnerabilityFlags: JSON.stringify(['WOMEN_HEADED', 'LANDLESS_LABOR']),
      priorityScore: 82,
      priorityLevel: 'URGENT',
      priorityRationale: 'महिला प्रधान परिवार (+10) • भूमिहीन (+10) • दुकान/स्टॉक क्षति (+10) • दीर्घकालिक अवरोध (+10) • आधारभूत (+20)',
      status: 'REFERRED_FOR_RECOVERY',
      assignedUserId: bdo?.id,
      assignedRole: 'BDO',
      submittedAt: new Date(Date.now() - 48 * 3600 * 1000),
      verifiedAt: new Date(Date.now() - 20 * 3600 * 1000),
      followUp: {
        programmeType: 'JEEViKA_SHG',
        assignedDepartment: 'ग्रामीण विकास विभाग / जीविका (JEEViKA)',
        actionDetails: 'महिला विकास स्वयं सहायता समूह के माध्यम से ₹20,000 का आपातकालीन कम ब्याज आजीविका संकुल ऋण स्वीकृत करने की अनुशंसा।',
      },
    },
    // 3. Supaul - Wage Labor (Assigned for Verification)
    {
      reportNumber: 'JS-2027-SUP-8413',
      citizenName: 'मुन्ना पासवान (Munna Paswan)',
      citizenPhone: '9876543212',
      citizenEmail: null,
      preferredLanguage: 'hi',
      isVoiceReport: false,
      confirmedTranscript: 'हम दैनिक मजदूरी करते हैं। पिछले 10 दिनों से बांध टूटने के कारण खेतों और निर्माण स्थलों पर काम बंद है। घर में कोई राशन नहीं बचा है।',
      district: 'Supaul',
      block: 'Pipra',
      panchayat: 'Rampur',
      village: 'रामपुर मुसहरी टोला (Rampur)',
      wardNumber: '7',
      livelihoodCategories: JSON.stringify(['WAGE_LABOR']),
      lossDescription: 'दैनिक मजदूरी 10 दिनों से ठप, कोई बचत या वैकल्पिक साधन नहीं।',
      estimatedLossAmount: 6000,
      disruptionDurationDays: 10,
      householdSize: 5,
      vulnerabilityFlags: JSON.stringify(['LANDLESS_LABOR']),
      priorityScore: 68,
      priorityLevel: 'HIGH',
      priorityRationale: 'दैनिक मजदूरी ठप (+15) • भूमिहीन मजदूर (+10) • दीर्घकालिक अवरोध (+10) • आधारभूत (+20)',
      status: 'ASSIGNED_FOR_VERIFICATION',
      assignedUserId: volunteer?.id,
      assignedRole: 'VOLUNTEER',
      submittedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    // 4. Supaul - Dairy Cattle Fodder Crisis (Submitted)
    {
      reportNumber: 'JS-2027-SUP-8414',
      citizenName: 'हरेराम सिंह (Hareram Singh)',
      citizenPhone: '9876543213',
      citizenEmail: null,
      preferredLanguage: 'hi',
      isVoiceReport: true,
      rawTranscript: 'तटबंध पर 5 भैंस लेकर शरण लिए हुए हैं, पीने का पानी और हरा चारा नहीं मिल रहा',
      confirmedTranscript: 'निर्मली रिंग बांध पर 5 दुधारू भैंस लेकर 3 दिनों से शरण लिए हुए हैं। मवेशियों हेतु चारा व स्वच्छ जल समाप्त हो चुका है। तत्काल पशु चारा पैकेट चाहिए।',
      district: 'Supaul',
      block: 'Nirmali',
      panchayat: 'Harpur',
      village: 'हरपुर बांध टोला',
      wardNumber: '3',
      livelihoodCategories: JSON.stringify(['LIVESTOCK']),
      lossDescription: '5 भैंसों हेतु चारा संकट व जलजनित संक्रामक बीमारी का जोखिम।',
      estimatedLossAmount: 35000,
      disruptionDurationDays: 3,
      householdSize: 6,
      vulnerabilityFlags: JSON.stringify(['MARGINAL_FARMER']),
      priorityScore: 76,
      priorityLevel: 'URGENT',
      priorityRationale: 'पशुधन संकट (+20) • विस्थापन जोखिम (+15) • आधारभूत (+20)',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 10 * 3600 * 1000),
    },
    // 5. Darbhanga - Maize & Vegetable Crop (Awaiting Review)
    {
      reportNumber: 'JS-2027-DAR-7101',
      citizenName: 'मो. शमशाद आलम (Md. Shamshad Alam)',
      citizenPhone: '9876543214',
      citizenEmail: null,
      preferredLanguage: 'hi',
      isVoiceReport: true,
      rawTranscript: 'कमला बलान नदी का तटबंध टूटने से हमारे 3 बीघे का मक्का और सब्जी बह गई',
      confirmedTranscript: 'कमला बलान के पानी से 3 बीघा मक्का और परवल-भिंडी की नकदी फसल पूर्णतः नष्ट हो गई। खेत में 3 फीट बालू व सिल्ट जम गया है।',
      district: 'Darbhanga',
      block: 'Kusheshwar Asthan',
      panchayat: 'Satiyara',
      village: 'सतियारा उत्तर (Satiyara)',
      wardNumber: '3',
      livelihoodCategories: JSON.stringify(['CROP']),
      lossDescription: '3 बीघा नकदी फसल एवं सब्जी जलमग्न, बालू निक्षेपण।',
      estimatedLossAmount: 65000,
      disruptionDurationDays: 5,
      householdSize: 7,
      vulnerabilityFlags: JSON.stringify(['MARGINAL_FARMER']),
      priorityScore: 65,
      priorityLevel: 'HIGH',
      priorityRationale: 'फसल क्षति (+15) • बड़ा परिवार (+5) • सीमांत कृषक (+5) • आधारभूत (+20)',
      status: 'AWAITING_REVIEW',
      submittedAt: new Date(Date.now() - 18 * 3600 * 1000),
    },
    // 6. Darbhanga - Fisheries & Boat Damage (Action Recorded)
    {
      reportNumber: 'JS-2027-DAR-7102',
      citizenName: 'विद्यापति सहनी (Vidyapati Sahani)',
      citizenPhone: '9876543215',
      citizenEmail: null,
      preferredLanguage: 'bho',
      isVoiceReport: true,
      rawTranscript: 'पोखरा के बांध टूट गइल सब मछली बह गइल और नाव भी टूट गइल',
      confirmedTranscript: 'मत्स्य पालन का 1 एकड़ पोखरा का बांध टूट गया, करीब 10 क्विंटल तैयार मछली बह गई और मछली पकड़ने वाली एक छोटी डोंगी नाव टूट गई।',
      district: 'Darbhanga',
      block: 'Kusheshwar Asthan',
      panchayat: 'Jhakhra',
      village: 'झाखरा मल्लाह टोली (Jhakhra)',
      wardNumber: '6',
      livelihoodCategories: JSON.stringify(['FISHERIES', 'EQUIPMENT']),
      lossDescription: 'मत्स्य पोखरा बांध ध्वस्त, मछली स्टॉक एवं नाव की क्षति।',
      estimatedLossAmount: 95000,
      disruptionDurationDays: 14,
      householdSize: 6,
      vulnerabilityFlags: JSON.stringify(['LANDLESS_LABOR']),
      priorityScore: 75,
      priorityLevel: 'URGENT',
      priorityRationale: 'मत्स्य आजीविका (+10) • उपकरण (+10) • दीर्घकालिक अवरोध (+10) • भूमिहीन (+10) • आधारभूत (+20)',
      status: 'ACTION_RECORDED',
      submittedAt: new Date(Date.now() - 72 * 3600 * 1000),
      verifiedAt: new Date(Date.now() - 40 * 3600 * 1000),
      followUp: {
        programmeType: 'MICRO_CREDIT_RECOVERY',
        assignedDepartment: 'मत्स्य पालन निदेशालय (Fisheries Department, Darbhanga)',
        actionDetails: 'मत्स्य पालक योजनान्तर्गत जीरा (फिंगरलिंग) पुनः संचयन हेतु तकनीकी परामर्श एवं रियायती सहायता पंजीबद्ध।',
      },
    },
    // 7. Madhubani - Makhana & Paddy Loss (Submitted)
    {
      reportNumber: 'JS-2027-MAD-5201',
      citizenName: 'रामानंद कामत (Ramanand Kamat)',
      citizenPhone: '9876543216',
      citizenEmail: null,
      preferredLanguage: 'hi',
      isVoiceReport: true,
      rawTranscript: 'कमला बलान के पानी से हमर मखाना के खेत और पोखरा डूब गेल',
      confirmedTranscript: 'कमला बलान नदी में जलस्तर अचानक बढ़ने से 1.5 एकड़ का मखाना उत्पादन पोखरा और 1 बीघा धान की फसल जलमग्न हो गई है। तैयार मखाना बह गया।',
      district: 'Madhubani',
      block: 'Jhanjharpur',
      panchayat: 'Kothia',
      village: 'कोठिया पूर्व टोला (Kothia)',
      wardNumber: '5',
      livelihoodCategories: JSON.stringify(['CROP', 'FISHERIES']),
      lossDescription: 'मखाना पोखरा एवं धान की फसल जलमग्न।',
      estimatedLossAmount: 72000,
      disruptionDurationDays: 7,
      householdSize: 5,
      vulnerabilityFlags: JSON.stringify(['MARGINAL_FARMER']),
      priorityScore: 71,
      priorityLevel: 'HIGH',
      priorityRationale: 'मखाना नकदी फसल क्षति (+15) • सीमांत कृषक (+5) • मध्यम अवरोध (+5) • आधारभूत (+20)',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 14 * 3600 * 1000),
    },
    // 8. Madhubani - Mithila Painting & Bamboo Artisan (Follow-up In Progress)
    {
      reportNumber: 'JS-2027-MAD-5202',
      citizenName: 'मंजू देवी (Manju Devi - जीविका दीदी)',
      citizenPhone: '9876543219',
      citizenEmail: null,
      preferredLanguage: 'hi',
      isVoiceReport: true,
      rawTranscript: 'बाढ़ में हमारे हस्तशिल्प और मिथिला पेंटिंग के कच्चा माल सब भीग के बेकार हो गया',
      confirmedTranscript: 'बाढ़ का पानी घर में घुसने से स्वयं सहायता समूह की महिलाओं द्वारा तैयार हस्तनिर्मित कपड़े, प्राकृतिक रंग और मिथिला पेंटिंग उत्पाद नष्ट हो गए।',
      district: 'Madhubani',
      block: 'Jhanjharpur',
      panchayat: 'Kothia',
      village: 'कोठिया जीविका टोला',
      wardNumber: '2',
      livelihoodCategories: JSON.stringify(['SHOP_BUSINESS', 'INVENTORY']),
      lossDescription: 'हस्तशिल्प उत्पाद एवं पेंटिंग सामग्री पूर्णतः जलमग्न।',
      estimatedLossAmount: 40000,
      disruptionDurationDays: 9,
      householdSize: 4,
      vulnerabilityFlags: JSON.stringify(['WOMEN_HEADED']),
      priorityScore: 79,
      priorityLevel: 'URGENT',
      priorityRationale: 'महिला समूह आजीविका (+15) • इन्वेंटरी क्षति (+15) • आधारभूत (+20)',
      status: 'FOLLOWUP_IN_PROGRESS',
      submittedAt: new Date(Date.now() - 40 * 3600 * 1000),
      verifiedAt: new Date(Date.now() - 18 * 3600 * 1000),
      followUp: {
        programmeType: 'JEEViKA_SHG',
        assignedDepartment: 'ग्रामीण विकास विभाग / जीविका (JEEViKA)',
        actionDetails: 'सतत जीविकोपार्जन योजना (SJY) के अंतर्गत विशेष आजीविका पुनरुद्धार अनुदान हेतु पत्राचार अग्रसारित।',
      },
    },
    // 9. Saharsa - Cattle Shed & Fodder Erosion (Awaiting Review)
    {
      reportNumber: 'JS-2027-SAH-3301',
      citizenName: 'दिलीप यादव (Dilip Yadav)',
      citizenPhone: '9876543217',
      citizenEmail: null,
      preferredLanguage: 'hi',
      isVoiceReport: true,
      rawTranscript: 'कोसी के कटाव से हमारा बथान और मवेशी का चारा बह गया',
      confirmedTranscript: 'कोसी नदी के पश्चिमी तटबंध के भीतर अचानक कटाव होने से मवेशी बथान ढह गया और 4 गायों के लिए रखा 50 क्विंटल सूखा चारा पानी में बह गया।',
      district: 'Saharsa',
      block: 'Simri Bakhtiarpur',
      panchayat: 'Khamhaunti',
      village: 'खमहोती दियारा (Khamhaunti)',
      wardNumber: '8',
      livelihoodCategories: JSON.stringify(['LIVESTOCK']),
      lossDescription: 'मवेशी शेड ध्वस्त एवं 50 क्विंटल चारा का नुकसान।',
      estimatedLossAmount: 42000,
      disruptionDurationDays: 6,
      householdSize: 6,
      vulnerabilityFlags: JSON.stringify(['MARGINAL_FARMER']),
      priorityScore: 74,
      priorityLevel: 'URGENT',
      priorityRationale: 'पशुधन चारा संकट (+20) • कटाव जोखिम (+10) • सीमांत कृषक (+5) • आधारभूत (+20)',
      status: 'AWAITING_REVIEW',
      submittedAt: new Date(Date.now() - 20 * 3600 * 1000),
    },
    // 10. Muzaffarpur - Handloom Weaving Unit (Submitted)
    {
      reportNumber: 'JS-2027-MUZ-4101',
      citizenName: 'मो. अख्तर अंसारी (Md. Akhtar Ansari)',
      citizenPhone: '9876543218',
      citizenEmail: null,
      preferredLanguage: 'hi',
      isVoiceReport: false,
      confirmedTranscript: 'बूढ़ी गंडक नदी का पानी औराई प्रखंड के निचले इलाके में घुसने से हमारी हथकरघा बुनाई इकाई में रखा सूत, तैयार चादरें और लूम मशीन में जंग लग गया है।',
      district: 'Muzaffarpur',
      block: 'Aurai',
      panchayat: 'Bhadurpur',
      village: 'बहादुरपुर बुनकर टोला (Bhadurpur)',
      wardNumber: '3',
      livelihoodCategories: JSON.stringify(['SHOP_BUSINESS', 'EQUIPMENT']),
      lossDescription: 'हथकरघा बुनाई इकाई जलमग्न, कच्चा माल व मशीनरी क्षतिग्रस्त।',
      estimatedLossAmount: 58000,
      disruptionDurationDays: 12,
      householdSize: 6,
      vulnerabilityFlags: JSON.stringify(['LANDLESS_LABOR']),
      priorityScore: 76,
      priorityLevel: 'URGENT',
      priorityRationale: 'हस्तशिल्प/लघु व्यवसाय (+15) • उपकरण क्षति (+10) • दीर्घकालिक अवरोध (+10) • आधारभूत (+20)',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 8 * 3600 * 1000),
    },
  ];

  for (const item of clean10Reports) {
    const { verification, followUp, ...data } = item;
    const report = await prisma.livelihoodReport.create({
      data,
    });

    if (verification) {
      await prisma.verificationRecord.create({
        data: {
          reportId: report.id,
          verifiedByUserId: volunteer?.id || '',
          verifiedRole: 'VOLUNTEER',
          outcome: verification.outcome as any,
          fieldObservations: verification.fieldNotes,
          reasonForDecision: verification.reasonForDecision,
          recommendedAction: verification.recommendedAction,
          verifiedCropLossBigha: verification.verifiedCropLossBigha,
          verifiedCattleLost: verification.verifiedCattleLost,
        },
      });
    }

    if (followUp) {
      await prisma.followUpAction.create({
        data: {
          reportId: report.id,
          programmeType: followUp.programmeType as any,
          assignedDepartment: followUp.assignedDepartment,
          actionDetails: followUp.actionDetails,
          recordedByUserId: bdo?.id || volunteer?.id || '',
          status: 'IN_PROGRESS',
        },
      });
    }

    // Workflow audit log
    await prisma.workflowEvent.create({
      data: {
        reportId: report.id,
        actorName: report.citizenName,
        actorRole: 'CITIZEN',
        action: 'SUBMIT',
        toStatus: report.status,
        remarks: 'सार्वजनिक प्रशासनिक रिपोर्ट रिकॉर्ड (10 प्रामाणिक बिहार बाढ़ मामले)',
      },
    });
  }

  const finalCount = await prisma.livelihoodReport.count();
  console.log(`✅ Success! Database now contains exactly ${finalCount} clean representative reports across Bihar.`);
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
