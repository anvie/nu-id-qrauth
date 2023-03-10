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
  dev = false,
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

  const styles:React.CSSProperties = {
    minWidth: "200px",
    minHeight: "200px",
    position: "relative",
  };

  const subContentStyles:React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  const logoStyles:React.CSSProperties = {
    width: "64px",
    height: "66px",
  };

  return (
    <div className="nu-id-qr-auth-container" style={styles}>
      <p className="nu-id-qr-auth-scan-text">{text || _L("home.scanqr")}</p>
      {qrAuthCode ? (
        <div style={subContentStyles}>
          <QRCode key={qrAuthCode} data={qrAuthCode} />
          <div style={logoStyles}>
          <NuIDLogo />
          </div>
          {dev && <span>{qrAuthCode}</span>}
        </div>
      ) : loadingComponent ? (
        loadingComponent
      ) : (
        <p>Loading QR Code...</p>
      )}
    </div>
  );
};

export default NuIdQRAuth;

const NuIDLogo: React.FC = () => {
  return (
    <svg
      width="64"
      height="66"
      viewBox="0 0 36 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M33.797 21.4059C32.7557 28.8388 29.055 34.5004 17.0848 38C5.03167 34.4763 1.36357 28.7598 0.351807 21.2508L6.17087 19.4468C6.32232 20.9159 6.56607 22.2792 6.94537 23.4467C8.44899 28.0754 12.7285 30.2858 17.0848 31.724C21.441 30.2858 25.7204 28.0754 27.2242 23.4467C27.592 22.3144 27.8326 20.9977 27.9848 19.579L33.797 21.4059Z"
        fill="#B211DE"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M34.0009 5.21198C34.0345 9.47829 34.2478 13.4382 34.1387 17.058L28.2145 15.2049C28.235 13.3452 28.1818 11.4537 28.1238 9.67518L17.0848 6.27412L6.04585 9.67518C5.98915 11.4138 5.93728 13.2604 5.9539 15.0797L0.0266816 16.9148C-0.0728329 13.3339 0.135665 9.42214 0.168717 5.21198L17.0848 0L34.0009 5.21198Z"
        fill="#19B378"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.6255 22.7712C12.4353 25.2633 14.7392 26.4535 17.0846 27.2277C19.43 26.4535 21.734 25.2633 22.5438 22.7712C23.314 20.4008 21.9115 19.2829 20.1617 18.6936C19.3047 19.3376 18.2393 19.7194 17.0846 19.7194C15.93 19.7194 14.8646 19.3376 14.0075 18.6936C12.2578 19.2829 10.8552 20.4008 11.6255 22.7712Z"
        fill="#19B378"
      />
      <path
        d="M17.0847 18.5266C19.2259 18.5266 20.9618 16.7908 20.9618 14.6495C20.9618 12.5082 19.2259 10.7723 17.0847 10.7723C14.9434 10.7723 13.2075 12.5082 13.2075 14.6495C13.2075 16.7908 14.9434 18.5266 17.0847 18.5266Z"
        fill="#19B378"
      />
    </svg>
  );
};
