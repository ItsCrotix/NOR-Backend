import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import OTPAuth from "otpauth";
import QRCode from "qrcode";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import pool from "../db";
import {
  checkPasswordComplexity,
  createAccessToken,
  createRefreshToken,
  getUserByEmail,
  verifyRefreshToken,
  generateBase32Secret,
} from "../lib/utils";
import { User } from "../lib/types";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Both email and password are required" });
  }

  if (!checkPasswordComplexity(password)) {
    return res.status(400).json({
      message: "Password should have all of the following",
      requirements: {
        length: "8 characters",
        uppercase: "1 uppercase letter",
        lowercase: "1 lowercase letter",
        number: "1 number",
        special: "1 special character",
      },
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = {
      user_id: uuid(),
      email,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await pool.query(
      "INSERT INTO users (user_id, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        newUser.user_id,
        newUser.email,
        newUser.password,
        newUser.created_at,
        newUser.updated_at,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    const user = result.rows[0];
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
      })
      .header("Authorization", `Bearer ${accessToken}`);
    res.status(201).json({
      message: "User created",
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, token } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await getUserByEmail(email);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if two-factor authentication is enabled and token is not provided
    if (user.tfa_enabled && !token) {
      return res
        .status(401)
        .json({ message: "Two-factor authentication required" });
    }

    // Checks if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    // If password is incorrect, return 401
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // If a token is provided, verify two-factor authentication
    if (user.tfa_enabled && token && token.length === 6) {
      const isValid = await verifyTwoFactorAuth(user, token);
      if (!isValid) {
        return res.status(404).json({
          message: "Invalid two-factor authentication token",
        });
      }
    }

    if (user.tfa_enabled && token && token.length === 8) {
      const isValid = await checkBackupCode(user.user_id, token);
      if (!isValid) {
        return res.status(404).json({
          message: "Invalid backup code",
        });
      }
    }

    // Create access token and refresh token
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Set refresh token as a cookie and return access token in Authorization header
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
      })
      .header("Authorization", `Bearer ${accessToken}`)
      .status(201)
      .json({
        message: "User logged in successfully",
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
          tfa: user.tfa_enabled,
        },
      });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const enableTwoFactorAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const isValidToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    if (!isValidToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id, tfa, email } = isValidToken;

    if (tfa) {
      return res.status(400).json({
        message: "Two-factor authentication is already enabled",
      });
    }

    const tfaDetails = {
      tfa_enabled: true,
      tfa_secret: generateBase32Secret(),
    };

    const totp = new OTPAuth.TOTP({
      issuer: "Netherlands Online Racing",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      secret: tfaDetails.tfa_secret,
    });

    const otpauth_url = totp.toString();
    try {
      const url = await QRCode.toDataURL(otpauth_url);
      const backupCodes = await generateBackupCodes();
      try {
        const data = await pool.query(
          "UPDATE users SET tfa_enabled = $1, tfa_secret = $2 WHERE user_id = $3 RETURNING users.user_id, users.email, users.role, users.tfa_enabled",
          [tfaDetails.tfa_enabled, tfaDetails.tfa_secret, id]
        );

        await pool.query(
          "INSERT INTO tfa_backup_codes (user_id, code) VALUES ($1, $2), ($1, $3), ($1, $4), ($1, $5), ($1, $6), ($1, $7), ($1, $8), ($1, $9)",
          [id, ...backupCodes]
        );

        const newAccessToken = createAccessToken(data.rows[0]);

        return res.header("Authorization", `Bearer ${newAccessToken}`).json({
          status: "success",
          data: {
            qrCodeUrl: url,
            secret: tfaDetails.tfa_secret,
            backupCodes,
          },
        });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Internal server error", error: err });
      }
    } catch (err) {
      return res.status(500).json({
        status: "failed",
        message: "Failed to generate QR code",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err,
    });
  }
};

export const disableTwoFactorAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const tfa_token = req.body.token;

  const jwtResponse = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

  if (!jwtResponse) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!tfa_token) {
    return res.status(400).json({
      message: "Two-factor authentication token is required for this operation",
    });
  }

  const { id, email } = jwtResponse;

  const user = await getUserByEmail(email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.tfa_enabled) {
    return res.status(400).json({
      message: "Two-factor authentication is not enabled",
    });
  }

  if (tfa_token.length !== 6 && tfa_token.length !== 8) {
    return res.status(400).json({
      message: "Invalid two-factor authentication token",
    });
  }

  let isValid = false;

  if (tfa_token.length === 6) {
    isValid = await verifyTwoFactorAuth(user, tfa_token);
  } else {
    isValid = await checkBackupCode(user.user_id, tfa_token);
  }

  if (!isValid) {
    return res.status(401).json({
      message: "Invalid two-factor authentication token",
    });
  }

  try {
    await pool.query(
      "UPDATE users SET tfa_enabled = $1, tfa_secret = $2 WHERE user_id = $3",
      [false, null, id]
    );

    await pool.query("DELETE FROM tfa_backup_codes WHERE user_id = $1", [id]);

    const updatedUser = {
      user_id: id,
      email,
      role: user.role,
      tfa_enabled: false,
      tfa_secret: null,
    };

    const newAccessToken = createAccessToken(updatedUser);

    res
      .header("Authorization", `Bearer ${newAccessToken}`)
      .status(200)
      .json({ message: "Two-factor authentication disabled" });
  } catch (err) {
    throw new Error(err);
  }
};

export const refreshUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await getUserByEmail(decoded.email);

    const accessToken = createAccessToken(user);

    res.header("Authorization", `Bearer ${accessToken}`);
    return res.status(201).json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const verifyTwoFactorAuth = async (user: User, token: string) => {
  const totp = new OTPAuth.TOTP({
    issuer: "Netherlands Online Racing",
    label: user.email,
    algorithm: "SHA1",
    digits: 6,
    secret: user.tfa_secret,
  });

  const tokenIsValid = totp.validate({ token, window: 0 }) !== null;

  return tokenIsValid;
};

const generateBackupCodes = async () => {
  const backupCodes = [];

  for (let i = 0; i < 8; i++) {
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    backupCodes.push(code);
  }

  return backupCodes;
};

const checkBackupCode = async (id: string, code: string) => {
  try {
    const backupCode = await pool.query(
      "SELECT * FROM tfa_backup_codes WHERE user_id = $1 AND code = $2",
      [id, code]
    );

    if (backupCode.rowCount === 0 || backupCode.rows[0].is_used) {
      return false;
    }

    await pool.query(
      "UPDATE tfa_backup_codes SET is_used = true WHERE user_id = $1 AND code = $2",
      [id, code]
    );

    return true;
  } catch (err) {
    throw new Error(err);
  }
};
