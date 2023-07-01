import Passage from "@passageidentity/passage-node";

export const passage = new Passage({
  appID: "vZBRPwrrCa32l5KaYhSyUTzn",
  authStrategy: "COOKIE",
  apiKey: process.env.PASSAGE_API_KEY,
});
