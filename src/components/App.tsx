import React, { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import { post } from "../lib/fetchWrapper";
import { randomString } from "../lib/rnd";

let _timeout: NodeJS.Timeout | undefined = undefined;

const QRCode: React.FC<{ data: string }> = ({ data }) => {
  const [qrCode, setQrCode] = useState<string>(data);
  useEffect(() => {
    (async () => {
      const qrCode: string = await QRCodeLib.toDataURL(data, {
        errorCorrectionLevel: "H",
      });
      setQrCode(qrCode);
    })().then(
      () => {},
      () => {}
    );
  }, []);
  return <img src={qrCode} alt="QR Code" />;
};

export type Props = {
  onSuccess: (accessToken: string) => void;
  text: string;
  loadingComponent?: React.ReactNode;
  _L?: (key: string) => string;
  dev?: boolean;
};

function defaultLocalizer(key: string) {
  return key;
}

const NuIdQRAuth: React.FC<Props> = ({
  onSuccess,
  text,
  _L = defaultLocalizer,
  loadingComponent,
  dev = false
}): React.ReactElement => {
  const [qrAuthCode, setQrAuthCode] = useState("");
  const qrCodeNonce = randomString(32);

  const refreshQrCode = async () => {
    return new Promise<string>((resolve, reject) => {
      post("/v1/qrAuth", { clientId: "1", nonce: qrCodeNonce }, dev)
        .then((data: any) => {
          if (data.accessToken) {
            onSuccess(data.accessToken as string);
            return;
          }

          const { sessionId, expires } = data as {
            sessionId: string;
            expires: number;
          };
          const now = Math.floor(Date.now() / 1000);

          if (sessionId) {
            setQrAuthCode(sessionId);

            // set timeout to refresh qr code
            const timeout = Math.floor(expires - now) * 1000;

            if (timeout < 1) {
              reject("timeout is negative");
              return;
            }

            if (_timeout) {
              clearTimeout(_timeout);
              _timeout = undefined;
            }

            _timeout = setTimeout(() => {
              void refreshQrCode();
            }, timeout);

            resolve(sessionId);
          } else {
            reject("no sessionId");
          }
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  };

  useEffect(() => {
    void refreshQrCode();
  }, []);

  return (
    <div className="mt-10 flex flex-col items-center">
      <p className="py-5 px-10">{text || _L("home.scanqr")}</p>
      {qrAuthCode ? (
        <>
          <QRCode key={qrAuthCode} data={qrAuthCode} />
          <span>{qrAuthCode}</span>
        </>
      ) : loadingComponent ? (
        loadingComponent
      ) : (
        <p>Loading QR Code...</p>
      )}
    </div>
  );
};

export default NuIdQRAuth;
