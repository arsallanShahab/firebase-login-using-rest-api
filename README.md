# 🚀 Phone Login with Firebase - Supercharged! 🚀

Welcome to the Phone Login with Firebase project! This is not your ordinary Firebase wrapper. We've taken Firebase's phone authentication feature and supercharged it with REST APIs, making it more flexible and powerful than ever before!

## 🛠️ Built with

- [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- [Firebase](https://firebase.google.com/) - App development platform with tools to develop, grow, and earn more from your app
- [Firebase Admin](https://firebase.google.com/docs/admin/setup) - For accessing Firebase services server-side
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - For generating JWTs used in authentication
- [Axios](https://axios-http.com/) - Promise based HTTP client for the browser and node.js
- [cors](https://www.npmjs.com/package/cors) - For enabling CORS with various options
- [dotenv](https://www.npmjs.com/package/dotenv) - For loading environment variables from a .env file
- [body-parser](https://www.npmjs.com/package/body-parser) - For parsing incoming request bodies

## 🎯 Features

- 📱 **Phone number login:** Just provide a phone number and you're good to go!
- 📨 **Verification code:** Get a verification code via SMS (using a third-party library like Fast2SMS - not included).
- 🔒 **Code verification:** Verify your identity with the received code.
- 👤 **User creation:** Create a new user document in Firestore with optional data (name, email, age) upon successful verification.
- 🔄 **User data update:** Existing users can update their data through a protected endpoint.
- 🎟️ **JWT (JSON Web Token):** Get a JWT token containing the user ID upon successful login/verification.
- 🛡️ **Protected endpoint:** Access user data from Firestore with a valid JWT token.
- ⏱️ **Rate limiting:** Prevent abuse by limiting login requests.
- 🚧 **Error handling:** Handle potential errors and send appropriate responses.
- 🏥 **Health check endpoint:** Verify server health.

## 🚀 Getting Started

1. 📂 Clone this repository.
2. 📦 Install dependencies: `npm install`
3. 🔥 Configure Firebase project and obtain credentials (refer to Firebase documentation).
4. 🌍 Create a `.env` file in the project root directory and set these environment variables:
   - `PORT`: Port number for the server (default: 7635)
   - `JWT_SECRET`: Secret key used for signing JWT tokens
   - `FAST2SMS_API`: Fast2SMS API key

## 🏃‍♀️ Running the Server

1. 🚀 Start the server: `node ./src/server.ts`

## 🌐 API Endpoints

**1. GET /** (Health Check)

- **Description:** Is our server running? Hit this endpoint to get a pulse!
- **Response:** A reassuring "Server is healthy!" message.

**2. POST /login** (Phone Number Login)

- **Request body:**

```json
{
  "phoneNumber": "<Your phone number>"
}
```

- **Description:** Starts the phone number login process.
- **Response:**
  - **Success (200):** Contains a message indicating a verification code has been sent.
  - **Error (400):** Invalid phone number format or missing phone number.
  - **Error (500):** Internal server error during code generation or sending.

**3. POST /verify-code** (Code Verification)

- **Request body:**

```json
{
  "phoneNumber": "<Your phone number>",
  "verificationCode": "<The secret code you received>"
}
```

- **Description:** Verifies user identity using the received verification code.
- **Response:**
  - **Success (200):**
    - Contains a JWT token for authentication.
    - Includes user data (optional): `{ "uid": "<user ID>", "name": "<name>", "email": "<email>", "age": <age> }` (if user information is provided during creation).
  - **Error (400):** Missing phone number or verification code, or code not found/expired.
  - **Error (500):** Internal server error during verification or user creation.

**4. POST /create-user** (Create/update user - requires valid JWT token)

- **Request body (optional):**

```json
    {
      "name": "<optional name>",
      "email": "<optional email>",
      "age": <optional age (number)>
    }
```

- **Description:** Creates a new user or updates existing user data.
- **Response:**
  - **Success (201 - user created) or (200 - user updated):** Message indicating successful creation/update.
  - **Error (400):** Missing user ID in token.
  - **Error (500):** Internal server error during user creation/update.

**5. GET /protected-endpoint** (Access user data - requires valid JWT token)

- **Description:** Retrieves user data from Firestore for the authenticated user (identified by the JWT token).
- **Response:**
  - **Success (200):** Contains the user data from Firestore if found.
  - **Error (400):** User ID not found in the token.
  - **Error (404):** User not found in Firestore.
  - **Error (500):** Internal server error during data retrieval.

## ⚠️ Note

- The server does not send SMS messages directly but assumes a third-party service (like Fast2SMS) is used.
- The server does not handle user authentication directly but relies on Firebase Authentication.
- The server does not store user passwords but uses Firebase's phone number verification.
- The server does not include error handling for all possible scenarios and may require additional validation.
- The server does not include a production-ready setup (e.g., HTTPS, logging, monitoring).

## 🚀 Deployment

This project is deployed on [Render](https://render.com/). You can check out the live version [here](link-to-live-version).

## 📂 Folder Structure

Here's a high-level overview of our project's folder structure:

## 🎓 Learn More

If you're new to Firebase or Express, here are a few resources to get you started:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Express Documentation](https://expressjs.com/)
- [Firebase Phone Authentication Tutorial](link-to-tutorial)
- [Building a REST API with Express Tutorial](link-to-tutorial)

Remember, the best way to learn is by doing. Don't be afraid to make changes to the code and see what happens! Happy coding! 🚀
