import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Schema for transaction parsing
const transactionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    amount: {
      type: Type.INTEGER,
      description: "Nominal transaksi dalam angka. Misalnya 50000",
    },
    categoryName: {
      type: Type.STRING,
      description: "Nama kategori yang paling cocok (Makan & Minum, Transportasi, Belanja, Hiburan, Tagihan & Utilitas, Kesehatan, Pendidikan, Rumah Tangga, Fashion, Langganan Digital, Lainnya)",
    },
    merchant: {
      type: Type.STRING,
      description: "Nama tempat/toko jika disebutkan. Kosongkan jika tidak ada.",
    },
    date: {
      type: Type.STRING,
      description: "Tanggal dalam format YYYY-MM-DD. Jika 'kemarin' gunakan tanggal kemarin. Jika tidak disebutkan, gunakan tanggal hari ini.",
    },
    description: {
      type: Type.STRING,
      description: "Keterangan singkat tentang apa yang dibeli",
    }
  },
  required: ["amount", "categoryName", "date"],
};

export async function parseTransactionText(text: string, currentDateStr: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Ekstrak informasi transaksi dari teks ini: "${text}". Hari ini adalah tanggal ${currentDateStr}.` }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: transactionSchema,
        temperature: 0.1,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("AI Parse Error:", error);
    return null;
  }
}

export async function generateWeeklyReview(historyText: string, persona: string) {
  let systemPrompt = "";
  if (persona === "ROAST") {
    systemPrompt = "Kamu adalah asisten keuangan yang galak, sarkas, tapi peduli. Kamu suka me-roasting pengguna jika pengeluaran mereka boros atau overbudget. Beri komentar pedas tapi membangun. Gunakan bahasa gaul Indonesia (kamu/aku/lo/gue).";
  } else if (persona === "SUPPORT") {
    systemPrompt = "Kamu adalah asisten keuangan yang suportif, sabar, dan selalu menyemangati. Fokus pada pencapaian positif, seberapapun kecilnya, dan beri saran lembut jika ada overbudget. Gunakan emoji yang ramah.";
  } else {
    systemPrompt = "Kamu adalah asisten keuangan profesional dan analitis. Berikan wawasan berdasarkan data, tren pengeluaran, dan rekomendasi logis yang to the point tanpa basa-basi berlebihan.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Sistem Prompt: ${systemPrompt}\n\nBerikut adalah data transaksi minggu ini beserta kondisi budget pengguna:\n${historyText}\n\nBuatlah Weekly Review singkat (maksimal 3 paragraf pendek) untuk pengguna.` }
          ]
        }
      ],
      config: {
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return null;
  }
}
