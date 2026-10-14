import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { PageLoader } from "./Loading";

interface ProtectedRouteProps {
  children?: ReactNode;
}

type Phase = "loading" | "checking" | "admin" | "unauthenticated" | "forbidden";

/** Guards every /admin route: only users registered in the Firestore
 * `admins` collection may enter. */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    let active = true;

    if (loading) {
      setPhase("loading");
      return () => {
        active = false;
      };
    }

    if (!user) {
      setPhase((current) => (current === "forbidden" ? current : "unauthenticated"));
      return () => {
        active = false;
      };
    }

    setPhase("checking");

    getDoc(doc(db, "admins", user.uid))
      .then((snapshot) => {
        if (!active) return;
        if (snapshot.exists()) {
          setPhase("admin");
        } else {
          setPhase("forbidden");
          void signOut(auth);
        }
      })
      .catch(() => {
        if (!active) return;
        setPhase("forbidden");
        void signOut(auth);
      });

    return () => {
      active = false;
    };
  }, [user, loading]);

  if (loading || phase === "loading" || phase === "checking") {
    return (
      <div className="min-h-screen bg-steel-100">
        <PageLoader label="Verifying admin access…" />
      </div>
    );
  }

  if (phase === "forbidden") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ error: "This account is not registered as an admin. Ask the administrator to grant access." }}
      />
    );
  }

  if (phase === "unauthenticated" || !user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children ?? <Outlet />;
}
