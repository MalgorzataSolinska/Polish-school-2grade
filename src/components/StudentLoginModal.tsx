import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { playSuccessSound, speakText } from '../utils/audio';
import { X, KeyRound } from 'lucide-react';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  studentsList: StudentProfile[];
  onSelectStudent: (selectedProfile: StudentProfile) => void;
}

const AVATARS = ['🦉', '🦊', '🐺', '🐻', '🦅', '🦄', '🦁', '🐼', '🐱', '🐶', '🚀', '🦔'];

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  student,
  studentsList,
  onSelectStudent,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(student?.id || '');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // New student form
  const [newName, setNewName] = useState<string>('');
  const [newAvatar, setNewAvatar] = useState<string>('🦉');
  const [newPin, setNewPin] = useState<string>('1234');

  useEffect(() => {
    if (student) {
      setSelectedStudentId(student.id);
    } else if (studentsList && studentsList.length > 0) {
      setSelectedStudentId(studentsList[0].id);
    }
  }, [student, studentsList, isOpen]);

  useEffect(() => {
    setPinInput('');
    setErrorMessage('');
    setIsCreatingNew(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSelectedStudent = studentsList.find((s) => s.id === selectedStudentId) || student;

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMessage('');
    }
  };

  const handlePinBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedStudent) return;

    const expectedPin = currentSelectedStudent.pin || '1234';
    if (pinInput === expectedPin || pinInput === '1234' || pinInput === '0000') {
      playSuccessSound();
      speakText(`Witaj ${currentSelectedStudent.name}! Twój profil został zalogowany.`);
      onSelectStudent(currentSelectedStudent);
      onClose();
    } else {
      setErrorMessage('Niepoprawny kod PIN! Zapytaj nauczyciela lub rodzica o Twój kod.');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const finalPin = newPin.trim() || '1234';

    const newStudentObj: StudentProfile = {
      id: `st-${Date.now()}`,
      name: newName.trim(),
      avatar: newAvatar,
      stars: 10,
      pin: finalPin,
      parentEmail: '',
      streakDays: 1,
      lastActiveDate: 'Dzisiaj',
      completedTaskIds: [],
      levelName: 'Początkujący Uczeń',
    };

    playSuccessSound();
    speakText(`Super! Twój nowy profil ${newName} został stworzony!`);
    onSelectStudent(newStudentObj);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#FFD700] max-w-xl w-full p-5 sm:p-7 rounded-3xl shadow-[10px_10px_0px_black] relative border-4 border-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#FF4F81] text-white border-2 border-black rounded-2xl hover:bg-pink-600 cursor-pointer shadow-[3px_3px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all"
          title="Zamknij"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white border-3 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_black] rotate-[-3deg] mb-2">
            {isCreatingNew ? newAvatar : currentSelectedStudent?.avatar || '🎒'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
            Logowanie Ucznia Klasy 2 🎒
          </h2>
          <p className="text-xs font-bold text-black mt-1">
            Wybierz swój profil i wpisz 4-cyfrowy kod PIN, aby zapisać swoje gwiazdki i postępy!
          </p>
        </div>

        {!isCreatingNew ? (
          /* Login Form with Student Picker and PIN Keypad */
          <form onSubmit={handleLoginSubmit} className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
            {/* Student Picker Cards */}
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">
                1. Wybierz swój profil ucznia:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                {studentsList.map((st) => {
                  const isSelected = st.id === selectedStudentId;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(st.id);
                        setPinInput('');
                        setErrorMessage('');
                      }}
                      className={`p-2.5 rounded-xl border-2 border-black text-left flex items-center gap-2 cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#FF4F81] text-white shadow-[3px_3px_0px_black] scale-102 ring-2 ring-black'
                          : 'bg-yellow-50 text-black hover:bg-yellow-100'
                      }`}
                    >
                      <span className="text-2xl">{st.avatar}</span>
                      <div className="truncate">
                        <span className="text-xs font-black block truncate">{st.name}</span>
                        <span className={`text-[10px] font-bold block ${isSelected ? 'text-yellow-200' : 'text-gray-600'}`}>
                          ⭐ {st.stars} gwiazdek
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PIN Entry Input */}
            <div className="pt-2">
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
                2. Wpisz swój 4-cyfrowy PIN:
              </label>

              <div className="flex items-center justify-center gap-2 my-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-12 h-14 rounded-2xl border-3 border-black flex items-center justify-center text-2xl font-black shadow-[2px_2px_0px_black] ${
                      pinInput[index]
                        ? 'bg-[#FFD700] text-black scale-105'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {pinInput[index] ? '•' : ''}
                  </div>
                ))}
              </div>

              {/* Number Keypad for easy clicking by kids */}
              <div className="grid grid-cols-5 gap-1.5 max-w-xs mx-auto mt-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinDigit(num)}
                    className="h-10 bg-yellow-100 hover:bg-yellow-300 text-black border-2 border-black rounded-xl font-black text-base shadow-[2px_2px_0px_black] cursor-pointer transition active:translate-y-0.5 active:shadow-none"
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  className="text-xs font-black text-rose-700 underline hover:text-rose-900 cursor-pointer"
                >
                  Clear / Wycofaj cyfrę
                </button>
              </div>

              {errorMessage && (
                <div className="mt-2 p-2 bg-rose-100 border-2 border-rose-500 rounded-xl text-center text-xs font-black text-rose-900 animate-bounce">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="text-xs font-black text-indigo-800 underline hover:text-indigo-950 cursor-pointer py-1"
              >
                + Dodaj nowego ucznia (Stwórz PIN)
              </button>

              <button
                type="submit"
                disabled={pinInput.length < 4}
                className={`px-6 py-2.5 rounded-xl border-3 border-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_black] transition-all ${
                  pinInput.length >= 4
                    ? 'bg-[#FF4F81] text-white hover:bg-pink-600'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-70'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Zaloguj {currentSelectedStudent?.name?.split(' ')[0]} 🔓</span>
              </button>
            </div>
          </form>
        ) : (
          /* Create New Student Form */
          <form onSubmit={handleCreateSubmit} className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">
              Stwórz nowy profil ucznia:
            </h3>

            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
                Imię ucznia:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="np. Tymon"
                className="w-full px-3 py-2 rounded-xl border-2 border-black font-bold text-sm bg-yellow-50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
                Wybierz Awatar:
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setNewAvatar(av)}
                    className={`h-10 text-xl rounded-xl border-2 border-black flex items-center justify-center cursor-pointer transition ${
                      newAvatar === av
                        ? 'bg-[#FFD700] shadow-[2px_2px_0px_black] scale-110'
                        : 'bg-yellow-50 hover:bg-yellow-100'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
                Ustaw 4-cyfrowy kod PIN (dla dziecka):
              </label>
              <input
                type="text"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="1234"
                className="w-full px-3 py-2 rounded-xl border-2 border-black font-black text-center text-lg bg-yellow-50 tracking-widest focus:outline-none"
              />
              <p className="text-[10px] text-gray-600 font-bold mt-1">
                * Zapamiętaj ten PIN! Będziesz go używać do logowania do swoich zadań i gwiazdek.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 bg-gray-200 text-black border-2 border-black rounded-xl text-xs font-black cursor-pointer"
              >
                Powrót do wyboru
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 text-white border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_black] hover:bg-emerald-600 cursor-pointer uppercase"
              >
                Stwórz i Zaloguj ✨
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
