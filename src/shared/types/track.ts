export type Track = {
  id: string;
  links: {
    local: string;
    suno: string;
  };
  names: {
    safe: string;
    serbian: string;
    russian: string;
    original: string;
  };
  hints: string[];
  difficulty: number;
  dates: {
    added: string;
  };
};
