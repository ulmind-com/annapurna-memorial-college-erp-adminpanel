import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle2, Plus, Play, Download, Trash2, HelpCircle } from 'lucide-react';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';
import { api } from '../../services/api';
import { Course } from '../../types';

export const AIQuizBuilderView: React.FC = () => {
  const { playPop, playSuccess } = useSound();

  const [courses, setCourses] = useState<Course[]>([]);
  const [topic, setTopic] = useState('Piaget Cognitive Stages & Schema Theory');
  const [course, setCourse] = useState('B.Ed. Course 1.1.1: Childhood and Growing Up');
  const [difficulty, setDifficulty] = useState<'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const cList = await api.getCourses();
        setCourses(cList);
        if (cList.length > 0) {
          setCourse(`${cList[0].name} (${cList[0].code})`);
        }
      } catch (e) {
        console.error('Error loading courses:', e);
      }
    };
    loadCourses();
  }, []);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: 'According to Jean Piaget, during which stage does a child develop object permanence?',
      options: [
        'Sensorimotor Stage (0-2 years)',
        'Preoperational Stage (2-7 years)',
        'Concrete Operational Stage (7-11 years)',
        'Formal Operational Stage (11+ years)',
      ],
      correctIndex: 0,
      explanation: 'Object permanence is the understanding that objects continue to exist even when they cannot be seen, heard, or touched, which develops in the sensorimotor stage.',
    },
    {
      id: 2,
      question: 'What term does Piaget use to describe incorporating new information into existing cognitive schemas?',
      options: ['Accommodation', 'Assimilation', 'Equilibration', 'Scaffolding'],
      correctIndex: 1,
      explanation: 'Assimilation occurs when a learner uses existing schemas to interpret new external situations without modifying the base cognitive structure.',
    },
    {
      id: 3,
      question: 'A 9-year-old trainee solves logical math problems with tangible blocks. Which Piagetian developmental phase does this characterize?',
      options: [
        'Preoperational Egocentrism',
        'Concrete Operational Stage',
        'Hypothetico-deductive reasoning',
        'Post-conventional reasoning',
      ],
      correctIndex: 1,
      explanation: 'Concrete operational thought allows logical thinking regarding concrete objects and physical reversibility.',
    },
  ]);

  const handleGenerateAI = () => {
    setIsGenerating(true);
    playPop();

    setTimeout(() => {
      setIsGenerating(false);
      playSuccess();
      const generated = [
        {
          id: questions.length + 1,
          question: `In Vygotskian pedagogy, how is the Zone of Proximal Development (ZPD) best defined in reference to ${topic}?`,
          options: [
            'Distance between actual developmental level and potential level guided by adult scaffolding',
            'Independent ability of a child without any external instructional intervention',
            'Strict biological maturation timeline independent of sociocultural mediation',
            'Standardized memory retention curve measured in written tests',
          ],
          correctIndex: 0,
          explanation: 'ZPD represents the distance between what a learner can achieve independently and what can be achieved under peer or mentor guidance.',
        },
        ...questions,
      ];
      setQuestions(generated);
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>AI Pedagogy Assessment & Quiz Generator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate BSAEU curriculum multiple-choice questions (MCQs), rubrics, and automated formative tests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SoundButton
            onClick={() => alert('Publishing quiz to registered B.Ed. trainees via ERP push...')}
            icon={<Play className="w-4 h-4" />}
            soundType="success"
          >
            Publish to Trainees
          </SoundButton>
        </div>
      </div>

      {/* Generator Configuration Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Curriculum AI Generator Controls</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {courses.length > 0 ? (
                courses.map((c) => (
                  <option key={c.id || c.code} value={`${c.name} (${c.code})`}>
                    {c.code} - {c.name}
                  </option>
                ))
              ) : (
                <option value="B.Ed. (Course 1.1.1: Childhood & Growing Up)">B.Ed. (Course 1.1.1)</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Syllabus Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Thorndike Connectionism, Bruner Discovery Learning"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Taxonomy Level</label>
            <select
              value={difficulty}
              onChange={(e: any) => setDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FOUNDATIONAL">Foundational (Recall & Comprehension)</option>
              <option value="INTERMEDIATE">Intermediate (Application & Analysis)</option>
              <option value="ADVANCED">Advanced (Pedagogical Evaluation & Synthesis)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current pool: <span className="font-bold text-slate-800 dark:text-slate-200">{questions.length} questions</span>
          </div>

          <SoundButton
            onClick={handleGenerateAI}
            disabled={isGenerating}
            icon={<Sparkles className="w-4 h-4 text-white" />}
            soundType="pop"
          >
            {isGenerating ? 'Synthesizing Questions...' : 'Generate New MCQs'}
          </SoundButton>
        </div>
      </div>

      {/* Generated Questions List */}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {q.question}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setQuestions(questions.filter((item) => item.id !== q.id))}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctIndex;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2.5 transition-all ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-700 dark:text-slate-300">Pedagogical Explanation:</strong> {q.explanation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
