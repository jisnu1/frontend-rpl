import apiClient from './apiClient';

// Basis pengetahuan lokal untuk asisten AI jika backend tidak aktif
const LOCAL_KNOWLEDGE_BASE = [
  {
    keywords: ["apac", "emea", "budget", "priorit", "prioritas"],
    response: "According to page 1 of the report, the **APAC expansion is prioritized over EMEA for Q4 budget allocations** due to recent tariff shifts and higher SEA regional margins. 24% of the operational growth budget has been redirected from Europe to East Asia."
  },
  {
    keywords: ["vietnam", "logistics", "supply chain", "facility", "consolidation", "tariff", "tarip"],
    response: "To mitigate the **4% maritime tariff cost increases**, procurement has established a new logistics consolidation facility in **Vietnam**. The transition timeline targets full operations by Q4. Delays pose an operational cost exposure of **$45,000 per week**."
  },
  {
    keywords: ["singapore", "partner", "marketing", "digital", "singapura"],
    response: "For **Singapore**, we are expanding local corporate partnerships as enterprise sales anchors. Local launch marketing spend will shift 100% to digital media channels next month to ensure maximum exposure for the ecosystem launch."
  },
  {
    keywords: ["q3", "metric", "result", "revenue", "revenue increase"],
    response: "The Q3 pivot is projecting a **15% net revenue increase** once APAC pipelines stabilize. The core metrics indicate our net margin target remains robust at **38%** if supply-chain consolidation concludes on-time."
  },
  {
    keywords: ["email", "draft", "logistics team", "briefing"],
    response: "Here is a professional email draft for the Logistics Team:\n\n**Subject:** Urgent Briefing: Vietnam Consolidation Transition & Tariff Mitigation\n\n*Dear Logistics & Supply Chain Teams,*\n\n*As finalized in our Q3 Global Strategy Report, please ensure all operational consolidation workflows for the new Vietnam facility are ready for full Q4 activation. As a reminder, any delays beyond the transition timeline expose us to tariffs costing $45k/week. Let's schedule an alignment stand-up tomorrow morning.*\n\n*Best regards,\nJessica*"
  },
  {
    keywords: ["schedule", "review", "budget review", "calendar"],
    response: "I've drafted a Calendar Invitation for your team:\n\n**Title:** Q3 Pivot - Q4 Budget Allocation Review\n**Duration:** 45 minutes (Recommended: Tomorrow, 2:00 PM SGT)\n**Agenda:** Reviewing the 24% growth budget redirection from EMEA to APAC (specifically Singapore partner marketing and Vietnam supply chain logistics operations)."
  }
];

/**
 * Mengirim pesan tanya jawab ke endpoint AI Spring Boot (/api/ai/summary)
 */
export async function fetchAiSummary(question) {
  try {
    const response = await apiClient.post('/ai/summary', { teks: question });
    return response.data.response;
  } catch (error) {
    console.warn('Gagal memanggil API Tanya Jawab AI, beralih ke simulasi lokal:', error.message);
    
    // Simulasi respons berbasis kata kunci lokal yang 100% sama dengan desain awal
    const qLower = question.toLowerCase();
    for (const item of LOCAL_KNOWLEDGE_BASE) {
      if (item.keywords.some(kw => qLower.includes(kw))) {
        return item.response;
      }
    }
    return `I analyzed your question regarding: *"${question}"*. According to the Q3 Strategy PDF, our central focus is redirecting 24% of EMEA budgets directly to SEA markets (mainly Singapore and Vietnam nodes) to offset tariff charges and push APAC growth to 15%. Let me know if you need specific numbers on this!`;
  }
}

/**
 * Mengambil ringkasan dokumen PDF dari endpoint Spring Boot (/api/ai/summary/pdf/{fileId})
 */
export async function fetchPdfSummary(fileId) {
  try {
    const response = await apiClient.post(`/ai/summary/pdf/${fileId}`);
    return response.data.response;
  } catch (error) {
    console.warn('Gagal memanggil API Ringkasan PDF, mengembalikan ringkasan fallback:', error.message);
    return "This report outlines the Q3 pivot towards emerging APAC markets, projecting a 15% revenue increase. Key focus areas include expanding local partnerships in Singapore and restructuring the supply chain logistics out of Vietnam to mitigate upcoming tariff changes.";
  }
}
