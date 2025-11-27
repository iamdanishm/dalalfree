export default function LogoLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative">
        {/* Main spinning ring */}
        <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
        <div
          className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full"
          style={{
            animation: "smooth-spin 1s linear infinite",
          }}
        ></div>

        {/* Inner pulse */}
        <div
          className="absolute inset-2 border-2 border-primary/40 rounded-full"
          style={{
            animation: "gentle-pulse 2s ease-in-out infinite",
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes smooth-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes gentle-pulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
