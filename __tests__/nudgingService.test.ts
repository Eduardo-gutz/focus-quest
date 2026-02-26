import { getNudgingMessage } from "@/services/nudgingMessages";

describe("nudgingService", () => {
  describe("getNudgingMessage", () => {
    it('alerta 80%: "Te quedan X min en [App]"', () => {
      const msg = getNudgingMessage("Instagram", "80", 24, 30);
      expect(msg).toBe("Te quedan 6 min en Instagram");
    });

    it("alerta 80% con 0 min restantes", () => {
      const msg = getNudgingMessage("TikTok", "80", 30, 30);
      expect(msg).toBe("Te quedan 0 min en TikTok");
    });

    it('alerta 100%: "Superaste tu meta en [App]"', () => {
      const msg = getNudgingMessage("YouTube", "100", 35, 30);
      expect(msg).toBe("Superaste tu meta en YouTube");
    });

    it('alerta 150%: "Llevas X min en [App]. Tu racha está en riesgo"', () => {
      const msg = getNudgingMessage("Twitter", "150", 50, 30);
      expect(msg).toBe("Llevas 50 min en Twitter. Tu racha está en riesgo");
    });
  });
});
