import { useRouter } from "next/router";

export default function ClientPage() {
  const router = useRouter();
  const { id } = router.query;

  // Tu mets les fichiers dans /public/uploads/[id]/
  const images = [
    `/uploads/${id}/mini1.png`,
    `/uploads/${id}/mini2.png`,
    `/uploads/${id}/mini3.png`,
  ];

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Espace client : {id}</h1>
      <p>Donnez vos avis sur les miniatures proposées :</p>

      {images.map((img) => (
        <div key={img} style={{ marginBottom: 30 }}>
          <img src={img} alt="miniature" width="300" />
          <br /><br />
          <form
            action="https://formspree.io/f/yourFormId" // 👉 ton ID Formspree
            method="POST"
          >
            <input type="hidden" name="Client" value={id} />
            <input type="hidden" name="Miniature" value={img} />

            <button type="submit" name="Avis" value="Like">👍 J’aime</button>
            <button type="submit" name="Avis" value="Dislike">👎 Je n’aime pas</button>
          </form>
        </div>
      ))}

      <h2>Laisser un commentaire général :</h2>
      <form
        action="https://formspree.io/f/yourFormId"
        method="POST"
      >
        <input type="hidden" name="Client" value={id} />
        <textarea
          name="Commentaire"
          placeholder="Vos remarques..."
          rows={4}
          required
        ></textarea>
        <br /><br />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
