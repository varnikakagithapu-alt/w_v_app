/*
 * Curated multilingual aliases for common ISL lookups.
 * Add approved terms here after validation with Deaf ISL users/interpreters.
 *
 * aliases is keyed by language (en/hi/te/kn/ta, matching the <select
 * id="languageSelect"> option values en-IN/hi-IN/te-IN/kn-IN/ta-IN minus the
 * region suffix) so a gloss's translation can be looked up directly for a
 * given language, not just substring-matched. Each key holds one or more
 * accepted variants for that language.
 *
 * driveVideoId: file ID of a specific matching video in a public dictionary
 * Drive folder (see docs/SIGN_SOURCES.md). Match each ID to the exact filename;
 * a filename match does not validate the sign with an ISL interpreter.
 * driveSource identifies the source collection when it needs distinct labeling.
 */
window.SIGN_LIBRARY = [
  { aliases: { en: ['hello', 'hi', 'namaste'], hi: ['नमस्ते'], te: ['హలో'], kn: ['ನಮಸ್ಕಾರ'], ta: ['வணக்கம்'] }, gloss: 'HELLO', category: 'Greeting', driveVideoId: '1q25_z8OFiFiWlSAKuESn4mw9Cytpxmr3' },
  { aliases: { en: ['thank you', 'thanks', 'thank'], hi: ['धन्यवाद'], te: ['ధన్యవాదాలు'], kn: ['ಧನ್ಯವಾದ'], ta: ['நன்றி'] }, gloss: 'THANK-YOU', category: 'Courtesy', driveVideoId: '1cZR2VpPZqc_DUKYBQAk2VBi_nkv9RcKG' },
  { aliases: { en: ['please'], hi: ['कृपया'], te: ['దయచేసి'], kn: ['ದಯವಿಟ್ಟು'], ta: ['தயவுசெய்து'] }, gloss: 'PLEASE', category: 'Courtesy', driveVideoId: '12PBqhCNHBw2uG8UArKmyoMeNFGjor3mH' },
  { aliases: { en: ['help'], hi: ['मदद'], te: ['సహాయం'], kn: ['ಸಹಾಯ'], ta: ['உதவி'] }, gloss: 'HELP', category: 'Everyday communication', driveVideoId: '1gOcGWvH7K9KADpVCQL27auAbzFl3OrG8' },
  { aliases: { en: ['wait'], hi: ['रुको', 'रुकिए'], te: ['వేచి ఉండండి'], kn: ['ನಿರೀಕ್ಷಿಸಿ'], ta: ['காத்திருங்கள்'] }, gloss: 'WAIT', category: 'Everyday communication', driveVideoId: '1qqlZY5T1veySKq7r2P6biwplUyg_iPJx' },
  { aliases: { en: ['yes'], hi: ['हाँ', 'हां'], te: ['అవును'], kn: ['ಹೌದು'], ta: ['ஆம்'] }, gloss: 'YES', category: 'Response', driveVideoId: '1ToFfcA-AgdD_oqMiehMzCqBVJaByymfh' },
  { aliases: { en: ['no'], hi: ['नहीं'], te: ['లేదు'], kn: ['ಇಲ್ಲ'], ta: ['இல்லை'] }, gloss: 'NO', category: 'Response', driveVideoId: '1agT05yoJYmPO1i1X4pH_5Xc8rJUBK4mR' },
  { aliases: { en: ['sorry'], hi: ['माफ़', 'माफ'], te: ['క్షమించండి'], kn: ['ಕ್ಷಮಿಸಿ'], ta: ['மன்னிக்கவும்'] }, gloss: 'SORRY', category: 'Courtesy', driveVideoId: '11Rg-S5AWw_6tiFSW-vysz8D-uVJBiSkM' },
  { aliases: { en: ['name'], hi: ['नाम'], te: ['పేరు'], kn: ['ಹೆಸರು'], ta: ['பெயர்'] }, gloss: 'NAME', category: 'People and relations', driveVideoId: '1A3IyV8n35GhQVGO04vOesYpKUEwHV24C' },
  { aliases: { en: ['water'], hi: ['पानी'], te: ['నీరు'], kn: ['ನೀರು'], ta: ['தண்ணீர்'] }, gloss: 'WATER', category: 'Food and drink', driveVideoId: '1TXFmAS2vWOZNcWepZ6CcaEXtslDWc_El' },
  { aliases: { en: ['food'], hi: ['खाना', 'भोजन'], te: ['ఆహారం'], kn: ['ಆಹಾರ'], ta: ['உணவு'] }, gloss: 'FOOD', category: 'Food and drink', driveVideoId: '1w9fTPt3KklYVD9U0Xjk1yJ5-zPxB-w4j' },
  { aliases: { en: ['doctor'], hi: ['डॉक्टर'], te: ['వైద్యుడు'], kn: ['ಡಾಕ್ಟರ್'], ta: ['மருத்துவர்'] }, gloss: 'DOCTOR', category: 'Medical', driveVideoId: '1vv8ufp1Egd_YymtXKaRsJp8lV_31K6c1' },
  { aliases: { en: ['accommodation'], hi: ['आवास'], te: ['వసతి'], kn: ['ವಸತಿ'], ta: ['தங்குமிடம்'] }, gloss: 'ACCOMMODATION', category: 'Everyday communication', driveVideoId: '1GqkD5PGX7scEax6DjMlIJ9gS9uvjKt-9', driveSource: 'islrtc' },
  { aliases: { en: ['agent'], hi: ['एजेंट'], te: ['ఏజెంట్'], kn: ['ಏಜೆಂಟ್'], ta: ['முகவர்'] }, gloss: 'AGENT', category: 'People and relations', driveVideoId: '10S-AELxDuBE8Yi0dw9V7HD6sRujgwTeC', driveSource: 'islrtc' },
  { aliases: { en: ['banyan'], hi: ['बरगद'], te: ['మర్రి చెట్టు'], kn: ['ಆಲದ ಮರ'], ta: ['ஆலமரம்'] }, gloss: 'BANYAN', category: 'Nature', driveVideoId: '12L_XhudKNAe1WaJoGx4V5yKYj2WvV-hf', driveSource: 'islrtc' },
  { aliases: { en: ['child'], hi: ['बच्चा', 'बच्ची'], te: ['పిల్లవాడు', 'పిల్ల'], kn: ['ಮಗು'], ta: ['குழந்தை'] }, gloss: 'CHILD', category: 'People and relations', driveVideoId: '1jQAVkIz4qGy1mTJSq_wiXKyL4J_QZUI6', driveSource: 'islrtc' },
  { aliases: { en: ['clerk'], hi: ['लिपिक'], te: ['గుమాస్తా'], kn: ['ಗುಮಾಸ್ತ'], ta: ['எழுத்தர்'] }, gloss: 'CLERK', category: 'Work and education', driveVideoId: '1qw61wIhxV9boTFSsTSoznwC6qIDDc25O', driveSource: 'islrtc' },
  { aliases: { en: ['consumer'], hi: ['उपभोक्ता'], te: ['వినియోగదారుడు'], kn: ['ಗ್ರಾಹಕ'], ta: ['நுகர்வோர்'] }, gloss: 'CONSUMER', category: 'Everyday communication', driveVideoId: '1VflFyqHVhXJfnsvEFuoq3nf9ngzmNR19', driveSource: 'islrtc' },
  { aliases: { en: ['court'], hi: ['अदालत', 'न्यायालय'], te: ['న్యాయస్థానం'], kn: ['ನ್ಯಾಯಾಲಯ'], ta: ['நீதிமன்றம்'] }, gloss: 'COURT', category: 'Law and government', driveVideoId: '1FxZj6emSHjk3jhQyUjhG2VaxhF6oc32F', driveSource: 'islrtc' },
  { aliases: { en: ['family'] }, gloss: 'FAMILY', category: 'People and relations', driveVideoId: '1Sqzzm0srC_RpT1PgdhE4nUKzSX1ZtAky', driveSource: 'islrtc' },
  { aliases: { en: ['holiday'] }, gloss: 'HOLIDAY', category: 'Everyday communication', driveVideoId: '1eSBpDnQ5VZitn134jS5TF-JUsJZM4it_', driveSource: 'islrtc' },
  { aliases: { en: ['honest'] }, gloss: 'HONEST', category: 'People and relations', driveVideoId: '1Kuw0kDmONBIFA_c7GKRAoPvWxD2qtA7L', driveSource: 'islrtc' },
  { aliases: { en: ['horse'] }, gloss: 'HORSE', category: 'Animals', driveVideoId: '1wcgKUayEBcaWUYysmuHs82oN-BTmNfxE', driveSource: 'islrtc' },
  { aliases: { en: ['hospital'] }, gloss: 'HOSPITAL', category: 'Medical', driveVideoId: '1lzZ6ZxgpZs2ASRXR0otkK5AKG14dVqkL', driveSource: 'islrtc' },
  { aliases: { en: ["i don't understand"] }, gloss: "I DON'T UNDERSTAND", category: 'Everyday communication', driveVideoId: '1EncwoA4Amj1qL1BokkEh4ReTc4UYbGQn', driveSource: 'islrtc' },
  { aliases: { en: ['i know'] }, gloss: 'I KNOW', category: 'Everyday communication', driveVideoId: '1BnCmUS5lI-2eZqLR9Tr0J5k-bAmyeeyj', driveSource: 'islrtc' }
];
