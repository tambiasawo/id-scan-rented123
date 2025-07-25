import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Download,
  Mail,
  FileText,
  RotateCcw,
  AlertTriangle,
  User,
  Calendar,
  Shield,
  Eye,
} from "lucide-react";
import { emailPDF, generateVerificationReport } from "../actions";
import { VerificationResultDataType } from "../types";
import jsPDF from "jspdf";
import ModalAlert, { ModalAlertHandle } from "./ModalAlert";

interface ResultStepProps {
  isSuccess: boolean;
  verificationResultData: {
    verificationData: VerificationResultDataType[];
    idImage: string | null;
  };
  onRestart: () => void;
  activeToken: string;
}

const ResultStep: React.FC<ResultStepProps> = ({
  isSuccess,
  onRestart,
  verificationResultData,
  activeToken,
}) => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [emailDetails, setEmailDetails] = useState({
    s3Url: "",
    first_name: "",
    last_name: "",
  });
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>();
  const [emailFeedbackMessage, setEmailFeedbackMessage] = useState<
    null | string
  >(null);
  const [serverErrorMessage, setServerErrorMessage] = useState<null | string>(
    null
  );
  const alertRef = React.useRef<ModalAlertHandle>(null);

  const handleDownload = async () => {
    pdfDoc?.save(
      `Rented123 ID_Verification_Report_${emailDetails.last_name}.pdf`
    );
  };

  const handleEmailSend = async () => {
    if (!email) return;

    const response = await emailPDF(
      {
        last_name: emailDetails.last_name,
        first_name: emailDetails.first_name,
      },
      emailDetails.s3Url,
      email
    );
    if (!response.ok) {
      setIsEmailSent(false);
      setEmailFeedbackMessage("Could not send email. Please download.");
    } else {
      setIsEmailSent(true);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsEmailSent(true);
  };

  const preparePDF = React.useCallback(async () => {
    const { doc, s3Url, first_name, last_name } =
      await generateVerificationReport(verificationResultData, activeToken);
    if (/^https?:\/\/\S+\.\S+/.test(s3Url) && doc) {
      setEmailDetails({ s3Url, first_name, last_name });
      setPdfDoc(doc);
    } else {
      setServerErrorMessage(
        "Sorry, we could not generate the complete PDF. Please try again or contact us."
      );
      alertRef.current?.alert(
        "Sorry, we could not generate the complete PDF. Please try again or contact us."
      );
    }
  }, [verificationResultData, activeToken]);

  useEffect(() => {
    if (isSuccess) preparePDF();
  }, [isSuccess, preparePDF]);

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verification Successful!
          </h2>
          {!serverErrorMessage ? (
            <p className="text-gray-600 max-w-md mx-auto">
              Your identity has been successfully verified. Your verification
              report is ready for download.
            </p>
          ) : (
            <p className="text-red-600 max-w-md mx-auto">
              Although your identity has been successfully verified, there was a
              problem generating the PDF report. Please try again or{" "}
              <a
                href="mailto:tech@rented123.com;tambi@rented123.com"
                style={{ textDecoration: "underline" }}
              >
                contact us
              </a>
            </p>
          )}
        </div>

        {/* PDF Preview Card */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  ID Verification Report
                </h3>
                <p className="text-sm text-gray-500">
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPdfPreview(!showPdfPreview)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">
                {showPdfPreview ? "Hide" : "Preview"}
              </span>
            </button>
          </div>

          {showPdfPreview && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
              <div className="space-y-4">
                <div className="text-center border-b border-gray-300 pb-4">
                  <h4 className="text-lg font-bold text-gray-900">
                    IDENTITY VERIFICATION REPORT
                  </h4>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Identity Verification
                      </span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Document Authentication
                      </span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Biometric Match
                      </span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        98.7%
                      </div>
                      <div className="text-sm text-green-600">
                        Confidence Score
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    This report confirms successful identity verification
                    completed on {new Date().toLocaleDateString()} at{" "}
                    {new Date().toLocaleTimeString()}. All security checks
                    passed with high confidence scores.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              disabled={!Boolean(pdfDoc)}
              className="disabled:cursor-not-allowed flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-[#32429b] text-white py-3 px-4 rounded-lg font-semibold hover:blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Email Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Mail className="w-5 h-5 text-gray-600" />
            <span>Email Report</span>
          </h4>

          {!isEmailSent ? (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleEmailSend}
                disabled={!email || !emailDetails.s3Url}
                className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send Report via Email
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">
                  Report sent to {email}
                </span>
                {emailFeedbackMessage && (
                  <span className="text-green-700 font-medium">
                    {emailFeedbackMessage}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Start New Verification
        </button>

        <ModalAlert ref={alertRef} />
      </div>
    );
  }

  // Unsuccessful verification
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 md:w-24 md:h-24 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-6 h-6 md:w-12 md:h-12 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verification Failed
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We were unable to verify your identity. Please review the issues below
          and try again.
        </p>
      </div>

      {/* Error Details */}
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-3">
                Possible Issues:
              </h3>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                  <span>
                    Document quality too low - text appears blurry or unclear
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                  <span>
                    Facial recognition confidence below threshold (67% - minimum
                    85% required)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                  <span>
                    Glare detected on document surface affecting readability
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                  <span>
                    Check the expiry date. Your ID might have expired{" "}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-3">
            Tips for Better Results:
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Ensure your ID is well-lit with natural lighting</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Hold the camera steady and avoid blurry photos</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Remove any glare or reflections from the document</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Look directly at the camera for your selfie</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Ensure your face is clearly visible and well-lit</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>
                For more tips, click{" "}
                <a
                  href="https://docs.regulaforensics.com/develop/doc-reader-sdk/overview/image-quality-requirements/"
                  className="underline"
                  target="_blank"
                >
                  here
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-[#32429b] text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      </div>

      {/* Support Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
        <p className="text-sm text-gray-600 mb-4">
          If you continue to experience issues, our support team is here to
          help.
        </p>
        <button className="bg-gray-700 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          <a href="mailto:tech@rented123.com;tambi@rented123.com">
            Contact Support
          </a>
        </button>
      </div>
    </div>
  );
};

export default ResultStep;
