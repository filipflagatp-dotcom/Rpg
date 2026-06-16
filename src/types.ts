export interface Character {
  id: string;
  name: string;
  description: string;
}

export interface Scenario {
  id: string;
  title: string;
  content: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
