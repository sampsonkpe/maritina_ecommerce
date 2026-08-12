import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../../api/axios";
import LoadingState from "../../components/common/LoadingState";
import Alert from "../../components/common/Alert";

export default function VerifyEmailPage() {
  const { token } = useParams();

  const [loading, setLoading] =
    useState(true);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const [alreadyVerified, setAlreadyVerified] =
    useState(false);

  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    const verifyEmail = async () => {
      if (!token) {
        setError(
          "Invalid verification link."
        );
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/auth/verify-email/${token}/`
        );

        setSuccess(
          response.data.message ||
          "Email verified successfully."
        );

        setAlreadyVerified(
          response.data.already_verified === true
        );
      } catch (error: unknown) {
        console.error(error);

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const response = (
            error as {
              response?: {
                data?: {
                  error?: string;
                };
              };
            }
          ).response;

          setError(
            response?.data?.error ||
            "Unable to verify your email."
          );
        } else {
          setError(
            "Unable to verify your email."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (loading) {
    return (
      <LoadingState
        message="Verifying your email..."
      />
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">

        <h1 className="text-3xl font-bold">
          Verification failed
        </h1>

        <div className="mt-6">
          <Alert
            message={error}
            variant="error"
          />
        </div>

        <Link
          to="/register"
          className="mt-6 inline-block rounded-md border px-6 py-3"
        >
          Back to Registration
        </Link>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-8 text-center">

      <h1 className="text-3xl font-bold">
        {alreadyVerified
          ? "Email already verified"
          : "Email verified"}
      </h1>

      <div className="mt-6">
        <Alert
          message={success}
          variant="success"
        />
      </div>

      <Link
        to="/login"
        className="mt-6 inline-block rounded-md bg-black px-6 py-3 text-white"
      >
        Continue to Login
      </Link>

    </div>
  );
}