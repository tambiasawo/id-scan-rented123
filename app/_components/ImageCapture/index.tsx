"use client";
import React, { useState, useCallback } from "react";
import ProgressBar from "../ProgressBar";
import IdUploadStep from "../IdUpload";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken } from "@/app/actions";
import useIsMobile from "@/app/utils";
import QRCode from "../QRCode/QRCode";
import SelfieStep from "../SelfieStep";
import SubmitStep from "../SubmitStep";
import ResultStep from "../ResultStep";
import { UserData, VerificationResultDataType } from "@/app/types";

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    idPhoto: "",
    selfiePhoto: "",
  });
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null
  );
  const [verificationData, setVerificationData] = useState<
    Array<VerificationResultDataType>
  >([]);

  const isMobileDevice = useIsMobile();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [showQRCode, setShowQRCode] = React.useState(false);
  const [activeToken, setActiveToken] = useState("");
  const [verifyingToken, setVerifyingToken] = React.useState(true);

  const totalSteps = 3;

  const verifyToken = React.useCallback(
    async (token: string | null) => {
      const activeToken = await getToken(token as string);
      if (!activeToken) {
        router.push("/404");
      } else if (activeToken.product !== "idscan") {
        router.push("/404");
      } else {
        setActiveToken(activeToken.token);
        setVerifyingToken(false);
      }
    },
    [router]
  );

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVerificationComplete = useCallback(
    (success: boolean, data: VerificationResultDataType[]) => {
      setVerificationResult(success);
      setVerificationData(data);
      setCurrentStep(4); // Move to result step
    },
    []
  );

  const restartVerification = useCallback(() => {
    setCurrentStep(1);
    setVerificationResult(null);
    setUserData({
      idPhoto: null,
      selfiePhoto: null,
    });
  }, []);

  const updateIdPhoto = useCallback((idPhotoData: string) => {
    setUserData((prev) => ({
      ...prev,
      idPhoto: idPhotoData,
    }));
  }, []);

  const updateSelfiePhoto = useCallback((photoData: string) => {
    setUserData((prev) => ({
      ...prev,
      selfiePhoto: photoData,
    }));
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <IdUploadStep
            onNext={nextStep}
            onPhotoUpdate={updateIdPhoto}
            existingPhoto={userData.idPhoto}
          />
        );
      case 2:
        return (
          <SelfieStep
            onNext={nextStep}
            onBack={prevStep}
            onPhotoUpdate={updateSelfiePhoto}
            existingPhoto={userData.selfiePhoto}
          />
        );
      case 3:
        return (
          <SubmitStep
            onBack={prevStep}
            onComplete={handleVerificationComplete}
            userData={userData}
          />
        );
      case 4:
        return (
          <ResultStep
            isSuccess={verificationResult || false}
            onRestart={restartVerification}
            verificationResultData={{
              verificationData,
              idImage: userData.idPhoto,
            }}
            activeToken={activeToken}
          />
        );
      default:
        return (
          <IdUploadStep
            onNext={nextStep}
            onPhotoUpdate={updateIdPhoto}
            existingPhoto={userData.idPhoto}
          />
        );
    }
  };

  React.useEffect(() => {
    if (!token) {
      router.push("/404");
    } else {
      verifyToken(token);
    }
  }, [token, verifyToken, router]);

  return (
    <div className="min-h-[80vh] md:min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {verifyingToken ? (
        <div className="absolute top-[40%] left-[40%] md:left-[45%]">
          <h2> Verifying Token...</h2>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {showQRCode ? (
            <QRCode
              url={`https://services.idscan.rented123.com/?token=${activeToken}`}
              token={activeToken}
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 md:pt-6">
                {!isMobileDevice && currentStep === 1 && !showQRCode && (
                  <h4
                    className="font-semibold text-center text-sm cursor-pointer underline mb-6"
                    onClick={() => {
                      setShowQRCode(true);
                    }}
                  >
                    Switch to a mobile device
                  </h4>
                )}
                {currentStep <= 3 && (
                  <ProgressBar
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                  />
                )}
                {renderStep()}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              Powered by Rented123 AI technology •{" "}
              <a
                href="https://rented123.com/privacy-policy"
                target="_blank"
                className="underline"
              >
                Privacy Policy{" "}
              </a>
              •{" "}
              <a
                href="https://rented123.com/terms-and-conditions"
                target="_blank"
                className="underline"
              >
                Terms of Use{" "}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
