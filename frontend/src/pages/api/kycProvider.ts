// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SignedAgeData } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { Field, Signature } from "o1js";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignedAgeData>
) {
  let sig =
    "7mXJiJsHzGHPFvJGF9hZpqc2qigR4GjFLJe6j56cwjwcT5LCKFPKQAzKNJs2g5JRHafqvWRPLuYDHJZhppuk9rYXnYipgocC";
  let data: SignedAgeData = {
    id: 1,
    age: 78,
    sig,
  };
  res.status(200).json(data);
}
