import AWSIoTData from "aws-iot-device-sdk";

export const AWSIoTClient = async (clientId) => {
  let request = await fetch(`${process.env.APP_URL}/api/admin/aws-iot`);
  request = await request.json();

  if (request.success) {
    const { privateKey, caCert, clientCert, host } = request.data;
    return AWSIoTData.device({
      privateKey: Buffer.from(privateKey, "base64"),
      caCert: Buffer.from(caCert, "base64"),
      clientCert: Buffer.from(clientCert, "base64"),
      host,
      clientId,
    });
  } else {
    throw Error("Internal Server Error");
  }
};

export const AWSCredentials = async () => {
  let request = await fetch(`${process.env.APP_URL}/api/admin/aws-credentials`);
  request = await request.json();

  if (request.success) {
    return request.data;
  } else {
    throw Error("Internal Server Error");
  }
};
