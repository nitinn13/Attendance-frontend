import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, X, RefreshCw, QrCode, ArrowLeft } from "lucide-react";
import { useQrSession } from "../../hooks/useQrSession";
import { teacherApi } from "../../api/teacherApi";
import type { TeacherClass, ClassSession } from "../../models/Teacher";

export default function QrDisplay() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const numericSessionId = sessionId ? Number(sessionId) : null;

  const [context, setContext] = useState<{
    className: string;
    session: ClassSession;
  } | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [contextError, setContextError] = useState("");

  const { qrState, loading, error, presentCount, start, stop } =
    useQrSession(numericSessionId);

  // Resolve which class/session this is, for the header — the QR
  // service itself doesn't know the class name, just IDs.
  useEffect(() => {
    if (!numericSessionId) return;

    (async () => {
      try {
        setContextLoading(true);
        const data = await teacherApi.getMyClasses();
        for (const cls of data.classes as TeacherClass[]) {
          const found = cls.sessions.find((s) => s.id === numericSessionId);
          if (found) {
            setContext({ className: cls.name, session: found });
            return;
          }
        }
        setContextError("Session not found, or you don't have access to it.");
      } catch (e) {
        console.error(e);
        setContextError("Unable to load session details.");
      } finally {
        setContextLoading(false);
      }
    })();
  }, [numericSessionId]);

  const handleExit = async () => {
    if (qrState) {
      await stop();
    }
    navigate(-1);
  };

  if (!numericSessionId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <p>Invalid session.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          onClick={handleExit}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit
        </button>
        {context && (
          <div className="text-center">
            <p className="font-semibold">{context.className}</p>
            <p className="text-sm text-gray-400">
              {new Date(context.session.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
        <div className="w-16" />
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {contextLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : contextError ? (
          <p className="text-red-400">{contextError}</p>
        ) : (
          <>
            <div className="w-full max-w-sm aspect-square bg-white rounded-2xl flex items-center justify-center overflow-hidden mb-8 shadow-2xl">
              {qrState?.qrImage ? (
                <img
                  src={qrState.qrImage}
                  alt="Attendance QR code"
                  className="w-full h-full object-contain p-6"
                />
              ) : loading ? (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="text-center text-gray-400 px-8">
                  <QrCode className="w-14 h-14 mx-auto mb-3" />
                  <p>Press "Start QR" below</p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-400 mb-4 text-center max-w-md">
                {error}
              </p>
            )}

            {qrState && (
              <div className="flex items-center gap-2 text-lg mb-8">
                <Users className="w-5 h-5 text-gray-400" />
                {presentCount !== null
                  ? `${presentCount} marked present`
                  : "Checking attendance..."}
              </div>
            )}

            <div className="flex gap-3">
              {!qrState ? (
                <button
                  onClick={start}
                  disabled={loading}
                  className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                >
                  {loading ? "Starting..." : "Start QR"}
                </button>
              ) : (
                <button
                  onClick={stop}
                  disabled={loading}
                  className="px-8 py-3 border border-gray-700 text-white rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Stop QR
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
