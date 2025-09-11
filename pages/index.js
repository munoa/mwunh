export default function Home() {
  return (
    <div className="w-full h-screen flex items-center justify-center px-4">
      <div className="backdrop-blur-md bg-white/5 p-10 rounded-2xl shadow-2xl max-w-lg w-full border border-white/10">
        <h1 className="text-3xl font-bold text-center mb-6">🚀 Demande de miniature</h1>
        
        <form
          action="https://formspree.io/f/yourFormId" // 👉 Remplace par ton ID Formspree
          method="POST"
          className="flex flex-col space-y-4"
        >
          <input
            type="text"
            name="Nom"
            placeholder="Votre nom"
            required
            className="p-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-gray-400"
          />
          <textarea
            name="Demande"
            placeholder="Décrivez votre demande"
            rows="5"
            required
            className="p-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-gray-400"
          />
          <button
            type="submit"
            className="p-4 rounded-xl bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:scale-105 transition-transform duration-200 shadow-lg"
          >
            Envoyer ✨
          </button>
        </form>
      </div>
    </div>
  );
}
