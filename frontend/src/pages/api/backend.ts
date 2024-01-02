// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SignedAgeData } from "@/types";
import { error } from "console";
import type { NextApiRequest, NextApiResponse } from "next";
import { Field, PrivateKey, Signature } from "o1js";
import * as formidable from "formidable";
import { join } from "path";
import * as dateFn from "date-fns";
import fs from "fs/promises";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    id: number;
    proof: string;
  };
}

// Skips automatic body parsing. Required for formidable.
export const config = { api: { bodyParser: false } };

const handler = async (
  req: ExtendedNextApiRequest,
  res: NextApiResponse<boolean>
) => {
  res.status(200).json(true);
};

export default handler;
