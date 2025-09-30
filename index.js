import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set required headers for sheets to work properly
app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "frame-src 'self' https://intercom-sheets.com"
  );
  res.setHeader("X-Requested-With", "XMLHttpRequest");
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(express.static(path.join(__dirname)));

const listener = app.listen(PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// Initial canvas with button to open the sheet
const initialCanvas = {
  canvas: {
    content: {
      components: [
        {
          type: "text",
          id: "review-header",
          text: "AfterShoot Review",
          align: "center",
          style: "header",
        },
        {
          type: "text",
          id: "review-description",
          text: "Click below to access your AfterShoot review dashboard",
          align: "center",
          style: "paragraph",
        },
        {
          type: "button",
          label: "Open Review Dashboard",
          style: "primary",
          id: "open_review_button",
          action: {
            type: "sheet",
            url: process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}/sheet`
              : "http://localhost:3000/sheet",
          },
        },
      ],
    },
  },
};

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Intercom AfterShoot Review App",
    endpoints: {
      initialize: "/initialize",
      sheet: "/sheet",
      submitSheet: "/submit-sheet"
    }
  });
});

// Initialize flow - sends the initial canvas
app.post("/initialize", (request, response) => {
  console.log("Initialize request received");
  response.send(initialCanvas);
});

/**
 * Sheet endpoint - Opens the iframe with AfterShoot review page
 * This endpoint receives encrypted user data from Intercom
 */
app.post("/sheet", (req, res) => {
  try {
    const jsonParsed = JSON.parse(req.body.intercom_data);
    const encodedUser = jsonParsed.user;

    console.log("Sheet opened - Encoded user:", encodedUser);

    // Decrypt user object to verify legitimate Intercom user
    if (process.env.CLIENT_SECRET) {
      let decodedUser = decodeUser(encodedUser);
      console.log("Decoded user:", decodedUser);
    }

    // Send the sheet HTML file
    res.sendFile(path.join(__dirname, "public", "sheet.html"));
  } catch (error) {
    console.error("Error in sheet endpoint:", error);
    res.status(500).send("Error loading sheet");
  }
});

/**
 * Submit sheet endpoint - Called when user closes the sheet
 * Returns a final canvas to display in the messenger
 */
app.post("/submit-sheet", (req, res) => {
  console.log("Sheet submitted:", req.body);

  const finalCanvas = {
    canvas: {
      content: {
        components: [
          {
            type: "text",
            id: "closing",
            text: "Thanks for using AfterShoot Review!",
            align: "center",
            style: "header",
          },
          {
            type: "button",
            label: "Open Again",
            style: "secondary",
            id: "reopen_button",
            action: {
              type: "submit",
            },
          },
        ],
      },
    },
  };

  res.send(finalCanvas);
});

/**
 * Decrypt the user object from Intercom
 * Uses AES-256-GCM encryption with your CLIENT_SECRET
 */
function decodeUser(encodedUser) {
  const masterkey = process.env.CLIENT_SECRET;

  if (!masterkey) {
    console.warn("CLIENT_SECRET not set - skipping user decryption");
    return null;
  }

  // Base64 decoding
  const bData = Buffer.from(encodedUser, "base64");

  // Extract IV, tag, and ciphertext
  const ivlen = 12;
  const iv = bData.slice(0, ivlen);

  const taglen = 16;
  const tag = bData.slice(bData.length - taglen, bData.length);

  const cipherLen = bData.length - taglen;
  const cipherText = bData.slice(ivlen, cipherLen);

  // Create key from CLIENT_SECRET
  let hash = crypto.createHash("sha256").update(masterkey);
  let key = Buffer.from(hash.digest("binary"), "binary");

  // AES 256 GCM Mode
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  // Decrypt
  let decrypted = decipher.update(cipherText, "binary", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}

export default app;