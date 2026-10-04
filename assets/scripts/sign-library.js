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
 * driveVideoId: file ID of a specific matching video in the community-shared
 * ISL Dictionary Drive folder (see docs/SIGN_SOURCES.md). Verified by name
 * match against the folder listing, not by an ISL interpreter — treat as
 * unverified/community-sourced, same as the fingerspelling dataset.
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
  { aliases: { en: ['doctor'], hi: ['डॉक्टर'], te: ['వైద్యుడు'], kn: ['ಡಾಕ್ಟರ್'], ta: ['மருத்துவர்'] }, gloss: 'DOCTOR', category: 'Medical', driveVideoId: '1vv8ufp1Egd_YymtXKaRsJp8lV_31K6c1' }
];
