import { useRouter } from "next/router";

export default function ClientPage() {
  const router = useRouter();
  const { id } = router.query;

  const images = [
    `/uploads/${id}/mini1.png`,
    `/uploads/${id}/mini2.png`,
    `/uploads/${id}/mini3.png`,
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="max-w-3xl w-full p-6 space-y-8">
        <h1 className="text-3xl font-bold text-center">Espace client : {id}</h1>
        <p className="text-center text-gray-400">Donnez vos avis sur les miniatures proposées :</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {images.map((img) => (
            <div key={img} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg flex flex-col items-center">
              <img src={img} alt="miniature" className="rounded-lg mb-4 w-full object-cover" />
              <form
                action="https://formspree.io/f/yourFormId"
                method="POST"
                className="flex space-x-4"
              >
                <input type="hidden" name="Client" value={id} />
                <input type="hidden" name="Miniature" value={img} />
                <button type="submit" name="Avis" value="Like" className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition">👍</button>
                <button type="submit" name="Avis" value="Dislike" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition">👎</button>
              </form>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Laisser un commentaire général :</h2>
          <form action="https://formspree.io/f/yourFormId" method="POST" className="flex flex-col space-y-4">
            <input type="hidden" name="Client" value={id} />
            <textarea
              name="Commentaire"
              placeholder="Vos remarques..."
              rows={4}
              required
              className="p-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-gray-400"
            ></textarea>
            <button type="submit" className="p-4 rounded-xl bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:scale-105 transition-transform duration-200 shadow-lg">Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  );
}
