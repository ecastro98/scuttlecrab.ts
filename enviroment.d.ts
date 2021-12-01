declare global {
  namespace NodeJS {
    interface ProcessEnv {
      token: string;
      prefix: string;
      guildId: string;
    }
  }
}

export {};
