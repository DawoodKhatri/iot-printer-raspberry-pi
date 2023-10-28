import AWSIoTData from "aws-iot-device-sdk";

export const AWSIoTClient = (clientId) => {
  return AWSIoTData.device({
    privateKey: Buffer.from(process.env.AWS_IOT_PRIVATE_KEY, "base64"),
    caCert: Buffer.from(process.env.AWS_IOT_CA_CERT, "base64"),
    clientCert: Buffer.from(process.env.AWS_IOT_CLIENT_CERT, "base64"),
    host: process.env.AWS_IOT_HOST,
    clientId,
  });
};

export const AWSCredentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
};
