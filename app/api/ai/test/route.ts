import { NextResponse } from "next/server"
import { generateAIResponse } from "@/services/aiServices"

export async function GET() {

  const result = await generateAIResponse(
    "Give a short tip about introducing foods to babies."
  )

  return NextResponse.json({
    result
  })
}