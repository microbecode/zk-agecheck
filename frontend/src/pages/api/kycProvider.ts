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
  };
}

export const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/uploads/${dateFn.format(Date.now(), "dd-MM-Y")}`
    );

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        reject(err);
        return;
      }

      try {
        await fs.stat(uploadDir);
      } catch (e: any) {
        if (e.code === "ENOENT") {
          await fs.mkdir(uploadDir, { recursive: true });
        } else {
          console.error(e);
          reject(e);
          return;
        }
      }

      resolve({ fields, files });
    });
  });
};

export const config = { api: { bodyParser: false } };

const handler = async (
  req: ExtendedNextApiRequest,
  res: NextApiResponse<SignedAgeData>
) => {
  let kycAge: number = 0;
  try {
    // console.log("got req", req);
    const { fields, files } = await parseForm(req);

    const fileKey = Object.keys(files)[0];
    const fileArray = files[fileKey] as formidable.File[];
    if (fileArray && fileArray.length > 0 && fileArray[0].filepath) {
      const fileContents = await fs.readFile(fileArray[0].filepath, "utf-8");
      console.log("Found age", fileContents);
      kycAge = +fileContents;
    }

    //console.log("DATAAAA", files);
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
  const ageNum = kycAge;

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
