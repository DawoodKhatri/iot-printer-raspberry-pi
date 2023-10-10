import AWSIoTData from "aws-iot-device-sdk";
import AWS from "aws-sdk";
import fs from "fs";
import PdfPrinter from "pdf-to-printer";

const AWSCredentials = {
  accessKeyId: "ASIAULIGBHUUVYGLYQHY",
  secretAccessKey: "E0Ev6IYeg0edSFy31haJ61jmejq5XDUSmADtl8Lu",
  sessionToken:
    "FwoGZXIvYXdzEOL//////////wEaDLkfhuRu3k5aHVUOoSK3AYWLvXQ3xct24KzjNVeoVR3/Noyp1aFEA6nMtCQDRuGZvnbBIQEKW6UnxHNN3Nmg426SGLxcPIDCUjqOWB91/8Z8onhYeyat6t87keTqKzInUHrob3Kl0x6DZ6Y4mWB33KYxxuCyvqwYv0Rhjic7cEzQvv2c3yur9OIR3AxwYzPsLWu71NXwIAtiq4xBbEpynHzt1uSLhWAF04I3W1labw3pLmlS1chmdtks7o4fw8/RwkytOrZSGSjbhJapBjItiVmK3Zvu7TrZAEEaaTurOV7iBy/C9RJYLhvE6aTbsi1b/kBQRMUgdUq7VaTZ",
};

const s3 = new AWS.S3({ credentials: AWSCredentials, region: "us-east-1" });

const device = AWSIoTData.device({
  keyPath: "./keys/private.key",
  caPath: "./keys/rootCa.pem",
  certPath: "./keys/certificate.crt",
  clientId: "raspberry-pi-device",
  host: "a2uaokcdvkjoer-ats.iot.us-east-1.amazonaws.com",
  cleanSession: false,
});

device.on("connect", () => {
  console.log("connected");
  device.subscribe("print");
});

device.on("message", async (topic, payload) => {
  if (topic === "print") {
    const { fileKey } = JSON.parse(payload);
    const downloadParams = {
      Bucket: "iot-printer-files",
      Key: fileKey,
    };

    if (!fs.existsSync("./files")) {
      fs.mkdirSync("./files");
    }

    const fileStream = s3.getObject(downloadParams).createReadStream();
    const writeStream = fs.createWriteStream(`./files/${fileKey}`);
    const stream = fileStream.pipe(writeStream);
    stream.on("finish", () => {
      const printOptions = {
        // pages: "1-3,5",
        // scale: "fit",
      };

      PdfPrinter.print(`./files/${fileKey}`, printOptions)
        .then(() => {
          fs.unlinkSync(`./files/${fileKey}`);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
});

device.on("error", (...error) => {
  console.log(error);
});
