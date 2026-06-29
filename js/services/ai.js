SICP.ai = (function() {
  var SYSTEM_PROMPTS = {
    snii_audit: 'Eres un evaluador experto del SNII 2026 (SECIHTI). Analiza productos académicos y clasifícalos en C1, C2, C3.',
    snii_plan: 'Eres un asesor de carrera académica SECIHTI. Diseña planes estratégicos para fortalecer perfiles SNII.',
    snii_narrative: 'Eres un asesor de carrera académica SECIHTI. Ayudas a redactar narrativas para solicitudes SNII 2026.',
    snii_profile: 'Eres un consultor de carrera académica. Recomiendas perfiles de investigación SNII 2026.'
  };
  var api = SICP.api;

  function consultar(prompt, systemKey) {
    var apiKey = SICP.CONFIG.OPENAI_API_KEY;
    if (!apiKey) {
      SICP.toast.showToast('OPENAI_API_KEY no configurada en config.js', 'warning');
      return Promise.reject(new Error('No API key'));
    }
    var system = SYSTEM_PROMPTS[systemKey] || 'Eres un asistente académico experto.';
    return api.fetchWithRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        max_tokens: 1500
      })
    }).then(function(data) {
        if (data.error) throw new Error(data.error.message);
        return data.choices && data.choices[0] ? data.choices[0].message.content : 'Sin respuesta';
      });
  }

  return { consultar: consultar, SYSTEM_PROMPTS: SYSTEM_PROMPTS };
})();
