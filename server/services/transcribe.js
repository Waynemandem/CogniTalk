import OpenAI from "openai";
import { writeFileSync, unlinkSync, createReadStream } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(buffer) {
  const tmpPath = join(tmpdir(), `cognitalk_${Date.now()}.webm`);
  writeFileSync(tmpPath, buffer);

  try {
    const response = await openai.audio.transcriptions.create({
      file: createReadStream(tmpPath),
      model: "whisper-1",
    });
    return response.text;
  } finally {
    unlinkSync(tmpPath);
  }
}
