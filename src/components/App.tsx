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
  qrAuthCode: string;
  onSuccess: (accessToken: string) => void;
  text: string;
  loadingComponent?: React.ReactNode;
  _L?: (key: string) => string;
};

function defaultLocalizer(key: string) {
  return key;
}

const NuIdQRAuth: React.FC<Props> = ({
  qrAuthCode,
  onSuccess,
  text,
  _L = defaultLocalizer,
  loadingComponent,
}): React.ReactElement => {
  const qrCodeNonce = randomString(32);

  const refreshQrCode = async () => {
    return new Promise<string>((resolve, reject) => {
      post("/v1/qrAuth", { clientId: "1", nonce: qrCodeNonce })
        .then((result: any) => {
          if (result.accessToken) {
            onSuccess(result.accessToken);
            return;
          }

          const { sessionId, expires } = result as {
            sessionId: string;
            expires: number;
          };
          const now = Math.floor(Date.now() / 1000);

          if (result.sessionId) {
            // set timeout to refresh qr code
            const timeout = Math.floor(expires - now) * 1000;
            console.log("🚀 ~ file: index.tsx:48 ~ .then ~ timeout:", timeout);

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
