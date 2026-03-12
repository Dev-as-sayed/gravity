import { NextResponse } from "next/server";

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

interface ResponsePayload<T> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: Meta;
  status?: number;
}

export function sendResponse<T>({
  success = true,
  message = "Success",
  data,
  meta,
  status = 200,
}: ResponsePayload<T>) {
  return NextResponse.json(
    {
      success,
      message,
      data,
      meta,
    },
    { status },
  );
}
