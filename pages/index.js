import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Bienvenue 👋</h1>
      <p>Demandez votre miniature :</p>

      <form
        action="https://formspree.io/f/yourFormId" // 👉 Remplace par ton ID Formspree
        method="POST"
      >
        <input
          type="text"
          name="Nom"
          placeholder="Votre nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />
        <textarea
          name="Demande"
          placeholder="Décrivez votre demande"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
