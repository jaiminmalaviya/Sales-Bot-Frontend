import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET: string = process.env.JWT_SECRET || "";
const EXPIRATION_DAYS: number = 1;

async function encrypt(payload: JWTPayload): Promise<string | undefined> {
  try {
    const key = new TextEncoder().encode(JWT_SECRET);
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${EXPIRATION_DAYS} day`)
      .sign(key);
  } catch (error) {
    console.error("Encryption error:", error);
    return undefined;
  }
}

async function decrypt(input: string): Promise<JWTPayload | undefined> {
  try {
    const key = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Decryption error:", error);
    return undefined;
  }
}

export const updateSession = async (request: NextRequest) => {
  const storedToken = request.cookies.get("authToken")?.value;
  if (!storedToken) return undefined;

  try {
    const parsed = await decrypt(storedToken);
    if (!parsed) return undefined;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + EXPIRATION_DAYS);
    const expiryTime = expiryDate.getTime();
    parsed.exp = expiryTime;

    const res = NextResponse.next();
    res.cookies.set({
      name: "authToken",
      value: (await encrypt(parsed)) || "",
      expires: expiryTime,
    });

    const cookieKeys = ["userId", "userName", "userEmail", "userRole", "isGmailConnected"];
    cookieKeys.forEach((key) => {
      const storedValue = request.cookies.get(key)?.value ?? "";
      res.cookies.set({
        name: key,
        value: storedValue,
        expires: expiryTime,
      });
    });

    return res;
  } catch (error) {
    console.error("Session update error:", error);
    return undefined;
  }
};
