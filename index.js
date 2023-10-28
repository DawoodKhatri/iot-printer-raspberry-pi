import AWSIoTData from "aws-iot-device-sdk";
import AWS from "aws-sdk";
import fs from "fs";
import { getPrinters, print } from "unix-print";

getPrinters().then(console.log);

const AWSCredentials = {
  accessKeyId: "ASIAULIGBHUUZLJWBQNF",
  secretAccessKey: "zbO1KteyqkP/rqducUG2Ve9V2VkSK23cDDW1vPCA",
  sessionToken:
    "FwoGZXIvYXdzEIv//////////wEaDHnEjKe7a9CmUiz0HyK3ASVp6AUV/S69GgRYj+yOadN0xGRygi73XIkN37qTB33mYxSMWaHCVIvISOSdniyRsG11cwxBKZ4yHLZilntPGoa9y3G2Jw3w+HrGix3pv4vUAP0ZoH+0xbw048c6sJ7G3yVwlC8ViPf+Wdgr8y6qQkG3eAwPkD0GXgn5Rs8HTs6n7u7tKGS/86ooT+pR+NXiQ31OHapwa3YchVI6Gun+FPqwWW2RAAhJi5EHbBcFxqrxm4I6moxxaCikqfOpBjIto64CxmdBshRo9q7ZfYItxsLTXmcDETYS90NXsQseJYEm6Sdd04lP2T8nZc1Z",
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
      const fileToPrint = `./files/${fileKey}`;
      const printer = "PDF";
      const options = ["-o landscape", "-o fit-to-page", "-o media=A4"];

      print(fileToPrint, printer, options)
        .then(() => {
          fs.unlinkSync(`./files/${fileKey}`);
          console.log("Printer Successfully");
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
