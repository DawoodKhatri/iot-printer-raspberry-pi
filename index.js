import AWS from "aws-sdk";
import fs from "fs";
import { getDefaultPrinter, print } from "unix-print";
import { AWSCredentials, AWSIoTClient } from "./config/aws.js";
import dotenv from "dotenv";

dotenv.config();

const defaultPrinter = await getDefaultPrinter();

if (!defaultPrinter) throw Error("Printer not Detected");

if (!process.env.APP_URL) throw Error(".env incomplete");

console.log(`Printer Detected: ${defaultPrinter.printer}`);

const s3 = new AWS.S3({
  credentials: await AWSCredentials(),
  region: "us-east-1",
});

const device = await AWSIoTClient("raspberry-pi-device");

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
      const fileToPrint = `./files/${fileKey}`;
      const options = ["-o fit-to-page", "-o media=A4"];

      print(fileToPrint, defaultPrinter.printer, options)
        .then(() => {
          fs.unlinkSync(`./files/${fileKey}`);
          console.log("Printed Successfully");
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
