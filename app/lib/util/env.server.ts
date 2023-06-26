export type EnvVariables = "REDIS_URL" | "PASSAGE_API_KEY";
export const env = (name: EnvVariables) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }

  return value;
};
