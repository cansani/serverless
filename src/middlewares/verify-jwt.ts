import { JwtPayload, verify } from "jsonwebtoken";
import { env } from "../env";

export function verifyJwt(token: string) {
    return verify(token, env.JWT_SECRET) as JwtPayload
}