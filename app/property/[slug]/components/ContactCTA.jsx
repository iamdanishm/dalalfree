import { useSession } from "next-auth/react";

export default function ContactCTA() {
  const { status } = useSession();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
      <button
        onClick={() => {
          if (status === "unauthenticated") {
            // Would implement login redirect
            console.log("Login redirect");
          } else {
            // Would implement contact functionality
            console.log("Contact functionality");
          }
        }}
        className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors shadow-sm"
      >
        {status === "authenticated"
          ? "View Contact Details / Schedule Visit"
          : "Login to View Contact / Schedule Visit"}
      </button>
    </div>
  );
}
