import { AxiosError } from "axios";
import { NextFunction, Request, Response } from "express";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import * as jwt from "jsonwebtoken";
import { UserData } from "../types/app";
import catchAsync from "../utils/catch-error";
import config from "../utils/config";
import { admin } from "../utils/firebase";
import { sendOTP } from "../utils/otp";

const loginUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const phoneNumber = req.body.phoneNumber;

    const phoneUtil = PhoneNumberUtil.getInstance();
    const validatePhoneNumber = (phoneNumber: string): boolean => {
      const parsedPhoneNumber = phoneUtil.parse(phoneNumber, "IN");
      if (!phoneUtil.isValidNumber(parsedPhoneNumber)) {
        return false;
      }
      return true;
    };

    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
      return;
    }

    const formattedPhoneNumber = phoneUtil.format(
      PhoneNumberUtil.getInstance().parse(phoneNumber, "IN"),
      PhoneNumberFormat.E164
    );

    try {
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      try {
        await sendOTP(phoneNumber, verificationCode);
      } catch (error) {
        const err = error as
          | (AxiosError & {
              response: { data: { message: string } };
            })
          | (Error & { message: string });

        if ("response" in err && err.response?.data?.message) {
          res.status(500).send({
            success: false,
            message: err?.response?.data?.message,
          });
          return;
        } else {
          res.status(500).json({
            success: false,
            message:
              err.message ||
              "Error sending verification code. Please try again later.",
          });
          return;
        }
      }

      const db = admin.firestore();
      const docRef = db.collection("verificationCodes").doc();
      await docRef.set({
        phoneNumber: formattedPhoneNumber,
        code: verificationCode,
        createdAt: admin.firestore.Timestamp.now(),
      });

      res.status(200).json({
        success: true,
        message: "Verification code sent successfully",
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error sending verification code. Please try again later.",
        });
        return;
      }
      console.error("Error sending verification code:", error);
      res.status(500).json({
        success: false,
        message: "Error sending verification code. Please try again later.",
      });
    }
  }
);

const verifyOTP = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const phoneNumber = req.body.phoneNumber;
    const verificationCode = req.body.verificationCode;

    if (!phoneNumber || !verificationCode) {
      res.status(400).send({
        success: false,
        message: "Phone number and verification code are required",
      });
      return;
    }

    // Convert phone number to E.164 format
    const phoneUtil = PhoneNumberUtil.getInstance();
    const formattedPhoneNumber = phoneUtil.format(
      PhoneNumberUtil.getInstance().parse(phoneNumber, "IN"),
      PhoneNumberFormat.E164
    );
    console.log(
      `Verifying code ${verificationCode} for ${formattedPhoneNumber}`
    );

    try {
      // Retrieve the verification code document from Firestore
      const db = admin.firestore();
      const docRef = db
        .collection("verificationCodes")
        .where("phoneNumber", "==", formattedPhoneNumber);

      const verificationSnapshot = await docRef.get();
      if (verificationSnapshot.empty) {
        res.status(400).send({
          success: false,
          message: "Verification code not found. Please try again.",
        });
        return;
      }

      // Check code validity based on a time limit (e.g., 5 minutes)
      const verificationData = verificationSnapshot.docs[0].data();
      const codeCreatedAt = verificationData.createdAt.toMillis();
      const currentTime = Date.now();
      const codeAge = currentTime - codeCreatedAt;
      const MAX_CODE_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

      if (codeAge > MAX_CODE_AGE) {
        // Code expired, delete document and return error
        const snapshot = await docRef.get();
        await snapshot.docs[0].ref.delete();
        res.status(400).send({
          success: false,
          message: "Verification code expired. Please request a new one.",
        });
        return;
      }

      const storedCode = verificationData.code;
      if (storedCode !== verificationCode) {
        res.status(400).send({
          success: false,
          message: "Invalid verification code. Please try again.",
        });
        return;
      }

      const auth = admin.auth();

      // Check if user already exists
      let userRecord: UserData = {};
      try {
        await auth.getUserByPhoneNumber(formattedPhoneNumber);
        console.log(userRecord, "userRecord");
      } catch (error) {
        console.error("Error fetching user by phone number:", error);
        userRecord = {};
      }
      // User data to store (consider adding validation for each field)
      const userData: UserData = {};
      if (req.body.name && typeof req.body.name === "string") {
        userData.name = req.body.name;
      }
      if (req.body.email && typeof req.body.email === "string") {
        userData.email = req.body.email;
      }
      if (req.body.age && typeof req.body.age === "number") {
        userData.age = req.body.age;
      }

      let userToUpdate = userRecord; // Use existing user record by default

      if (!userRecord.uid) {
        // Create user if it doesn't exist
        const newUserRecord = await auth.createUser({
          phoneNumber: formattedPhoneNumber,
        });
        userToUpdate = newUserRecord; // Update reference to new user
        const userRef = db.collection("users").doc(newUserRecord.uid);
        await userRef.set(userData);
      } else {
        // Update user data if provided in the request body
        const userRef = db.collection("users").doc(userRecord.uid);
        if (Object.keys(userData).length > 0) {
          // Check if any user data is provided
          await userRef.update(userData as { [x: string]: any });
        }
      }

      // After successful verification, delete the verification code document
      const querySnapshot = await docRef.get();
      await querySnapshot.docs[0].ref.delete();

      // Generate JWT with user ID
      const token = jwt.sign({ uid: userToUpdate?.uid }, config.JWT_SECRET, {
        expiresIn: "1h",
      }); // Set appropriate expiration time for the token

      res.status(200).send({
        success: true,
        data: {
          token,
          user: { uid: userToUpdate.uid, ...userData },
        },
        message: "Verification successful!",
      }); // Send the JWT token and user data in the response
    } catch (error) {
      console.error("Error verifying code or creating user:", error);
      res.status(500).send({
        success: false,
        message: "Error verifying code or creating user",
      });
    }
  }
);

const createUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userData: UserData = {};
    if (req.body.name) {
      userData.name = req.body.name;
    }
    if (req.body.email) {
      userData.email = req.body.email;
    }
    if (req.body.age) {
      userData.age = req.body.age;
    }

    if (!req.uid) {
      res.status(400).send({
        success: false,
        message: "User ID not found in token",
      });
      return;
    }

    const db = admin.firestore();

    try {
      const getUserFromPhone = await admin.auth().getUser(req.uid);
      if (!getUserFromPhone.phoneNumber) {
        res.status(400).send({
          success: false,
          message: "Phone number not found in user record",
        });
        return;
      }
      const userRef = db.collection("users").doc(req.uid);

      // Check if user document exists
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        // User exists, update data if provided
        if (Object.keys(userData).length > 0) {
          // Check if any user data is provided
          await userRef.update(userData as { [x: string]: any });
          res.status(200).send({
            success: true,
            data: userData,
            message: "User data updated successfully!",
          });
        } else {
          res.status(200).send({
            success: true,
            data: userSnapshot.data(),
            message: "No user data provided for update",
          });
        }
      } else {
        // User doesn't exist, create a new user
        await userRef.set(userData);
        res.status(201).send({
          success: true,
          data: userData,
          message: "User created successfully!",
        });
      }
    } catch (error) {
      console.error("Error creating or updating user:", error);
      res.status(500).send({
        success: false,
        message: "Error creating or updating user",
      });
    }
  }
);

export default {
  loginUser,
  verifyOTP,
  createUser,
};
