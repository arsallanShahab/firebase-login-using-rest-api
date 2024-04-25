import axios from "axios";
export async function sendOTP(phoneNumber: string, OTP: string) {
  const apiKey = process.env.FAST2SMS_API as string;
  try {
    const res = await axios.get(
      `https://sms-auth.onrender.com/?message=${OTP}&number=${phoneNumber}&subject=OTP`,
      {
        headers: {
          "cache-control": "no-cache",
        },
      }
    );
    const data = res.data;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// https://sms-auth.onrender.com/?message=06102000&number=918309057182&subject=OTP
