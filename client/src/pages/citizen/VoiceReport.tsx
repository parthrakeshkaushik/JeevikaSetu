import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  RefreshCw,
  Edit2,
  MapPin,
  Phone,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { VoiceRecorder } from '../../components/VoiceRecorder.js';
import { AudioPlayerButton } from '../../components/AudioPlayerButton.js';
import { api } from '../../api/client.js';

export const VoiceReport: React.FC = () => {
  const { t, language } = useLanguage();
  const { speakText } = useAccessibility();
  const navigate = useNavigate();

  // Step state: 1 = Record, 2 = Confirm Transcript, 3 = Location & Contact, 4 = Review & Submit
  const [step, setStep] = useState<number>(1);

  // Form State
  const [isVoiceReport, setIsVoiceReport] = useState<boolean>(true);
  const [rawTranscript, setRawTranscript] = useState<string>('');
  const [confirmedTranscript, setConfirmedTranscript] = useState<string>('');
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);

  // Extracted AI Entities
  const [aiSuggestions, setAiSuggestions] = useState<{
    suggestedCategories: string[];
    detectedAssets: string[];
    confidence: number;
    disclaimer: string;
  } | null>(null);

  // Geography options
  const [geographyData, setGeographyData] = useState<any>(null);
  const [districts, setDistricts] = useState<string[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [availablePanchayats, setAvailablePanchayats] = useState<string[]>([]);

  // Citizen details
  const [citizenName, setCitizenName] = useState<string>('');
  const [citizenPhone, setCitizenPhone] = useState<string>('');
  const [district, setDistrict] = useState<string>('Supaul');
  const [block, setBlock] = useState<string>('Nirmali');
  const [panchayat, setPanchayat] = useState<string>('Mahuwa');
  const [village, setVillage] = useState<string>('');
  const [wardNumber, setWardNumber] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [estimatedLossAmount, setEstimatedLossAmount] = useState<string>('');
  const [disruptionDurationDays, setDisruptionDurationDays] = useState<string>('5');
  const [householdSize, setHouseholdSize] = useState<number>(5);
  const [vulnerabilityFlags, setVulnerabilityFlags] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch authentic Bihar geography on load
  useEffect(() => {
    api.getGeography()
      .then((data) => {
        if (data.success) {
          setGeographyData(data.geography);
          setDistricts(data.districts);
        }
      })
      .catch((err) => console.warn('Could not load geography:', err));
  }, []);

  // Update blocks when district changes
  useEffect(() => {
    if (geographyData && district && geographyData[district]) {
      const blocks = Object.keys(geographyData[district].blocks || {});
      setAvailableBlocks(blocks);
      if (blocks.length > 0 && !blocks.includes(block)) {
        setBlock(blocks[0]);
      }
    }
  }, [district, geographyData]);

  // Update panchayats when block changes
  useEffect(() => {
    if (geographyData && district && block && geographyData[district]?.blocks[block]) {
      const panchayats = geographyData[district].blocks[block] || [];
      setAvailablePanchayats(panchayats);
      if (panchayats.length > 0 && !panchayats.includes(panchayat)) {
        setPanchayat(panchayats[0]);
      }
    }
  }, [district, block, geographyData]);

  // Handle voice recording completed
  const handleTranscriptReady = async (text: string, isVoice: boolean) => {
    setRawTranscript(text);
    setConfirmedTranscript(text);
    setIsVoiceReport(isVoice);
    setStep(2); // Go to confirm transcript step

    // Call AI extraction
    try {
      const res = await api.extractFromTranscript(text);
      if (res.success && res.extraction) {
        setAiSuggestions(res.extraction);
        setSelectedCategories(res.extraction.suggestedCategories);
      }
    } catch (e) {
      console.warn('AI extraction fallback:', e);
      setSelectedCategories(['CROP']);
    }
  };

  const handleCategoryToggle = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleVulnerabilityToggle = (vulnId: string) => {
    setVulnerabilityFlags((prev) =>
      prev.includes(vulnId) ? prev.filter((v) => v !== vulnId) : [...prev, vulnId]
    );
  };

  // Final submission
  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!citizenName.trim()) {
      setErrorMessage('कृपया अपना नाम दर्ज करें (Name required)');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(citizenPhone.trim())) {
      setErrorMessage('कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (Valid 10-digit phone)');
      return;
    }
    if (!village.trim()) {
      setErrorMessage('कृपया गांव/टोला का नाम दर्ज करें (Village required)');
      return;
    }
    if (selectedCategories.length === 0) {
      setErrorMessage('कृपया कम से कम एक प्रभावित श्रेणी चुनें (Select at least one category)');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        citizenName: citizenName.trim(),
        citizenPhone: citizenPhone.trim(),
        preferredLanguage: language,
        isVoiceReport,
        rawTranscript,
        confirmedTranscript: confirmedTranscript.trim(),
        district,
        block,
        panchayat,
        village: village.trim(),
        wardNumber: wardNumber.trim() || undefined,
        livelihoodCategories: selectedCategories,
        lossDescription: confirmedTranscript.trim(),
        estimatedLossAmount: estimatedLossAmount ? parseFloat(estimatedLossAmount) : undefined,
        disruptionDurationDays: disruptionDurationDays ? parseInt(disruptionDurationDays) : undefined,
        householdSize,
        vulnerabilityFlags,
      };

      const res = await api.submitReport(payload);

      if (res.success && res.report) {
        navigate('/report/success', {
          state: { report: res.report },
        });
      } else {
        setErrorMessage(res.message || 'रिपोर्ट दर्ज करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
      }
    } catch (error: any) {
      console.error('Submission failed:', error);
      setErrorMessage('नेटवर्क समस्या के कारण रिपोर्ट दर्ज नहीं हो सकी। कृपया इंटरनेट जांचें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Progress Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className={step >= 1 ? 'text-blue-600 font-bold' : ''}>1. आवाज</span>
          <span>•</span>
          <span className={step >= 2 ? 'text-blue-600 font-bold' : ''}>2. पुष्टि</span>
          <span>•</span>
          <span className={step >= 3 ? 'text-blue-600 font-bold' : ''}>3. स्थान व संपर्क</span>
          <span>•</span>
          <span className={step >= 4 ? 'text-blue-600 font-bold' : ''}>4. समीक्षा व जमा</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* STEP 1: Voice Recording */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <VoiceRecorder
            onTranscriptReady={handleTranscriptReady}
            initialTranscript={confirmedTranscript}
          />
        </div>
      )}

      {/* STEP 2: Confirm Transcript */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t('confirmTranscriptTitle')}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              {t('confirmTranscriptSubtitle')}
            </p>
          </div>

          {/* Transcript Box */}
          <div className="p-4 sm:p-6 bg-blue-50/60 rounded-xl border border-blue-200">
            {isEditingTranscript ? (
              <textarea
                rows={4}
                value={confirmedTranscript}
                onChange={(e) => setConfirmedTranscript(e.target.value)}
                className="w-full p-3 bg-white border border-blue-400 rounded-lg text-slate-900 text-base focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed font-sans">
                "{confirmedTranscript}"
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-200/60">
              <AudioPlayerButton
                textToSpeak={confirmedTranscript}
                label="विवरण को आवाज में सुनें (Listen)"
              />

              <button
                type="button"
                onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                className="text-xs text-blue-700 font-medium hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingTranscript ? 'संपादन समाप्त करें (Done)' : t('btnEditText')}</span>
              </button>
            </div>
          </div>

          {/* AI Category Extraction Notice */}
          {aiSuggestions && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>एआई सुझावित आजीविका श्रेणियां (AI-extracted categories):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aiSuggestions.detectedAssets.map((asset, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-teal-100/80 text-teal-800 font-semibold rounded-md text-[11px]"
                  >
                    ✓ {asset}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-teal-700 italic">
                * {aiSuggestions.disclaimer}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-blue-200" />
              <span>{t('btnConfirm')}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('btnSpeakAgain')}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Location, Contact & Details */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('detailsTitle')}</h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">{t('detailsSubtitle')}</p>
          </div>

          {/* Citizen Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('citizenNameLabel')} *
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="उदा. भोला यादव / Ramesh Mandal"
                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('citizenPhoneLabel')} *
              </label>
              <input
                type="tel"
                maxLength={10}
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="उदा. 9876543210"
                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Authentic Bihar Geography Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('districtLabel')} *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d} (बिहार)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('blockLabel')} *
              </label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {availableBlocks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('panchayatLabel')} *
              </label>
              <select
                value={panchayat}
                onChange={(e) => setPanchayat(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {availablePanchayats.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Village and Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('villageLabel')} *
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="उदा. रामपुर दक्षिण टोला / महुवा"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                वार्ड संख्या (वैकल्पिक)
              </label>
              <input
                type="text"
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                placeholder="उदा. 4"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Livelihood Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {t('categoryLabel')} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'CROP', label: '🌾 फसल क्षति (धान/मक्का/सब्जी)' },
                { id: 'LIVESTOCK', label: '🐄 पशुधन क्षति / चारा संकट' },
                { id: 'EQUIPMENT', label: '🚜 कृषि उपकरण / पम्पसेट / मोटर' },
                { id: 'SHOP_BUSINESS', label: '🏪 छोटी दुकान / गुमटी / व्यवसाय' },
                { id: 'INVENTORY', label: '📦 भंडारित अनाज व सामग्री' },
                { id: 'WAGE_LABOR', label: '🔨 दैनिक मजदूरी अवरोध' },
                { id: 'FISHERIES', label: '🐟 मत्स्य पालन / पोखरा क्षति' },
                { id: 'ARTISAN_TOOLS', label: '🧶 कारीगर / हस्तशिल्प उपकरण' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-colors flex items-center justify-between ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.label}</span>
                  {selectedCategories.includes(cat.id) && (
                    <span className="text-blue-600 font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Loss Amount & Disruption Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('estimatedLossLabel')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={estimatedLossAmount}
                  onChange={(e) => setEstimatedLossAmount(e.target.value)}
                  placeholder="उदा. 40000"
                  className="w-full pl-7 p-2.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[10px] text-amber-700 mt-1 font-medium">
                * {t('estimatedLossDisclaimer')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('disruptionDurationLabel')}
              </label>
              <select
                value={disruptionDurationDays}
                onChange={(e) => setDisruptionDurationDays(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="2">1 - 2 दिन</option>
                <option value="5">3 - 7 दिन</option>
                <option value="12">8 - 14 दिन</option>
                <option value="20">15 दिन से अधिक</option>
              </select>
            </div>
          </div>

          {/* Vulnerability Indicators */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('vulnerabilityLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'WOMEN_HEADED', label: t('vulnWomenHeaded') },
                { id: 'LANDLESS_LABOR', label: t('vulnLandlessLabor') },
                { id: 'MARGINAL_FARMER', label: t('vulnMarginalFarmer') },
                { id: 'DISABLED', label: t('vulnDisabled') },
              ].map((v) => (
                <label
                  key={v.id}
                  className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                    vulnerabilityFlags.includes(v.id)
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={vulnerabilityFlags.includes(v.id)}
                    onChange={() => handleVulnerabilityToggle(v.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{v.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>पीछे</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!citizenName.trim() || !citizenPhone.trim() || !village.trim()) {
                  setErrorMessage('कृपया नाम, मोबाइल नंबर और गांव अवश्य भरें।');
                  return;
                }
                setErrorMessage(null);
                setStep(4);
              }}
              className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>समीक्षा करें (Review)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review and Submit */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              अपनी रिपोर्ट की समीक्षा करें
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              कृपया सभी जानकारी जांच लें और जमा करने के लिए बटन दबाएं
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-3 text-xs sm:text-sm">
            <div className="pb-3 border-b border-slate-200">
              <div className="text-slate-500 text-xs font-semibold">नुकसान का विवरण:</div>
              <p className="text-slate-900 font-medium mt-1 leading-relaxed">
                "{confirmedTranscript}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="text-slate-500 text-xs">नागरिक:</span>
                <div className="font-bold text-slate-900">{citizenName}</div>
                <div className="text-slate-600 text-xs font-mono">{citizenPhone}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">स्थान:</span>
                <div className="font-bold text-slate-900">{village}, {panchayat}</div>
                <div className="text-slate-600 text-xs">{block}, {district}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-slate-500 text-xs mr-1 self-center">श्रेणियां:</span>
              {selectedCategories.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>

            {estimatedLossAmount && (
              <div className="text-xs text-slate-700 pt-1">
                स्व-रिपोर्टेड अनुमान: <strong>₹{parseFloat(estimatedLossAmount).toLocaleString('en-IN')}</strong> (ऐच्छिक)
              </div>
            )}
          </div>

          {/* Final Honest Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>
              यह रिपोर्ट प्रशासन के पास सत्यापन हेतु जाएगी। भौतिक जांच और पात्रता सत्यापन के पश्चात ही सहायता सुनिश्चित की जाएगी।
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Submission Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(3)}
              className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              सुधारें (Edit)
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-2/3 py-3.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-base shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{t('submitting')}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t('btnSubmitReport')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
