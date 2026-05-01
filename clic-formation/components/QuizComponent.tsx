"use client";

import { useState } from "react";
import Link from "next/link";
import { saveQuizScore } from "@/app/lib/actions";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function QuizComponent({ 
  lessonId, 
  questions 
}: { 
  lessonId: number; 
  questions: Question[] 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-slate-500">Aucun quiz disponible pour ce tutoriel pour le moment.</p>
      </div>
    );
  }

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentStep].correctAnswer;
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(async () => {
      if (currentStep < questions.length - 1) {
        setCurrentStep((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsSubmitting(true);
        const finalCorrectCount = score + (isCorrect ? 1 : 0);
        const finalScorePercent = Math.round((finalCorrectCount / questions.length) * 100);
        
        const result = await saveQuizScore(lessonId, finalScorePercent);
        
        if (result?.error) {
          setError("Votre session a expiré. Veuillez vous reconnecter pour enregistrer votre score.");
          setIsSubmitting(false);
        } else {
          setShowResult(true);
          setIsSubmitting(false);
        }
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setError(null);
  };

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-bold text-red-900">Erreur d&apos;enregistrement</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.href = "/login"}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPassed = percentage >= 70;

    return (
      <div className="p-10 bg-white rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
        <div className={cn(
          "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-2",
          isPassed ? "bg-emerald-100" : "bg-orange-100"
        )}>
          {isPassed ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          ) : (
            <AlertCircle className="w-10 h-10 text-orange-600" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-3xl font-extrabold text-slate-900">
            {isPassed ? "Félicitations !" : "Continuez vos efforts !"}
          </h3>
          <p className="text-slate-500 text-lg">
            Vous avez obtenu un score de
          </p>
        </div>

        <div className="text-6xl font-black text-blue-600">
          {percentage}%
        </div>

        <div className="text-sm font-medium text-slate-400">
          {score} réponses correctes sur {questions.length} questions
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={resetQuiz}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Réessayer
          </button>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            Tableau de bord
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[currentStep];

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Évaluation</span>
          <h3 className="text-2xl font-bold text-slate-900">Question {currentStep + 1} <span className="text-slate-300 font-normal">/ {questions.length}</span></h3>
        </div>
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center text-sm font-black text-slate-400">
          {Math.round(((currentStep + 1) / questions.length) * 100)}%
        </div>
      </div>

      <div className="mb-10">
        <p className="text-xl font-medium text-slate-800 leading-relaxed">
          {q.question}
        </p>
      </div>

      <div className="grid gap-4">
        {q.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === q.correctAnswer;
          
          return (
            <button
              key={option}
              disabled={!!selectedAnswer || isSubmitting}
              onClick={() => handleAnswer(option)}
              className={cn(
                "w-full p-5 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group",
                !selectedAnswer 
                  ? "border-slate-100 hover:border-blue-400 hover:bg-blue-50/50" 
                  : isSelected
                    ? isCorrect ? "border-emerald-500 bg-emerald-50" : "border-red-500 bg-red-50"
                    : isCorrect ? "border-emerald-200 bg-emerald-50/30" : "border-slate-50 opacity-50"
              )}
            >
              <span className={cn(
                "font-medium",
                isSelected && isCorrect ? "text-emerald-700" : isSelected ? "text-red-700" : "text-slate-700"
              )}>
                {option}
              </span>
              
              {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {selectedAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
            </button>
          );
        })}
      </div>

      {isSubmitting && (
        <div className="mt-6 text-center text-sm text-slate-400 animate-pulse">
          Enregistrement de vos résultats...
        </div>
      )}
    </div>
  );
}
