// Navbar.tsx
// App navigation bar with conditional links (public vs authed).
// Shows badge count for "Likes" and listens for auth + likes changes.

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getIncomingLikes } from "../services/likes.service";

export default function Navbar() {
  const [likesCount, setLikesCount] = useState(0);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // initial fetch
    setLikesCount(getIncomingLikes().length);
    setIsAuthed(!!localStorage.getItem("demo_user"));

    // listeners
    const handleLikes = () => setLikesCount(getIncomingLikes().length);
    const handleAuth = () => setIsAuthed(!!localStorage.getItem("demo_user"));
    window.addEventListener("likes-changed", handleLikes);
    window.addEventListener("auth-changed", handleAuth);
    window.addEventListener("storage", handleLikes);

    return () => {
      window.removeEventListener("likes-changed", handleLikes);
      window.removeEventListener("auth-changed", handleAuth);
      window.removeEventListener("storage", handleLikes);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {isAuthed ? (
        <>
          <Link to="/swipe">Swipe</Link>
          <Link to="/likes">
            Likes {likesCount > 0 && <span className="badge">{likesCount}</span>}
          </Link>
          <Link to="/conversations">Conversations</Link>
          <Link to="/profile">Profile</Link>
        </>
      ) : (
        <>
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">Login</Link>
        </>
      )}
    </nav>
  );
}