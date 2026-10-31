import OpenAI from "openai";

export const aiTools : OpenAI.Responses.Tool[] = [
    {
    type: "function",
    name: "get_employees",
    description:
      "Get employees belonging to the authenticated admin's organization. Use this when asked about employees or team size.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  }
] 