// Configuration and Domain Constants for JeevikaSetu

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'jeevikasetu-bihar-hsc-2027-jwt-secret-key-secure',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Administrative Roles
export const ROLES = {
  VOLUNTEER: 'VOLUNTEER',
  BDO: 'BDO',
  DDC: 'DDC',
  DPO: 'DPO',
  ADM: 'ADM',
  SDM: 'SDM',
  DM: 'DM',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  CITIZEN: 'CITIZEN',
} as const;

export type RoleType = keyof typeof ROLES;

// Case Workflow Statuses
export const REPORT_STATUS = {
  SUBMITTED: 'SUBMITTED',
  AWAITING_REVIEW: 'AWAITING_REVIEW',
  ASSIGNED_FOR_VERIFICATION: 'ASSIGNED_FOR_VERIFICATION',
  VERIFICATION_IN_PROGRESS: 'VERIFICATION_IN_PROGRESS',
  VERIFIED: 'VERIFIED',
  PARTIALLY_VERIFIED: 'PARTIALLY_VERIFIED',
  UNABLE_TO_VERIFY: 'UNABLE_TO_VERIFY',
  ADDITIONAL_INFO_REQUIRED: 'ADDITIONAL_INFO_REQUIRED',
  REFERRED_FOR_RECOVERY: 'REFERRED_FOR_RECOVERY',
  FOLLOWUP_IN_PROGRESS: 'FOLLOWUP_IN_PROGRESS',
  ACTION_RECORDED: 'ACTION_RECORDED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
} as const;

export type ReportStatusType = keyof typeof REPORT_STATUS;

// Livelihood Categories
export const LIVELIHOOD_CATEGORIES = [
  { id: 'CROP', nameHi: 'फसल क्षति (धान/मक्का/सब्जी)', nameBho: 'फसल नुकसानी', nameEn: 'Crop & Agricultural Loss' },
  { id: 'LIVESTOCK', nameHi: 'पशुधन क्षति / चारा संकट', nameBho: 'गाय/भैंस/बकरी नुकसानी', nameEn: 'Livestock & Fodder Crisis' },
  { id: 'EQUIPMENT', nameHi: 'कृषि उपकरण / पम्पसेट / मशीनरी', nameBho: 'खेती के औजार/पंपसेट', nameEn: 'Agricultural Equipment & Machinery' },
  { id: 'SHOP_BUSINESS', nameHi: 'छोटी दुकान / गुमटी / व्यवसाय', nameBho: 'दुकान/व्यवसाय नुकसानी', nameEn: 'Small Shop / Local Business' },
  { id: 'INVENTORY', nameHi: 'भंडारित अनाज व सामान', nameBho: 'अनाज/राशन नुकसानी', nameEn: 'Stored Grain & Inventory' },
  { id: 'WAGE_LABOR', nameHi: 'दैनिक मजदूरी अवरोध', nameBho: 'मजूरी के रुकावट', nameEn: 'Daily Wage Labor Disruption' },
  { id: 'FISHERIES', nameHi: 'मत्स्य पालन / पोखरा क्षति', nameBho: 'मछली पालन नुकसानी', nameEn: 'Fisheries & Aquaculture Loss' },
  { id: 'ARTISAN_TOOLS', nameHi: 'कारीगर / हस्तशिल्प उपकरण', nameBho: 'कारीगरी के औजार', nameEn: 'Artisan Tools & Workspace' },
  { id: 'OTHER', nameHi: 'अन्य आजीविका क्षति', nameBho: 'अउर कवनो नुकसानी', nameEn: 'Other Livelihood Loss' },
];

// Authentic Bihar Flood Geographic Hierarchy
export const BIHAR_GEOGRAPHY: Record<string, { blocks: Record<string, string[]> }> = {
  'Supaul': {
    blocks: {
      'Nirmali': ['Mahuwa', 'Piprahi', 'Dighia', ' मझारी (Majhari)', 'Belhi'],
      'Pipra': ['Rampur', 'Kataiya', 'Basaha', 'Tharbitta', 'Amha'],
      'Kishanpur': ['Singheshwarpur', 'Bhairabpur', 'Simraha', 'Baluwa'],
      'Marauna': ['Lalpur', 'Barhara', 'Belhi', 'Kamalpur'],
      'Saraigarh-Bhaptiyahi': ['Saraigarh', 'Bhaptiyahi', 'Chhhatapur', 'Lauka'],
    },
  },
  'Darbhanga': {
    blocks: {
      'Kusheshwar Asthan': ['Satiyara', 'Ujua', 'Jhakhra', 'Usari', 'Ber'],
      'Kusheshwar Asthan East': ['Pipra', 'Hirani', 'Baraich', 'Itwa'],
      'Biraul': ['Pojh', 'Neuri', 'Afzala', 'Ghanshyampur'],
      'Kiratpur': ['Tarwara', 'Nari', 'Rampur', 'Kuboul'],
      'Gaura Bauram': ['Bauram', 'Aasi', 'Mansara', 'Kasiyatha'],
    },
  },
  'Madhubani': {
    blocks: {
      'Jhanjharpur': ['Kothia', 'Lakhnaur', 'Mahrail', 'Sukhet'],
      'Madhepur': ['Bhakhrain', 'Nawada', 'Pachhiari', 'Dhema'],
      'Bisfi': ['Sadullahpur', 'Rathos', 'Singhaso', 'Chahuta'],
    },
  },
  'Muzaffarpur': {
    blocks: {
      'Katra': ['Yajuar', 'Baraitha', 'Dhanour', 'Paharpur'],
      'Aurai': ['Bhadurpur', 'Bahuara', 'Basant', 'Madhuban'],
      'Gaighat': ['Benibad', 'Loma', 'Janta', 'Pirauchha'],
      'Minapur': ['Ali Neora', 'Tengrari', 'Chhapra', 'Ghosaut'],
    },
  },
  'Saharsa': {
    blocks: {
      'Mahishi': ['Kundah', 'Telhar', 'Nahwar', 'Jalmai'],
      'Simri Bakhtiarpur': ['Khamhaunti', 'Sardaha', 'Paharpar', 'Mohammadpur'],
      'Nauhatta': ['Shahpur', 'Mohanpur', 'Sattar', 'Bakaur'],
    },
  },
  'Khagaria': {
    blocks: {
      'Alauli': ['Amba', 'Chakla', 'Meghna', 'Bauraha'],
      'Beldaur': ['Basauna', 'Dighoun', 'Pirnagar', 'Tetarabad'],
    },
  },
  'Samastipur': {
    blocks: {
      'Mohiuddinagar': ['Madurapur', 'Rajaura', 'Mohanpur', 'Bishunpur'],
      'Bibhutipur': ['Singhia', 'Tabhka', 'Chor-Tabhka', 'Kalyanpur'],
    },
  },
};
