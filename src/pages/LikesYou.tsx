// LikesYou.tsx
// Displays incoming likes. Lets the user Match or Skip.
// On Match → new conversation is created and navigates to.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIncomingLikes, removeIncomingLike } from "../services/likes.service";
import { createConversation } from "../services/conversations.service";

export default function LikesYou() {
  const [likes, setLikes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const seedIfEmpty = () => {
      const current = getIncomingLikes();
      if (current.length === 0) {
        localStorage.setItem(
          "incoming_likes",
          JSON.stringify([
            { id: "demo1", name: "Alice Demo", photos: ["/demo1.jpg"] },
            { id: "demo2", name: "Bob Demo", photos: ["/demo2.jpg"] },
          ])
        );
      }
      setLikes(getIncomingLikes());
    };

    seedIfEmpty();
    const handler = () => setLikes(getIncomingLikes());
    window.addEventListener("likes-changed", handler);

    return () => {
      window.removeEventListener("likes-changed", handler);
    };
  }, []);

  const handleMatch = (profile: any) => {
    removeIncomingLike(profile.id);
    const convo = createConversation(profile);
    navigate(`/conversations/${convo.id}`);
  };

  const handleSkip = (profile: any) => {
    removeIncomingLike(profile.id);
    setLikes(getIncomingLikes());
  };

  return (
    <div className="likes-page">
      <h2>Likes You</h2>
      {likes.length === 0 && <p>No new likes yet.</p>}
      <ul>
        {likes.map((profile) => (
          <li key={profile.id} className="like-card">
            <h3>{profile.name}</h3>
            {profile.photos?.[0] && (
              <img src={profile.photos[0]} alt={profile.name} width="100" />
            )}
            <div>
              <button onClick={() => handleMatch(profile)}>Match</button>
              <button onClick={() => handleSkip(profile)}>Skip</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}