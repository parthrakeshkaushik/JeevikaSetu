// Synthetic Seed Data for JeevikaSetu Demonstration
// Clearly labelled synthetic data for Hack for Social Cause 2027

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting JeevikaSetu multi-district seed...');

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

  // 1. Create Official Administrative Role Users across Bihar flood districts & State HQ
  const users = [
    // --- 1. STATE HEADQUARTERS (बिहार राज्य मुख्यालय) ---
    {
      email: 'admin@jeevikasetu.gov.in',
      fullName: 'Priya Sharma (प्रिया शर्मा)',
      role: 'SYSTEM_ADMIN',
      department: 'IT & e-Governance Cell',
      jurisdictionType: 'STATE',
      jurisdictionName: 'Bihar',
      phone: '9801234508',
    },
    {
      email: 'dm.state@jeevikasetu.gov.in',
      fullName: 'Vivek Kumar Singh, IAS (विवेक कुमार सिंह)',
      role: 'DM',
      department: 'Disaster Management Department',
      jurisdictionType: 'STATE',
      jurisdictionName: 'Bihar',
      phone: '9801234509',
    },

    // --- 2. SUPAUL DISTRICT (सुपौल जिला - कोसी बेसिन) ---
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
      email: 'adm.relief@jeevikasetu.gov.in',
      fullName: 'Sanjay Kumar Singh, BAS (संजय कुमार सिंह)',
      role: 'ADM',
      department: 'Disaster Management & Revenue',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Supaul',
      phone: '9801234506',
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
      email: 'bdo.nirmali@jeevikasetu.gov.in',
      fullName: 'Anjali Kumari, BAS (अंजलि कुमारी)',
      role: 'BDO',
      department: 'Rural Development',
      jurisdictionType: 'BLOCK',
      jurisdictionName: 'Nirmali',
      phone: '9801234502',
    },
    {
      email: 'volunteer@jeevikasetu.gov.in',
      fullName: 'Ramesh Mandal (रमेश मंडल)',
      role: 'VOLUNTEER',
      department: 'Rural Youth Volunteer',
      jurisdictionType: 'PANCHAYAT',
      jurisdictionName: 'Mahuwa',
      phone: '9801234501',
    },

    // --- 3. DARBHANGA DISTRICT (दरभंगा जिला - कमला/बागमती बेसिन) ---
    {
      email: 'dm.darbhanga@jeevikasetu.gov.in',
      fullName: 'Rajeev Raushan, IAS (राजीव रौशन)',
      role: 'DM',
      department: 'District Magistrate & Collector',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Darbhanga',
      phone: '9801234510',
    },
    {
      email: 'adm.darbhanga@jeevikasetu.gov.in',
      fullName: 'Manoj Kumar, BAS (मनोज कुमार)',
      role: 'ADM',
      department: 'Disaster Management & Revenue',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Darbhanga',
      phone: '9801234511',
    },
    {
      email: 'bdo.kusheshwar@jeevikasetu.gov.in',
      fullName: 'Shashi Shekhar, BAS (शशि शेखर)',
      role: 'BDO',
      department: 'Rural Development',
      jurisdictionType: 'BLOCK',
      jurisdictionName: 'Kusheshwar Asthan',
      phone: '9801234512',
    },
    {
      email: 'volunteer.darbhanga@jeevikasetu.gov.in',
      fullName: 'Amarjeet Sahani (अमरजीत सहनी)',
      role: 'VOLUNTEER',
      department: 'Fisheries & Rural Volunteer',
      jurisdictionType: 'PANCHAYAT',
      jurisdictionName: 'Satiyara',
      phone: '9801234513',
    },

    // --- 4. MADHUBANI DISTRICT (मधुबनी जिला - मिथिलांचल) ---
    {
      email: 'dm.madhubani@jeevikasetu.gov.in',
      fullName: 'Arvind Kumar Verma, IAS (अरविंद कुमार वर्मा)',
      role: 'DM',
      department: 'District Magistrate & Collector',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Madhubani',
      phone: '9801234514',
    },
    {
      email: 'bdo.jhanjharpur@jeevikasetu.gov.in',
      fullName: 'Pankaj Kumar, BAS (पंकज कुमार)',
      role: 'BDO',
      department: 'Rural Development',
      jurisdictionType: 'BLOCK',
      jurisdictionName: 'Jhanjharpur',
      phone: '9801234515',
    },
    {
      email: 'volunteer.madhubani@jeevikasetu.gov.in',
      fullName: 'Poonam Jha (पूनम झा)',
      role: 'VOLUNTEER',
      department: 'JEEViKA Self-Help Volunteer',
      jurisdictionType: 'PANCHAYAT',
      jurisdictionName: 'Kothia',
      phone: '9801234516',
    },

    // --- 5. SAHARSA DISTRICT (सहरसा जिला - कोसी तटबंध) ---
    {
      email: 'dm.saharsa@jeevikasetu.gov.in',
      fullName: 'Vaibhav Chaudhary, IAS (वैभव चौधरी)',
      role: 'DM',
      department: 'District Magistrate & Collector',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Saharsa',
      phone: '9801234517',
    },
    {
      email: 'bdo.simri@jeevikasetu.gov.in',
      fullName: 'Ashok Kumar, BAS (अशोक कुमार)',
      role: 'BDO',
      department: 'Rural Development',
      jurisdictionType: 'BLOCK',
      jurisdictionName: 'Simri Bakhtiarpur',
      phone: '9801234518',
    },

    // --- 6. MUZAFFARPUR DISTRICT (मुजफ्फरपुर जिला - बूढ़ी गंडक) ---
    {
      email: 'dm.muzaffarpur@jeevikasetu.gov.in',
      fullName: 'Subrat Kumar Sen, IAS (सुब्रत कुमार सेन)',
      role: 'DM',
      department: 'District Magistrate & Collector',
      jurisdictionType: 'DISTRICT',
      jurisdictionName: 'Muzaffarpur',
      phone: '9801234519',
    },
    {
      email: 'bdo.aurai@jeevikasetu.gov.in',
      fullName: 'Sunil Kumar, BAS (सुनील कुमार)',
      role: 'BDO',
      department: 'Rural Development',
      jurisdictionType: 'BLOCK',
      jurisdictionName: 'Aurai',
      phone: '9801234520',
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
    if (!createdUsers[u.role]) createdUsers[u.role] = created;
    createdUsers[u.email] = created;
  }
  console.log(`Created ${users.length} administrative multi-district demo accounts.`);

  // 2. Create Service Directory Entries across districts
  const services = [
    // --- STATEWIDE EMERGENCY HELPLINES ---
    {
      district: 'Bihar',
      block: 'Statewide',
      department: 'Disaster Management',
      schemeName: 'राज्य आपदा आपातकालीन नियंत्रण कक्ष (Bihar State DEOC - 24x7)',
      description: 'बाढ़, तटबंध क्षरण, नाव आवश्यकता एवं जान-माल सुरक्षा हेतु राज्य स्तरीय केंद्रीय हेल्पलाइन।',
      contactPerson: 'कंट्रोल रूम प्रभारी, राज्य आपदा प्रबंधन प्राधिकरण (BSDMA)',
      contactPhone: '1070',
      officeAddress: 'आपदा प्रबंधन भवन, सरदार पटेल भवन, बेली रोड, पटना',
    },
    {
      district: 'Bihar',
      block: 'Statewide',
      department: 'Disaster Management',
      schemeName: 'बिहार आपातकालीन सेवा (Bihar Emergency Rescue - Police, Ambulance, Fire)',
      description: 'बाढ़ में फंसे नागरिकों, मेडिकल इमरजेंसी एवं नाव रेस्क्यू हेतु 24 घंटे सक्रिय आपात नंबर।',
      contactPerson: 'आपातकालीन अनुक्रिया नियंत्रण कक्ष (ERSS)',
      contactPhone: '112',
      officeAddress: 'राज्य आपातकालीन अनुक्रिया केंद्र, पटना',
    },
    {
      district: 'Bihar',
      block: 'Statewide',
      department: 'Animal Husbandry',
      schemeName: 'सचल पशु चिकित्सा एवं आपातकालीन चारा हेल्पलाइन (Toll-Free Animal Help)',
      description: 'दुधारू एवं अन्य मवेशियों हेतु आपातकालीन चारा आपूर्ति एवं महामारी रोधी सचल वाहन।',
      contactPerson: 'राज्य पशु स्वास्थ्य नियंत्रण सेल',
      contactPhone: '1962',
      officeAddress: 'पशुपालन निदेशालय, विकास भवन, पटना',
    },
    {
      district: 'Bihar',
      block: 'Statewide',
      department: 'Agriculture Dept',
      schemeName: 'बिहार किसान कॉल सेंटर एवं आकस्मिक बीज सहायता (Kisan Helpline)',
      description: 'बाढ़ के बाद त्वरित बुवाई हेतु निःशुल्क आकस्मिक मक्का/तोरिया बीज मिनीकिट एवं सलाह।',
      contactPerson: 'कृषि प्रसार एवं बीज वितरण कोषांग',
      contactPhone: '1800-180-1551',
      officeAddress: 'कृषि भवन, मीठापुर, पटना',
    },
    {
      district: 'Bihar',
      block: 'Statewide',
      department: 'JEEViKA',
      schemeName: 'जीविका महिला स्वयं सहायता समूह आजीविका सहायता (JEEViKA Livelihood Desk)',
      description: 'बाढ़ प्रभावित दीदियों हेतु सतत जीविकोपार्जन योजना एवं आपातकालीन ऋण सुविधा।',
      contactPerson: 'हेल्पडेस्क समन्वयक, बिहार ग्रामीण जीविकोपार्जन प्रोत्साहन समिति',
      contactPhone: '1800-3456-144',
      officeAddress: 'विद्युत भवन-II, बेली रोड, पटना',
    },

    // --- SUPAUL DISTRICT ---
    {
      district: 'Supaul',
      block: 'Supaul Sadar',
      department: 'Disaster Management',
      schemeName: 'जिला आपातकालीन संचालन केंद्र (DEOC Supaul 24x7 Control Room)',
      description: 'सुपौल जिला अंतर्गत कोसी जलस्तर, कटाव, नाव आवंटन एवं सामुदायिक रसोई सहायता केंद्र।',
      contactPerson: 'जिला आपदा प्रबंधन पदाधिकारी (DDMO)',
      contactPhone: '06473-224110',
      officeAddress: 'समाहरणालय परिसर, सुपौल',
    },
    {
      district: 'Supaul',
      block: 'Nirmali',
      department: 'Disaster Management',
      schemeName: 'निर्मली कोसी तटबंध राहत एवं आश्रय केंद्र (Nirmali Flood Cell)',
      description: 'विस्थापित परिवारों हेतु सूखा राशन पैकेट, प्लास्टिक शीट एवं शुद्ध पेयजल व्यवस्था।',
      contactPerson: 'श्री वीरेंद्र यादव (सर्किल इंस्पेक्टर / अंचल प्रभारी)',
      contactPhone: '06473-222301',
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
      officeAddress: 'पशु औषधालय, निर्मली बाजार, सुपौल',
    },
    {
      district: 'Supaul',
      block: 'Pipra',
      department: 'Agriculture Dept',
      schemeName: 'पिपरा आकस्मिक बीज एवं कृषि क्षति आकलन केंद्र',
      description: 'धान फसल जलमग्नता सर्वे एवं रबी दलहन-तिलहन बीज मिनीकिट वितरण।',
      contactPerson: 'श्री राकेश रोशन (प्रखंड कृषि पदाधिकारी, पिपरा)',
      contactPhone: '9473191055',
      officeAddress: 'ई-किसान भवन, पिपरा, सुपौल',
    },

    // --- DARBHANGA DISTRICT ---
    {
      district: 'Darbhanga',
      block: 'Darbhanga Sadar',
      department: 'Disaster Management',
      schemeName: 'जिला आपातकालीन संचालन केंद्र (DEOC Darbhanga 24x7)',
      description: 'दरभंगा जिला अंतर्गत कमला, बागमती एवं अधवारा समूह नदियों की बाढ़ सहायता एवं नाव परिचालन।',
      contactPerson: 'प्रभारी पदाधिकारी, जिला आपदा शाखा',
      contactPhone: '06272-245255',
      officeAddress: 'कलेक्ट्रेट परिसर, दरभंगा',
    },
    {
      district: 'Darbhanga',
      block: 'Kusheshwar Asthan',
      department: 'Disaster Management',
      schemeName: 'कुशेश्वरस्थान बाढ़ राहत एवं जलजमाव सहायता केंद्र',
      description: 'बाढ़ विस्थापितों हेतु नाव सेवा, पॉलिथीन शीट्स एवं सूखा राशन पैकेट।',
      contactPerson: 'श्री शशि शेखर (प्रखंड विकास पदाधिकारी, कुशेश्वरस्थान)',
      contactPhone: '9801234512',
      officeAddress: 'प्रखंड मुख्यालय, कुशेश्वरस्थान, दरभंगा',
    },
    {
      district: 'Darbhanga',
      block: 'Kusheshwar Asthan',
      department: 'Fisheries Dept',
      schemeName: 'मत्स्य पालक क्षतिपूर्ति एवं फिंगरलिंग अनुदान केंद्र',
      description: 'बाढ़ प्रभावित पोखरों हेतु पुनः मत्स्य बीज संचयन, जाल अनुदान एवं तकनीकी सहायता।',
      contactPerson: 'श्री दिनेश साहनी (मत्स्य प्रसार पदाधिकारी)',
      contactPhone: '9431102847',
      officeAddress: 'प्रखंड मत्स्य कार्यालय, कुशेश्वर स्थान, दरभंगा',
    },
    {
      district: 'Darbhanga',
      block: 'Biraul',
      department: 'Animal Husbandry',
      schemeName: 'बिरौल पशुधन सुरक्षा एवं चारा डिपो',
      description: 'जलभराव में फंसे मवेशियों हेतु सूखा चारा एवं गलघोंटू/लंगड़ी टीका शिविर।',
      contactPerson: 'डॉ. आनंद झा (पशु चिकित्सा प्रभारी)',
      contactPhone: '9431823902',
      officeAddress: 'अनुमंडल पशु चिकित्सालय, बिरौल, दरभंगा',
    },

    // --- MADHUBANI DISTRICT ---
    {
      district: 'Madhubani',
      block: 'Madhubani Sadar',
      department: 'Disaster Management',
      schemeName: 'जिला आपातकालीन संचालन केंद्र (DEOC Madhubani 24x7)',
      description: 'कमला बलान एवं भुतही बलान बाढ़ प्रभावित परिवारों हेतु राहत सामग्री व नाव समन्वय।',
      contactPerson: 'आपदा शाखा प्रभारी, मधुबनी',
      contactPhone: '06276-222248',
      officeAddress: 'जिला समाहरणालय, मधुबनी',
    },
    {
      district: 'Madhubani',
      block: 'Jhanjharpur',
      department: 'Agriculture Dept',
      schemeName: 'मखाना एवं आकस्मिक रबी फसल योजना केंद्र',
      description: 'जलमग्न मखाना एवं धान कृषकों हेतु आकस्मिक बीज मिनीकिट व तकनीकी मार्गदर्शन।',
      contactPerson: 'श्री रामानंद झा (प्रखंड कृषि पदाधिकारी)',
      contactPhone: '9473191024',
      officeAddress: 'ई-किसान भवन, झंझारपुर, मधुबनी',
    },
    {
      district: 'Madhubani',
      block: 'Madhepur',
      department: 'Animal Husbandry',
      schemeName: 'मधेपुर मवेशी चारा वितरण एवं पशु चिकित्सा शिविर',
      description: 'बाढ़ प्रभावित पंचायतों में पशु चारा एवं संक्रामक रोग रोकथाम।',
      contactPerson: 'डॉ. एस. के. मंडल (पशु शल्य चिकित्सक)',
      contactPhone: '9431823903',
      officeAddress: 'प्रखंड पशु चिकित्सालय, मधेपुर, मधुबनी',
    },

    // --- SAHARSA DISTRICT ---
    {
      district: 'Saharsa',
      block: 'Saharsa Sadar',
      department: 'Disaster Management',
      schemeName: 'जिला आपातकालीन संचालन केंद्र (DEOC Saharsa 24x7)',
      description: 'कोसी पूर्वी तटबंध के अंदर बसे गांवों हेतु नाव, राहत शिविर व खाद्य सुरक्षा नियंत्रण कक्ष।',
      contactPerson: 'नोडल आपदा पदाधिकारी, सहरसा',
      contactPhone: '06478-223405',
      officeAddress: 'समाहरणालय, सहरसा',
    },
    {
      district: 'Saharsa',
      block: 'Simri Bakhtiarpur',
      department: 'Disaster Management',
      schemeName: 'सिमरी बख्तियारपुर बाढ़ राहत चौकी एवं आश्रय स्थल',
      description: 'कटाव प्रभावित परिवारों हेतु शरण स्थल, सामुदायिक रसोई एवं पेयजल।',
      contactPerson: 'श्री अशोक कुमार (प्रखंड विकास पदाधिकारी)',
      contactPhone: '9801234518',
      officeAddress: 'प्रखंड कार्यालय, सिमरी बख्तियारपुर, सहरसा',
    },
    {
      district: 'Saharsa',
      block: 'Mahishi',
      department: 'Animal Husbandry',
      schemeName: 'महिषी पशु चारा डिपो एवं सचल पशु चिकित्सा',
      description: 'तटबंध के भीतर पशुओं के लिए सूखा चारा एवं संक्रामक रोग प्रतिरोधक दवाइयां।',
      contactPerson: 'डॉ. प्रवीण कुमार (पशु चिकित्सक)',
      contactPhone: '9431823904',
      officeAddress: 'राजकीय पशु चिकित्सालय, महिषी, सहरसा',
    },

    // --- MUZAFFARPUR DISTRICT ---
    {
      district: 'Muzaffarpur',
      block: 'Muzaffarpur Sadar',
      department: 'Disaster Management',
      schemeName: 'जिला आपातकालीन संचालन केंद्र (DEOC Muzaffarpur 24x7)',
      description: 'बूढ़ी गंडक, बागमती एवं लखनदेई बाढ़ प्रभावित क्षेत्रों हेतु 24x7 नियंत्रण कक्ष।',
      contactPerson: 'जिला आपदा प्रबंधन समन्वयक',
      contactPhone: '0621-2212377',
      officeAddress: 'समाहरणालय भवन, मुजफ्फरपुर',
    },
    {
      district: 'Muzaffarpur',
      block: 'Aurai',
      department: 'Disaster Management',
      schemeName: 'औराई बागमती बाढ़ राहत कैंप एवं नाव परिचालन केंद्र',
      description: 'औराई प्रखंड के जलमग्न टोलों हेतु नाव गश्ती, पॉलीथिन वितरण एवं राहत शिविर।',
      contactPerson: 'श्री सुनील कुमार (प्रखंड विकास पदाधिकारी)',
      contactPhone: '9801234520',
      officeAddress: 'प्रखंड मुख्यालय, औराई, मुजफ्फरपुर',
    },
    {
      district: 'Muzaffarpur',
      block: 'Katra',
      department: 'Animal Husbandry',
      schemeName: 'कटरा पशुधन सुरक्षा एवं आपातकालीन चारा डिपो',
      description: 'मवेशियों के लिए सूखा चारा, दवाएं एवं बाढ़ शरण स्थल पर पशु देखरेख।',
      contactPerson: 'डॉ. विनय कुमार (पशु चिकित्सा प्रभारी)',
      contactPhone: '9431823905',
      officeAddress: 'प्रखंड पशु चिकित्सा केंद्र, कटरा, मुजफ्फरपुर',
    },
  ];

  for (const s of services) {
    await prisma.serviceDirectoryEntry.create({ data: s });
  }
  console.log(`Created ${services.length} relief service directory records.`);

  // 3. Create Realistic Multi-District Livelihood Damage Reports
  const seedReports = [
    // --- SUPAUL CASES ---
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
      assignedUserId: createdUsers['volunteer@jeevikasetu.gov.in']?.id || createdUsers['VOLUNTEER']?.id,
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
      assignedUserId: createdUsers['bdo.nirmali@jeevikasetu.gov.in']?.id || createdUsers['BDO']?.id,
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
      assignedUserId: createdUsers['volunteer@jeevikasetu.gov.in']?.id || createdUsers['VOLUNTEER']?.id,
      assignedRole: 'VOLUNTEER',
      submittedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },

    // --- DARBHANGA CASES ---
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

    // --- MADHUBANI CASES ---
    {
      reportNumber: 'JS-2027-MAD-5201',
      citizenName: 'रामानंद कामत (Ramanand Kamat)',
      citizenPhone: '9876543216',
      preferredLanguage: 'hi',
      isVoiceReport: true,
      rawTranscript: 'कमला बलान के पानी से हमर मखाना के खेत और पोखरा डूब गेल',
      confirmedTranscript: 'कमला बलान नदी में जलस्तर अचानक बढ़ने से 1.5 एकड़ का मखाना उत्पादन पोखरा और 1 बीघा धान की फसल जलमग्न हो गई है।',
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

    // --- SAHARSA CASES ---
    {
      reportNumber: 'JS-2027-SAH-3301',
      citizenName: 'दिलीप यादव (Dilip Yadav)',
      citizenPhone: '9876543217',
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

    // --- MUZAFFARPUR CASES ---
    {
      reportNumber: 'JS-2027-MUZ-4101',
      citizenName: 'मो. अख्तर अंसारी (Md. Akhtar Ansari)',
      citizenPhone: '9876543218',
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
          verifiedByUserId: createdUsers['volunteer@jeevikasetu.gov.in']?.id || createdUsers['VOLUNTEER'].id,
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
          actorUserId: createdUsers['volunteer@jeevikasetu.gov.in']?.id || createdUsers['VOLUNTEER'].id,
          actorName: 'Ramesh Mandal',
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
          recordedByUserId: createdUsers['bdo.nirmali@jeevikasetu.gov.in']?.id || createdUsers['BDO'].id,
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 15 * 3600 * 1000),
        },
      });

      await prisma.workflowEvent.create({
        data: {
          reportId: createdReport.id,
          actorUserId: createdUsers['bdo.nirmali@jeevikasetu.gov.in']?.id || createdUsers['BDO'].id,
          actorName: 'Anjali Kumari, BAS',
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

  console.log(`Created ${seedReports.length} multi-district livelihood damage reports.`);
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
