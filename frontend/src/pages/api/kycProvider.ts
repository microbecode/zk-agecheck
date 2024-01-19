// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { SignedAgeData } from "@/types";
import { error } from "console";
import type { NextApiRequest, NextApiResponse } from "next";
import { Field, PrivateKey, Signature } from "o1js";
import * as formidable from "formidable";
import fs from "fs";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    id: number;
  };
}

// Skips automatic body parsing. Required for formidable.
export const config = { api: { bodyParser: false } };

export const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; fileContents: Buffer }> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        reject(err);
        return;
      }

      // Access the file details from the 'files' object
      const file = (files as any).src[0]; // Assuming 'src' is the field name for your file input

      // Read the file contents from the temporary filepath
      try {
        const fileContents = await readFileContents(file.filepath);
        resolve({ fields, fileContents });
      } catch (e) {
        console.error("Error reading file contents:", e);
        reject(e);
      }
    });
  });
};

const readFileContents = (filePath: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];

    const readStream = fs.createReadStream(filePath);

    readStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    readStream.on("end", () => {
      const fileContents = Buffer.concat(chunks);
      resolve(fileContents);
    });

    readStream.on("error", (error) => {
      reject(error);
    });
  });
};

const handler = async (
  req: ExtendedNextApiRequest,
  res: NextApiResponse<SignedAgeData>
) => {
  let kycAge: number = 0;
  try {
    const { fileContents } = await parseForm(req);
    kycAge = +fileContents.toString("utf8");
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
