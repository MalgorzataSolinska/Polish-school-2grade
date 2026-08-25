import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { speakText, playSuccessSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { User, Award, Star, Flame, Trophy, Printer, CheckCircle2, Lock, Sparkles, Volume2, ShieldCheck } from 'lucide-react';

interface ProfileTabProps {
  student: StudentProfile;
  setStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
  onChangePin?: (newPin: string) => void;
}

const AVATARS = ['🦉', '🦊', '🐺', '🐻', '🦅', '🦄', '🦁', '🐼', '🐱', '🐶', '🚀', '🦔'];

export const ProfileTab: React.FC<ProfileTabProps> = ({
  student,
  setStudent,
  onChangePin,
}) => {
  const [showDiplomaModal, setShowDiplomaModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeStatus, setPinChangeStatus] = useState<string | null>(null);

  const handleSelectAvatar = (av: string) => {
    setStudent((prev) => ({ ...prev, avatar: av }));
    playSuccessSound();
    speakText(`Nowy awatar wybrany! Świetny wybór!`);
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput || newPinInput.length !== 4) {
      setPinChangeStatus('Kod PIN musi składać się z dokładnie 4 cyfr!');
      return;
    }

    if (onChangePin) {
      onChangePin(newPinInput);
    }
    setStudent((prev) => ({ ...prev, pin: newPinInput }));
    playSuccessSound();
    speakText('Super! Twój nowy kod PIN został pomyślnie zapisany!');
    setPinChangeStatus('✅ Twój nowy 4-cyfrowy kod PIN został zapisany!');
    setNewPinInput('');
  };

  const triggerPrintDiploma = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header Banner */}
      <div className="bg-[#4F81FF] text-white border-4 border-black p-6 sm:p-8 rounded-3xl shadow-[8px_8px_0px_black] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Avatar Display */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FFD700] border-4 border-black flex items-center justify-center text-4xl sm:text-5xl shadow-[4px_4px_0px_black] shrink-0 rotate-[-2deg]">
            {student.avatar}
          </div>

          <div>
            <span className="bg-[#FF4F81] text-white border-2 border-black px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide shadow-[2px_2px_0px_black] inline-block mb-1">
              {student.levelName || 'Mistrz Polszczyzny Klasy 2'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mt-1 uppercase tracking-tight drop-shadow-[2px_2px_0px_black]">{student.name}</h2>
            <p className="text-xs sm:text-sm text-yellow-200 font-black flex items-center gap-2">
              <span>Uczeń Klasy 2 • Polska Szkoła Sobotnia</span>
              <span className="bg-black/40 px-2 py-0.5 rounded-md text-[10px]">PIN: ****</span>
            </p>
          </div>
        </div>

        {/* Big Quick Stats */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-white text-black p-3 rounded-2xl text-center border-3 border-black shadow-[4px_4px_0px_black]">
            <span className="text-xl sm:text-2xl font-black block text-amber-500">
              {student.stars} ⭐
            </span>
            <span className="text-[11px] font-black block uppercase tracking-wider text-black">
              Gwiazdki
            </span>
          </div>

          <div className="bg-white text-black p-3 rounded-2xl text-center border-3 border-black shadow-[4px_4px_0px_black]">
            <span className="text-xl sm:text-2xl font-black block text-rose-500">
              {student.streakDays} 🔥
            </span>
            <span className="text-[11px] font-black block uppercase tracking-wider text-black">
              Dni nauki
            </span>
          </div>

          <div className="bg-white text-black p-3 rounded-2xl text-center border-3 border-black shadow-[4px_4px_0px_black]">
            <span className="text-xl sm:text-2xl font-black block text-emerald-600">
              {student.completedTaskIds?.length || 0} 🏆
            </span>
            <span className="text-[11px] font-black block uppercase tracking-wider text-black">
              Wykonane
            </span>
          </div>
        </div>
      </div>

      {/* Avatar & Profile Settings Section */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] space-y-6">
        <div>
          <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2 uppercase tracking-tight">
            <User className="w-6 h-6 text-[#FF4F81]" />
            <span>Zmień swój Awatar:</span>
          </h3>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => handleSelectAvatar(av)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-3xl flex items-center justify-center transition-all cursor-pointer border-3 border-black ${
                  student.avatar === av
                    ? 'bg-[#FFD700] scale-110 shadow-[4px_4px_0px_black] rotate-2'
                    : 'bg-yellow-50 hover:bg-yellow-200 hover:scale-105 shadow-[2px_2px_0px_black]'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Change Own Student PIN Section */}
        <div className="pt-6 border-t-2 border-gray-200">
          <h4 className="text-lg font-black text-black mb-2 flex items-center gap-2 uppercase tracking-tight">
            <Lock className="w-5 h-5 text-[#4F81FF]" />
            <span>Zmień swój własny 4-cyfrowy kod PIN:</span>
          </h4>
          <p className="text-xs text-gray-700 font-bold mb-3">
            Ustaw swój własny, osobisty kod PIN, którego nikt inny nie będzie znał!
          </p>

          <form onSubmit={handleChangePinSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md">
            <input
              type="password"
              maxLength={4}
              value={newPinInput}
              onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Wpisz 4 cyfry..."
              className="w-full sm:w-48 px-4 py-2.5 rounded-2xl border-3 border-black font-black text-center text-lg bg-yellow-50 shadow-[2px_2px_0px_black] focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#4F81FF] text-white border-3 border-black font-black px-5 py-2.5 rounded-2xl text-xs uppercase cursor-pointer shadow-[3px_3px_0px_black] hover:bg-blue-600 transition"
            >
              Zapisz Nowy PIN 🔒
            </button>
          </form>

          {pinChangeStatus && (
            <p className={`mt-3 text-xs font-black p-2.5 rounded-xl border-2 max-w-md ${
              pinChangeStatus.startsWith('✅')
                ? 'bg-emerald-100 text-emerald-900 border-emerald-500'
                : 'bg-rose-100 text-rose-900 border-rose-500'
            }`}>
              {pinChangeStatus}
            </p>
          )}
        </div>
      </section>

      {/* Diploma and Certificate Banner */}
      <section className="bg-[#FFD700] p-6 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] text-black">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
              <Award className="w-8 h-8 text-[#FF4F81]" />
              <span>Dyplom Ucznia Klasy 2 📜</span>
            </h3>
            <p className="text-xs sm:text-sm font-bold mt-1">
              Za Twoją ciężką pracę w polskiej szkole! Możesz wydrukować swój pamiątkowy dyplom podpisany przez Panią Małgosię.
            </p>
          </div>

          <button
            onClick={() => {
              confetti({ particleCount: 90, spread: 100 });
              setShowDiplomaModal(true);
            }}
            className="bg-[#FF4F81] text-white border-3 border-black px-6 py-3 rounded-2xl text-xs font-black shadow-[4px_4px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider shrink-0"
          >
            <Printer className="w-5 h-5" />
            <span>Otwórz & Drukuj Dyplom 🖨️</span>
          </button>
        </div>
      </section>

      {/* DIPLOMA MODAL FOR PRINTING */}
      {showDiplomaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFD700] max-w-2xl w-full p-8 rounded-3xl shadow-[10px_10px_0px_black] relative border-4 border-black print:border-8 print:p-8">
            <button
              onClick={() => setShowDiplomaModal(false)}
              className="absolute top-4 right-4 p-2 bg-[#FF4F81] text-white border-2 border-black rounded-xl hover:bg-pink-600 print:hidden cursor-pointer shadow-[2px_2px_0px_black]"
            >
              ✕
            </button>

            {/* Certificate Format */}
            <div className="text-center space-y-4 py-4 border-4 border-dashed border-black p-6 bg-white rounded-2xl shadow-[4px_4px_0px_black]">
              <span className="text-5xl">🇵🇱 🦉 🏆</span>

              <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight drop-shadow-[2px_2px_0px_yellow]">
                DYPLOM UZNANIA
              </h2>

              <p className="text-xs font-black uppercase tracking-widest text-black bg-yellow-200 border border-black py-1 px-3 inline-block rounded-md">
                POLSKA SZKOŁA SOBOTNIA • KLASA 2
              </p>

              <div className="py-2">
                <span className="text-xs text-black font-bold block uppercase">Niniejszy dyplom przyznaje się dla:</span>
                <span className="text-2xl sm:text-4xl font-black text-[#FF4F81] font-serif border-b-4 border-black px-6 py-1 inline-block mt-1">
                  {student.name}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-black font-bold max-w-md mx-auto leading-relaxed">
                Za wspaniałe postępy w nauce języka polskiego, rozwiązywanie zadań domowych,
                poznawanie historii i geografii Polski oraz zdobycie <strong>{student.stars} Gwiazdek ⭐</strong>!
              </p>

              <div className="pt-6 flex justify-between items-end text-xs font-black text-black">
                <div className="text-left">
                  <span>Data: {new Date().toLocaleDateString('pl-PL')}</span>
                </div>

                <div className="text-center">
                  <span className="block border-t-2 border-black px-4 pt-1 font-black">
                    Pani Małgosia & Sówka Pola 🦉
                  </span>
                  <span className="text-[10px] text-gray-700 font-bold">Nauczyciele Klasy 2</span>
                </div>
              </div>
            </div>

            {/* Print Action */}
            <div className="mt-6 flex justify-end print:hidden">
              <button
                onClick={triggerPrintDiploma}
                className="bg-green-400 text-black border-3 border-black px-6 py-3 rounded-xl text-xs font-black shadow-[4px_4px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center gap-2 uppercase"
              >
                <Printer className="w-4 h-4" />
                <span>Drukuj Pamiątkowy Dyplom 🖨️</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
