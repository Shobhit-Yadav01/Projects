export interface ConversationTurn {
  role: 'user' | 'assistant' | 'model';
  text: string;
  timestamp: number;
}

class SessionMemoryManager {
  private sessions: Map<string, ConversationTurn[]> = new Map();
  private readonly MAX_TURNS = 12; // Keep recent turns for concise, relevant context

  public getHistory(conversationId: string): ConversationTurn[] {
    return this.sessions.get(conversationId) || [];
  }

  public addTurn(conversationId: string, role: 'user' | 'assistant', text: string): void {
    if (!this.sessions.has(conversationId)) {
      this.sessions.set(conversationId, []);
    }
    const history = this.sessions.get(conversationId)!;
    history.push({
      role,
      text,
      timestamp: Date.now(),
    });

    if (history.length > this.MAX_TURNS) {
      this.sessions.set(conversationId, history.slice(history.length - this.MAX_TURNS));
    }
  }

  public clearSession(conversationId: string): void {
    this.sessions.delete(conversationId);
  }
}

export const sessionMemory = new SessionMemoryManager();
