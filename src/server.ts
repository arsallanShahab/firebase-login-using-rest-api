import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { verifyToken } from "./middleware";
import userRoutes from "./routes/user.routes";
import { admin } from "./utils/firebase";

dotenv.config();

const app = express();
const port = process.env.PORT || 7635;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Server is healthy!");
});

app.use("/api/user", userRoutes);

app.use(
  "/protected-endpoint",
  verifyToken,
  async (req: Request, res: Response) => {
    // Access user data using req.uid (if needed)
    const uid = req.uid;
    if (!uid) {
      return res.status(400).send({
        success: false,
        message: "User ID not found in token",
      });
    }

    // Get user data from Firestore
    const db = admin.firestore();
    const userRef = db.collection("users").doc(uid);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).send({
      success: true,
      data: userSnapshot.data(),
      message: "Protected endpoint accessed successfully!",
    });
  }
);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
