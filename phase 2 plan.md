# Phase 2: Secure Custom Authentication (Edge-Compatible)

This phase implements a secure, local-first authentication system using JWTs. It is specifically designed to be compatible with the Next.js Edge Runtime (Middleware) by using the `jose` library instead of `jsonwebtoken`.

### 1. Install Security Dependencies

Run the following commands in the `clic-formation` directory to install libraries for password hashing and Edge-compatible JWT handling.

```bash
# Install hashing and JWT libraries
npm install bcryptjs jose

# Install type definitions for bcryptjs
npm install -D @types/bcryptjs
```

### 2. Update Environment Variables

Add a secure secret key for JWT signing to your `clic-formation/.env` file.

```env
# A long, random string for JWT encryption
JWT_SECRET=your_super_secret_random_string_here
```

### 3. Registration API Route

Create the registration route to handle new user creation with hashed passwords.

**File:** `app/api/auth/register/route.ts`

```typescript
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    await db.insert(users).values({
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### 4. Login API Route (with Secure Cookies)

Create the login route that verifies credentials and issues a JWT in a secure, HTTP-only cookie.

**File:** `app/api/auth/login/route.ts`

```typescript
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import * as jose from "jose";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !(await compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Prepare JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    const response = NextResponse.json({ message: "Login successful" });

    // Set HTTP-only secure cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### 5. Edge-Compatible Middleware

Create a `middleware.ts` file in the root directory to protect routes by verifying the JWT using `jose`.

**File:** `middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  // Define protected routes
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jose.jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      console.error("JWT verification failed:", error);
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

### 6. Milestone/Outcome
A secure, custom authentication layer that hashes passwords at rest and uses Edge-compatible JWTs to protect routes without introducing Node.js-specific dependency crashes in the Next.js middleware.
