// Synthetic Seed Data for JeevikaSetu Demonstration
// Clearly labelled synthetic data for Hack for Social Cause 2027

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting JeevikaSetu seed...');

  // Clear existing demonstration data
  await prisma.systemAuditLog.deleteMany({});
  await prisma.escalationRecord.deleteMany({});
  await prisma.followUpAction.deleteMany({});
  await prisma.workflowEvent.deleteMany({});
  await prisma.verificationRecord.deleteMany({});
  await prisma.livelihoodReport.deleteMany({});
  await prisma.serviceDirectoryEntry.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing records.');

  // Common password for demo accounts
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create 8 Official Administrative Role Users
  const users = [
    {
      email: 'volunteer@jeevikasetu.gov.in',
      fullName: 'Ramesh Mandal (रमेश मंडल)',
      role: 'VOLUNTEER',
      department: 'Rural Youth Volunteer',
      jurisdictionType: 'PANCHAYAT',
      jurisdictionName: 'Mahuwa',
      phone: '9801234501',
    },
    {
      email: 'bdo.nirmali@jeevikasetu.gov.in',
      fullName: 'Anjali Kumari, BAS (अंजलि कुमारी)',
      role: 'BDO',
      department: 'Rural Development',
      jurisdictionType: 'BLOCK',
      jurisdictionName: 'Nirmali',
      phone: '9801234502',
    },
    {
      email: 'ddc.supaul@jeevikasetu.gov.in',
      fullName: 'Rajeshwar Prasad, IAS (राजेश्वर प्रसाद)',
      role: 'DDC',
      department: 'District Rural Development Agency',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Supaul',
      phone: '9801234503',
    },
    {
      email: 'dpo.jeevika@jeevikasetu.gov.in',
      fullName: 'Dr. Sunita Verma (डॉ. सुनीता वर्मा)',
      role: 'DPO',
      department: 'JEEViKA - Bihar SRLM',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Supaul',
      phone: '9801234504',
    },
    {
      email: 'sdm.nirmali@jeevikasetu.gov.in',
      fullName: 'Amit Kumar Roy, BAS (अमित कुमार राय)',
      role: 'SDM',
      department: 'Subdivisional Administration',
      jurisdictionType: 'SUBDIVISION',
      jurisdictionName: 'Nirmali',
      phone: '9801234505',
    },
    {
      email: 'adm.relief@jeevikasetu.gov.in',
      fullName: 'Sanjay Kumar Singh, BAS (संजय कुमार सिंह)',
      role: 'ADM',
      department: 'Disaster Management & Revenue',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Supaul',
      phone: '9801234506',
    },
    {
      email: 'dm.supaul@jeevikasetu.gov.in',
      fullName: 'Kaushal Kishore, IAS (कौशल किशोर)',
      role: 'DM',
      department: 'District Magistrate & Collector',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Supaul',
      phone: '9801234507',
    },
    {
      email: 'admin@jeevikasetu.gov.in',
      fullName: 'Priya Sharma (प्रिया शर्मा)',
      role: 'SYSTEM_ADMIN',
      department: 'IT & e-Governance Cell',
      jurisdictionType: 'STATE',
      jurisdictionName: 'Bihar',
      phone: '9801234508',
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of users) {
    const created = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        fullName: u.fullName,
        role: u.role,
        department: u.department,
        jurisdictionType: u.jurisdictionType,
        jurisdictionName: u.jurisdictionName,
        phone: u.phone,
      },
    });
    createdUsers[u.role] = created;
  }
  console.log(`Created ${users.length} administrative demo accounts.`);

  // 2. Create Service Directory Entries
  const services = [
    {
      district: 'Supaul',
      block: 'Nirmali',
      department: 'Disaster Management',
      schemeName: 'आपातकालीन राहत एवं आश्रय केंद्र (Emergency Relief Cell)',
      description: 'बाढ़ विस्थापित परिवारों हेतु सूखा राशन, पॉलीथिन शीट्स एवं शुद्ध पेयजल आपूर्ति।',
      contactPerson: 'श्री वीरेंद्र यादव (सर्किल इंस्पेक्टर)',
      contactPhone: '06473-224110',
      officeAddress: 'प्रखंड सह अंचल कार्यालय, निर्मली, सुपौल',
    },
    {
      district: 'Supaul',
      block: 'Nirmali',
      department: 'Animal Husbandry',
      schemeName: 'पशु चारा एवं सचल पशु चिकित्सा शिविर (Mobile Vet & Fodder Camp)',
      description: 'बाढ़ में मवेशियों हेतु चारा पैकेट, संक्रामक रोग टीका एवं दवाइयों का निःशुल्क वितरण।',
      contactPerson: 'डॉ. मनीष कुमार (भ्रमणशील पशु चिकित्सा पदाधिकारी)',
      contactPhone: '9431823901',
      officeAddress: 'पशु औषधालय, निर्मली बाजार',
    },
    {
      district: 'Supaul',
      block: 'Pipra',
      department: 'Agriculture Dept',
      schemeName: 'आकस्मिक फसल योजना एवं बीज अनुदान (Contingency Seed Distribution)',
      description: 'बाढ़ उपरांत वैकल्पिक रबी/तोरिया/मक्का के निःशुल्क मिनीकिट वितरण।',
      contactPerson: 'श्री रामानंद झा (प्रखंड कृषि पदाधिकारी)',
      contactPhone: '9473191024',
      officeAddress: 'ई-किसान भवन, पिपरा',
    },
    {
      district: 'Supaul',
      block: 'Kishanpur',
      department: 'JEEViKA',
      schemeName: 'जीविका आपातकालीन आजीविका संकुल ऋण (JEEViKA SHG Relief Loan)',
      description: 'महिला स्वयं सहायता समूह सदस्यों हेतु लघु व्यवसाय व आजीविका पुनर्स्थापना सहायता।',
      contactPerson: 'श्रीमती नीलम देवी (क्षेत्रीय समन्वयक)',
      contactPhone: '9934018274',
      officeAddress: 'प्रखंड परियोजना समन्वय इकाई (BPIU), किशनपुर',
    },
  ];

  for (const s of services) {
    await prisma.serviceDirectoryEntry.create({ data: s });
  }
  console.log(`Created ${services.length} relief service directory records.`);

  // 3. Create Seed Livelihood Damage Reports with realistic Bihar scenarios
  const seedReports = [
    {
      reportNumber: 'JS-2027-SUP-8411',
      citizenName: 'भोला यादव (Bhola Yadav)',
      citizenPhone: '9876543210',
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
      assignedUserId: createdUsers['VOLUNTEER'].id,
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
    {
      reportNumber: 'JS-2027-SUP-8412',
      citizenName: 'सुनीता देवी (Sunita Devi)',
      citizenPhone: '9876543211',
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
      assignedUserId: createdUsers['BDO'].id,
      assignedRole: 'BDO',
      submittedAt: new Date(Date.now() - 48 * 3600 * 1000),
      verifiedAt: new Date(Date.now() - 20 * 3600 * 1000),
      followUp: {
        programmeType: 'JEEViKA_SHG',
        assignedDepartment: 'JEEViKA - Bihar SRLM',
        actionDetails: 'महिला विकास स्वयं सहायता समूह के माध्यम से ₹20,000 का आपातकालीन कम ब्याज आजीविका संकुल ऋण स्वीकृत करने की अनुशंसा।',
      },
    },
    {
      reportNumber: 'JS-2027-SUP-8413',
      citizenName: 'मुन्ना पासवान (Munna Paswan)',
      citizenPhone: '9876543212',
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
      assignedUserId: createdUsers['VOLUNTEER'].id,
      assignedRole: 'VOLUNTEER',
      submittedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    {
      reportNumber: 'JS-2027-SUP-8414',
      citizenName: 'राजेंद्र महतो (Rajendra Mahto)',
      citizenPhone: '9876543213',
      preferredLanguage: 'hi',
      isVoiceReport: true,
      rawTranscript: 'खेत में लगा 5 एचपी का डीजल पंपसेट बाढ़ के तेज बहाव में गाद और बालू में धंस गया',
      confirmedTranscript: 'सिंचाई के लिए खेत में रखा 5 हॉर्सपावर का डीजल पंपसेट और पाइपलाइन बाढ़ के मलबे और गाद में दब गई है और मोटर खराब हो गया है।',
      district: 'Supaul',
      block: 'Kishanpur',
      panchayat: 'Bhairabpur',
      village: 'भैरवपुर (Bhairabpur)',
      wardNumber: '1',
      livelihoodCategories: JSON.stringify(['EQUIPMENT']),
      lossDescription: 'डीजल पम्पसेट सिल्ट में डूबने से क्षतिग्रस्त।',
      estimatedLossAmount: 28000,
      disruptionDurationDays: 4,
      householdSize: 5,
      vulnerabilityFlags: JSON.stringify(['MARGINAL_FARMER']),
      priorityScore: 52,
      priorityLevel: 'MEDIUM',
      priorityRationale: 'उपकरण क्षति (+10) • सीमांत कृषक (+5) • मध्यम अवरोध (+5) • आधारभूत (+20)',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 10 * 3600 * 1000),
    },
    {
      reportNumber: 'JS-2027-DAR-7101',
      citizenName: 'मो. शमशाद आलम (Md. Shamshad Alam)',
      citizenPhone: '9876543214',
      preferredLanguage: 'hi',
      isVoiceReport: true,
      rawTranscript: 'कमला बलान नदी का तटबंध टूटने से हमारे 3 बीघे का मक्का और सब्जी बह गई',
      confirmedTranscript: 'कमला बलान के पानी से 3 बीघा मक्का और परवल-भिंडी की फसल पूर्णतः नष्ट हो गई।',
      district: 'Darbhanga',
      block: 'Kusheshwar Asthan',
      panchayat: 'Satiyara',
      village: 'सतियारा उत्तर (Satiyara)',
      wardNumber: '3',
      livelihoodCategories: JSON.stringify(['CROP']),
      lossDescription: '3 बीघा नकदी फसल एवं सब्जी जलमग्न।',
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
    {
      reportNumber: 'JS-2027-DAR-7102',
      citizenName: 'विद्यापति सहनी (Vidyapati Sahani)',
      citizenPhone: '9876543215',
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
        assignedDepartment: 'Fisheries Department, Darbhanga',
        actionDetails: 'मत्स्य पालक योजनान्तर्गत जीरा (फिंगरलिंग) पुनः संचयन हेतु तकनीकी परामर्श एवं रियायती सहायता पंजीबद्ध।',
      },
    },
  ];

  for (const rep of seedReports) {
    const { verification, followUp, ...data } = rep;
    const createdReport = await prisma.livelihoodReport.create({
      data: {
        ...data,
      },
    });

    // Add initial submission workflow event
    await prisma.workflowEvent.create({
      data: {
        reportId: createdReport.id,
        actorName: createdReport.citizenName,
        actorRole: 'CITIZEN',
        action: 'SUBMIT',
        fromStatus: null,
        toStatus: 'SUBMITTED',
        remarks: createdReport.isVoiceReport
          ? 'नागरिक द्वारा मोबाइल से आवाज रिकॉर्ड कर दर्ज कराई गई रिपोर्ट।'
          : 'नागरिक द्वारा लिखित रूप में दर्ज रिपोर्ट।',
        createdAt: createdReport.submittedAt,
      },
    });

    // If verification exists
    if (verification) {
      await prisma.verificationRecord.create({
        data: {
          reportId: createdReport.id,
          verifiedByUserId: createdUsers['VOLUNTEER'].id,
          verifiedRole: 'VOLUNTEER',
          outcome: verification.outcome,
          fieldObservations: verification.fieldNotes,
          reasonForDecision: verification.reasonForDecision,
          recommendedAction: verification.recommendedAction,
          verifiedCropLossBigha: verification.verifiedCropLossBigha,
          verifiedCattleLost: verification.verifiedCattleLost,
          createdAt: createdReport.verifiedAt || new Date(),
        },
      });

      await prisma.workflowEvent.create({
        data: {
          reportId: createdReport.id,
          actorUserId: createdUsers['VOLUNTEER'].id,
          actorName: createdUsers['VOLUNTEER'].fullName,
          actorRole: 'VOLUNTEER',
          action: 'VERIFY',
          fromStatus: 'ASSIGNED_FOR_VERIFICATION',
          toStatus: verification.outcome,
          remarks: verification.fieldNotes,
          createdAt: createdReport.verifiedAt || new Date(),
        },
      });
    }

    // If followUp exists
    if (followUp) {
      await prisma.followUpAction.create({
        data: {
          reportId: createdReport.id,
          programmeType: followUp.programmeType,
          assignedDepartment: followUp.assignedDepartment,
          actionDetails: followUp.actionDetails,
          recordedByUserId: createdUsers['BDO'].id,
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 15 * 3600 * 1000),
        },
      });

      await prisma.workflowEvent.create({
        data: {
          reportId: createdReport.id,
          actorUserId: createdUsers['BDO'].id,
          actorName: createdUsers['BDO'].fullName,
          actorRole: 'BDO',
          action: 'RECORD_ACTION',
          fromStatus: 'REFERRED_FOR_RECOVERY',
          toStatus: createdReport.status,
          remarks: `${followUp.assignedDepartment}: ${followUp.actionDetails}`,
          createdAt: new Date(Date.now() - 15 * 3600 * 1000),
        },
      });
    }
  }

  console.log(`Created ${seedReports.length} demonstration livelihood damage reports with workflows.`);
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
