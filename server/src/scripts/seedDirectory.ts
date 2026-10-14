import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.serviceDirectoryEntry.deleteMany({});

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

  console.log(`Successfully seeded ${services.length} relief service directory records!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
