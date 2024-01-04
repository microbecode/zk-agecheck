// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SignedAgeData } from "@/types";
import { error } from "console";
import type { NextApiRequest, NextApiResponse } from "next";
import { Field, JsonProof, PrivateKey, Signature, verify } from "o1js";
import * as formidable from "formidable";
import { join } from "path";
import * as dateFn from "date-fns";
import fs from "fs/promises";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    id: number;
    proof: JsonProof;
    verificationKey: string;
  };
}

// Skips automatic body parsing. Required for formidable.
export const config = { api: { bodyParser: false } };

const handler = async (
  req: ExtendedNextApiRequest,
  res: NextApiResponse<boolean>
) => {
  const isValid = await verify(req.body.proof, req.body.verificationKey);
  res.status(200).json(isValid);
};

export default handler;
