// Swipe.tsx
// Swipe page that shows profiles one by one.
// Allows Like (with optional comment) or Skip.
// On Like → adds to outgoing likes (fires likes-changed).

import React, { useEffect, useState } from "react";
import { sendLike as sendLikeService } from "../services/likes.service";

const demoProfiles = [
  { id: "p1", name: "Sophie", photos: ["/sophie1.jpg", "/sophie2.jpg"] },
  { id: "p2", name: "Liam", photos: ["/liam1.jpg"] },
  { id: "p3", name: "Emma", photos: ["/emma1.jpg", "/emma2.jpg"] },
];

export default function Swipe() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setProfiles(demoProfiles);
  }, []);

  if (profiles.length === 0) {
    return <p>No profiles available.</p>;
  }

  const profile = profiles[index];

  const handleLike = async () => {
    await sendLikeService(
      { id: String(profile.id), name: profile.name },
      { comment, context: "photo" }
    );
    setComment("");
    if (index < profiles.length - 1) {
      setIndex(index + 1);
    }
  };

  const handleSkip = () => {
    if (index < profiles.length - 1) {
      setIndex(index + 1);
    }
  };

  return (
    <div className="swipe-page">
      <h2>Discover</h2>
      <div className="profile-card">
        <h3>{profile.name}</h3>
        {profile.photos?.map((src, i) => (
          <img key={i} src={src} alt={`${profile.name}-${i}`} width="200" />
        ))}
      </div>
      <div className="actions">
        <input
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={handleLike}>♥ Like</button>
        <button onClick={handleSkip}>X Skip</button>
      </div>
    </div>
  );
}