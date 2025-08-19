// LikesYou.tsx
// Displays incoming likes. Lets the user Match or Skip.
// On Match → new conversation is created and navigates to.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIncomingLikes, removeIncomingLike } from "../services/likes.service";
import { acceptLike } from "../services/matches.service";

export default function LikesYou() {
  const [likes, setLikes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function seedIfEmpty() {
      const current = await getIncomingLikes();
      if (!mounted) return;
      if (!current || current.length === 0) {
        localStorage.setItem(
          'incoming_likes',
          JSON.stringify([
            { id: 'demo1', fromProfile: { id: 101, name: 'Alice Demo', photos: ['/demo1.jpg'] } },
            { id: 'demo2', fromProfile: { id: 102, name: 'Bob Demo', photos: ['/demo2.jpg'] } },
          ])
        );
      }
      const reread = await getIncomingLikes();
      if (mounted) setLikes(reread || []);
    }

    seedIfEmpty();
    const handler = async () => {
      const v = await getIncomingLikes();
      if (mounted) setLikes(v || []);
    };
    window.addEventListener('likes-changed', handler as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('likes-changed', handler as EventListener);
    };
  }, []);

  const handleMatch = async (like: any) => {
    try {
      const { conversationId } = await acceptLike(like.id);
      navigate(`/conversations/${conversationId}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSkip = async (like: any) => {
    await removeIncomingLike(like.id);
    const v = await getIncomingLikes();
    setLikes(v || []);
  };

  return (
    <div className="likes-page">
      <h2>Likes You</h2>
      {likes.length === 0 && <p>No new likes yet.</p>}
      <ul>
        {likes.map((like) => (
          <li key={like.id} className="like-card">
            <h3>{like.fromProfile?.name}</h3>
            {like.fromProfile?.photos?.[0] && (
              <img src={like.fromProfile.photos[0]} alt={like.fromProfile.name} width="100" />
            )}
            <div>
              <button onClick={() => handleMatch(like)}>Match</button>
              <button onClick={() => handleSkip(like)}>Skip</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}