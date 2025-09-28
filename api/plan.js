export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();

    if (process.env.TESTER_KEY && req.headers["x-tester-key"] !== process.env.TESTER_KEY) {
      return res.status(401).json({ ok:false, error:"Unauthorized" });
    }

    const { day, anchors, goals, prefs } = req.body || {};
    const prompt = buildPrompt({ day, anchors, goals, prefs });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const plan = JSON.parse(text);

    if (!plan || !Array.isArray(plan.events)) {
      return res.status(400).json({ ok:false, error:"Invalid plan format" });
    }
    res.json({ ok:true, plan });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e) });
  }
}

function buildPrompt({ day, anchors, goals, prefs }) {
  return `Du bist ein Planungs-Agent. Erzeuge ein JSON für ${day}.
Regeln (streng befolgen):
- Keine Events überlappen Gebete (Fajr, Dhuhr, Asr, Maghrib, Isha) oder Arbeit.
- Schlaf: 1 Block, falls möglich (>=80% des Ziels), sonst 2 Blöcke (>=90 Min je Block).
- Business: Dhuhr→Asr und Asr→Maghrib; Rest nach Isha.
- Sport: bevorzugt Asr→Maghrib, sonst nach Isha.
- Essen: Mittag Dhuhr→Asr (30m), Abend Maghrib→Isha (30m).
- 5-Min-Raster, keine Slots unter Mindestdauer (Schlaf 90, Biz 30, Sport 35, Essen 25).
- Antworte NUR als JSON:
{"day":"YYYY-MM-DD","events":[{"start":"HH:MM","end":"HH:MM","type":"sleep|biz|sport|meal|commute|work|nap","label":"...","note":""}]}

Anchors: ${JSON.stringify(anchors)}
Ziele: ${JSON.stringify(goals)}
Präferenzen: ${JSON.stringify(prefs)}
`;
}
