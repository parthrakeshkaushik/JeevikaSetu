import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  PhoneCall,
  MapPin,
  Building,
  ShieldCheck,
  Search,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  HeartHandshake,
  Wheat,
  Fish,
  Radio,
  LifeBuoy,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { AudioPlayerButton } from '../../components/AudioPlayerButton.js';
import { useLanguage } from '../../context/LanguageContext.js';

// Top Statewide 24x7 Critical Emergency Helplines
const STATE_EMERGENCY_HELPLINES = [
  {
    id: 'bsdma-1070',
    number: '1070',
    title: 'राज्य आपदा आपातकालीन नियंत्रण कक्ष (Bihar State DEOC)',
    subtitle: 'बाढ़, तटबंध क्षरण, नाव बचाव एवं जान-माल सुरक्षा (24x7 Toll Free)',
    category: 'Disaster',
    badge: '24x7 आपात नंबर',
    color: 'from-red-600 to-rose-700',
    icon: AlertTriangle,
  },
  {
    id: 'bihar-112',
    number: '112',
    title: 'बिहार आपातकालीन सेवा (ERSS Police, Ambulance, Fire)',
    subtitle: 'बाढ़ में फंसे नागरिकों का रेस्क्यू एवं मेडिकल इमरजेंसी (Toll Free)',
    category: 'Rescue',
    badge: 'तुरंत पुलिस/रेस्क्यू',
    color: 'from-amber-600 to-orange-700',
    icon: LifeBuoy,
  },
  {
    id: 'vet-1962',
    number: '1962',
    title: 'सचल पशु चिकित्सा एवं आपातकालीन चारा हेल्पलाइन',
    subtitle: 'दुधारू एवं अन्य मवेशियों हेतु चारा पैकेट एवं सचल पशु एम्बुलेंस',
    category: 'Livestock',
    badge: 'पशु चारा व स्वास्थ्य',
    color: 'from-emerald-600 to-teal-700',
    icon: HeartHandshake,
  },
  {
    id: 'kisan-1551',
    number: '18001801551',
    displayNumber: '1800-180-1551',
    title: 'बिहार किसान कॉल सेंटर एवं आकस्मिक बीज सहायता',
    subtitle: 'फसल डूबने के बाद त्वरित बुवाई हेतु निःशुल्क आकस्मिक बीज सलाह',
    category: 'Agriculture',
    badge: 'आकस्मिक बीज',
    color: 'from-green-600 to-emerald-700',
    icon: Wheat,
  },
  {
    id: 'jeevika-144',
    number: '18003456144',
    displayNumber: '1800-3456-144',
    title: 'जीविका महिला स्वयं सहायता समूह आजीविका हेल्पलाइन',
    subtitle: 'बाढ़ प्रभावित परिवारों हेतु सतत जीविकोपार्जन व आपातकालीन सहायता',
    category: 'JEEViKA',
    badge: 'आजीविका सुरक्षा',
    color: 'from-indigo-600 to-blue-700',
    icon: Building,
  },
];

export const ServiceDirectory: React.FC = () => {
  const { language } = useLanguage();
  const [directory, setDirectory] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const queryDist = selectedDistrict !== 'ALL' ? selectedDistrict : undefined;
    api
      .getServiceDirectory(queryDist)
      .then((res) => {
        if (res.success && res.directory) {
          setDirectory(res.directory);
        }
      })
      .catch((err) => console.error('Error fetching directory:', err))
      .finally(() => setIsLoading(false));
  }, [selectedDistrict]);

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => {
      setCopiedNumber(null);
    }, 2500);
  };

  const filteredDirectory = useMemo(() => {
    return directory.filter((item) => {
      // Dept filter
      if (selectedDept !== 'ALL') {
        const d = (item.department || '').toLowerCase();
        if (selectedDept === 'Disaster' && !d.includes('disaster')) return false;
        if (selectedDept === 'Livestock' && !d.includes('animal')) return false;
        if (selectedDept === 'Agriculture' && !d.includes('agriculture')) return false;
        if (selectedDept === 'Fisheries' && !d.includes('fisheries')) return false;
        if (selectedDept === 'JEEViKA' && !d.includes('jeevika')) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const text = `${item.schemeName} ${item.description} ${item.contactPerson} ${item.contactPhone} ${item.block} ${item.district} ${item.officeAddress}`.toLowerCase();
        return text.includes(q);
      }

      return true;
    });
  }, [directory, selectedDept, searchTerm]);

  const audioGuidanceText =
    language === 'bho'
      ? 'बाढ़ राहत निर्देशिका में रउरा स्वागत बा। कौनों भी आपात स्थिति, पशु चारा, आकस्मिक बीज या नाव खातिर नीचे दिहल हरियर बटन दबा के सीधे कॉल करीं।'
      : 'बाढ़ राहत एवं आजीविका निर्देशिका में आपका स्वागत है। किसी भी आपात स्थिति, पशु चारा, आकस्मिक बीज या नाव हेतु नीचे दिए गए हरे बटन को दबाकर सीधे फोन लगाएं।';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Back button & Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पृष्ठ पर लौटें</span>
        </Link>

        <AudioPlayerButton textToSpeak={audioGuidanceText} label="निर्देश सुनें" />
      </div>

      {/* Main Title Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>बिहार सरकार बाढ़ राहत एवं आजीविका सहायता निर्देशिका</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          आपातकालीन नंबर एवं 1-क्लिक कॉलिंग केंद्र
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          पशु चारा, आकस्मिक बीज, नाव आवंटन, खाद्य राहत एवं आश्रय केंद्र हेतु नीचे दिए गए नंबरों पर सीधे एक क्लिक में कॉल करें।
        </p>
      </div>

      {/* Section 1: 24x7 State Emergency Helplines (Top Lifesaving Grid) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-600 animate-pulse" />
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            चौबीसों घंटे सक्रिय राज्य आपातकालीन हेल्पलाइन (24x7 Direct Helplines)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STATE_EMERGENCY_HELPLINES.map((h) => {
            const Icon = h.icon;
            const display = h.displayNumber || h.number;
            return (
              <div
                key={h.id}
                className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 shadow-md space-y-3 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                      {h.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">Toll Free</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-700 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                        {h.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {h.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-500">हेल्पलाइन नंबर:</span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {display}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <a
                      href={`tel:${h.number}`}
                      className="col-span-3 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      title={`${display} पर तुरंत कॉल करें`}
                    >
                      <PhoneCall className="w-4 h-4 animate-bounce" />
                      <span>सीधे कॉल करें</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy(h.number)}
                      className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center transition-colors border border-slate-200"
                      title="नंबर कॉपी करें"
                    >
                      {copiedNumber === h.number ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: District-Level Filter & Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              स्थानीय जिला एवं प्रखंड सहायता केंद्र (District & Block Centers)
            </h2>
          </div>

          {/* District Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">जिला चुनें:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="p-2 border-2 border-blue-400 rounded-xl text-xs font-bold text-slate-900 bg-blue-50/40 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">🌐 समस्त बिहार (All Bihar)</option>
              <option value="Supaul">📍 सुपौल जिला (Supaul)</option>
              <option value="Darbhanga">📍 दरभंगा जिला (Darbhanga)</option>
              <option value="Madhubani">📍 मधुबनी जिला (Madhubani)</option>
              <option value="Saharsa">📍 सहरसा जिला (Saharsa)</option>
              <option value="Muzaffarpur">📍 मुजफ्फरपुर जिला (Muzaffarpur)</option>
              <option value="Khagaria">📍 खगड़िया जिला (Khagaria)</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="प्रखंड (उदा. निर्मली, कुशेश्वरस्थान), अधिकारी, चारा, बीज या सेवा से खोजें..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1">विभाग:</span>
          {[
            { id: 'ALL', label: 'सभी सहायता केंद्र' },
            { id: 'Disaster', label: '🚨 राहत व आश्रय' },
            { id: 'Livestock', label: '🐮 पशु चारा व चिकित्सा' },
            { id: 'Agriculture', label: '🌾 आकस्मिक बीज' },
            { id: 'Fisheries', label: '🐟 मत्स्य पालन' },
            { id: 'JEEViKA', label: '🤝 जीविका' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedDept(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedDept === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Copy Notification Toast */}
      {copiedNumber && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>नंबर {copiedNumber} क्लिपबोर्ड में कॉपी हो गया!</span>
        </div>
      )}

      {/* Section 3: Directory Cards List */}
      {isLoading ? (
        <div className="text-center py-14 text-slate-400 text-sm">सहायता केंद्र लोड हो रहे हैं...</div>
      ) : filteredDirectory.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">कोई सहायता केंद्र नहीं मिला</h3>
          <p className="text-xs text-slate-500">
            कृपया जिला या खोज शब्द बदलकर पुनः प्रयास करें अथवा ऊपर दिए गए राज्य आपदा हेल्पलाइन (1070) पर कॉल करें।
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="text-xs text-slate-500 font-medium px-1">
            कुल <strong>{filteredDirectory.length}</strong> सहायता केंद्र एवं राहत अधिकारी उपलब्ध
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDirectory.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {/* Department & Location Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {item.department}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      📍 {item.district} {item.block && item.block !== 'Statewide' ? `• ${item.block}` : ''}
                    </span>
                  </div>

                  {/* Scheme Name */}
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {item.schemeName}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                {/* Nodal Officer & 1-Click Action */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="text-xs space-y-1 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>
                        प्रभारी: <strong>{item.contactPerson}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{item.officeAddress}</span>
                    </div>
                  </div>

                  {/* 1-Click Call & Copy Button Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${item.contactPhone}`}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      title={`${item.contactPhone} पर सीधे कॉल लगाएं`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>कॉल करें ({item.contactPhone})</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.contactPhone)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center transition-colors border border-slate-200"
                      title="नंबर कॉपी करें"
                    >
                      {copiedNumber === item.contactPhone ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citizen Safety Disclaimer */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1 text-left">
        <div className="font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>निःशुल्क एवं त्वरित सरकारी सहायता:</span>
        </div>
        <p className="text-[11px] text-blue-800 leading-relaxed">
          बाढ़ राहत सामग्री, पशु चारा, आकस्मिक बीज एवं नाव सुविधा पूर्णतः निःशुल्क सरकारी सहायता हैं। किसी भी बिचौलिए या अनाधिकृत व्यक्ति को कोई शुल्क न दें। आपात स्थिति में तुरंत 1070 अथवा 112 पर कॉल करें।
        </p>
      </div>
    </div>
  );
};
