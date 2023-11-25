// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SignedAgeData } from "@/types";
import { error } from "console";
import type { NextApiRequest, NextApiResponse } from "next";
import { Field, PrivateKey, Signature } from "o1js";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    id: number;
  };
}

export default function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<SignedAgeData>
) {
  const oracle_key = process.env.ORACLE_PRIVATE_KEY;

  if (!oracle_key) {
    console.error("No oracle key set");
    throw error("No oracle key set");
  }

  console.log("got req", req);

  const idStr = req.body.id;
  const ageNum = 78; // FIXME: should probably get the data from somewhere

  const id = Field(idStr);
  const age = Field(ageNum);

  const fields = [id, age];

  const signature = Signature.create(PrivateKey.fromBase58(oracle_key), fields);

  console.log("got sig", signature.toBase58());

  /* let sig =
    "7mXJiJsHzGHPFvJGF9hZpqc2qigR4GjFLJe6j56cwjwcT5LCKFPKQAzKNJs2g5JRHafqvWRPLuYDHJZhppuk9rYXnYipgocC"; */
  let data: SignedAgeData = {
    id: idStr,
    age: ageNum,
    sig: signature.toBase58(),
  };
  res.status(200).json(data);
}
