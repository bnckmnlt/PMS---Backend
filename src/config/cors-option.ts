import { allowedOrigins } from "./allowed-origins";

export const corsOption = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};
