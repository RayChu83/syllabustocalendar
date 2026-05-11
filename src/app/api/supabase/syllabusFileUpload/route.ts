import { NextResponse } from "next/server";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { serverClient } from "@/lib/supabase/server";
import { isAllowedFileType, MAX_FILE_SIZE } from "@/constants/schemas";

const uploadRequestSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  size: z.number(),
});

export async function POST(request: Request) {
  const supabase = await serverClient();
  try {
    const body = await request.json();
    const bodyParsed = uploadRequestSchema.safeParse(body);

    if (!bodyParsed.success) {
      return NextResponse.json(
        { error: "Request body was invalid" },
        { status: 400 },
      );
    }

    const { contentType, fileName, size } = bodyParsed.data;

    if (size > MAX_FILE_SIZE) {
      // file size > 5MB
      return NextResponse.json(
        { error: "File size was too large" },
        { status: 400 },
      );
    }
    if (!isAllowedFileType(contentType)) {
      // File type validation on MME types
      return NextResponse.json(
        { error: "File type is not supported" },
        { status: 400 },
      );
    }

    // Unique upload path on bucket
    const filePath = `${uuidv4()}-${fileName}`;

    // create a presigned url (3 mins only) to send to Client to upload images
    // Why? NextJS allows only 4.5MB of files to be within a Request Body
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .createSignedUploadUrl(filePath);

    // If error throw error
    if (error) {
      console.log(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return url with file path
    return NextResponse.json(
      { url: data.signedUrl, filePath },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// zod file name validation with reg ex
const fileNameSchema = z
  .string()
  .regex(/^[a-f0-9-]{36}-[a-zA-Z0-9._-]+$/, "Invalid file key format");

export async function DELETE(request: Request) {
  const supabase = await serverClient();
  try {
    // deconstruct body to get fileName and parse with Zod
    const { fileName } = await request.json();
    const parseFileName = fileNameSchema.safeParse(fileName);

    if (!parseFileName.success) {
      // if failed parsed, return error code 400, body invalid
      return NextResponse.json(
        { error: "Request body was invalid" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .remove([fileName]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ fileName: data[0].name }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
