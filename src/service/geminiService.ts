export class GeminiService {
  async analyzeFile(
    fileName: string,
    type: string
  ): Promise<{ description: string; tags: string[] }> {
    return { description: "", tags: [] };
  }

  async smartSearch(query: string, items: Array<{ name: string; type: string }>): Promise<string[]> {
    return items
      .filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
      .map((i) => i.name);
  }
}

export const geminiService = new GeminiService();
