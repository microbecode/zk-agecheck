// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SignedAgeData } from "@/types";
import { error } from "console";
import type { NextApiRequest, NextApiResponse } from "next";
import { Field, PrivateKey, Signature } from "o1js";
import { NextRequest, NextResponse } from "next/server";
import formidable, { IncomingForm, File } from "formidable";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    id: number;
  };
}

//export const FormidableError = formidable.errors.FormidableError;

export const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise(async (resolve, reject) => {
    resolve({
      files: {},
      fields: {},
    });
  });
};

/* export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  console.log("FILEEEEEE", files);
} */

const handler = async (
  req: ExtendedNextApiRequest,
  res: NextApiResponse<SignedAgeData>
) => {
  try {
    const { fields, files } = await parseForm(req);

    console.log("DATAAAA", { fields, files });

    /* res.status(200).json({
      data: {
        url: "/uploaded-file-url",
      },
      error: null,
    }); */
  } catch (e) {
    console.error(e);
  }

  const oracle_key = process.env.ORACLE_PRIVATE_KEY;

  if (!oracle_key) {
    console.error("No oracle key set");
    throw error("No oracle key set");
  }

  //console.log("got req", req);

  const idStr = 1; //req.body.id;
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
};

export default handler;
