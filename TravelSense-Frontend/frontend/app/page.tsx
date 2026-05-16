import Navbar from "@/components/Navbar";
import LocationCard from "@/components/LocationCard";
import TouristPlaces from "@/components/TouristPlaces";
import Restaurants from "@/components/Restaurants";
import LocalFoods from "@/components/LocalFoods";
import LanguagePhrases from "@/components/LanguagePhrases";
import Translate from "@/components/Translate";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 pt-2 md:pt-12 pb-6 flex flex-col items-center justify-start md:justify-center text-center transition-all">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-6 mt-4 leading-tight">
          <span className="text-slate-900 dark:text-white">Discover The World With</span><br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 inline-block hover:scale-[1.02] transition-transform duration-300">
            TravelSense
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed px-2">
          Automatically detect your location, discover nearby tourist attractions, find top restaurants, and learn local culture instantly. Your smart travel companion.
        </p>
        
        <LocationCard />
        <TouristPlaces />
        <Restaurants />
        <LocalFoods />
        <LanguagePhrases />
        <Translate />
      </div>
      <Footer />
    </main>
  );
}
