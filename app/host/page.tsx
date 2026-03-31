"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ChevronLeft, Zap } from "lucide-react"
import Link from "next/link"

interface QuestionDraft {
  question_text: string
  options: string[]
  correct_index: number
  time_limit: number
}

const DEFAULT_QUESTION: QuestionDraft = {
  question_text: "",
  options: ["", "", "", ""],
  correct_index: 0,
  time_limit: 20,
}

export default function HostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [hostName, setHostName] = useState("")
  const [questions, setQuestions] = useState<QuestionDraft[]>([{ ...DEFAULT_QUESTION, options: ["", "", "", ""] }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeQ, setActiveQ] = useState(0)

  const updateQuestion = (idx: number, field: keyof QuestionDraft, value: unknown) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q
      const opts = [...q.options]
      opts[oIdx] = value
      return { ...q, options: opts }
    }))
  }

  const addQuestion = () => {
    setQuestions(prev => [...prev, { ...DEFAULT_QUESTION, options: ["", "", "", ""] }])
    setActiveQ(questions.length)
  }

  const removeQuestion = (idx: number) => {
    if (questions.length === 1) return
    setQuestions(prev => prev.filter((_, i) => i !== idx))
    setActiveQ(prev => Math.max(0, prev - 1))
  }

  const handleCreate = async () => {
    setError("")
    if (!title.trim()) return setError("Please enter a quiz title.")
    if (!hostName.trim()) return setError("Please enter your name.")
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question_text.trim()) return setError(`Question ${i + 1} needs a question text.`)
      if (q.options.some(o => !o.trim())) return setError(`All options in question ${i + 1} must be filled.`)
    }

    setLoading(true)
    try {
      const res = await fetch("/api/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, host_name: hostName, questions }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || "Failed to create quiz.")
      router.push(`/host/${data.quiz.id}`)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const q = questions[activeQ]
  const answerColors = ["bg-[--answer-red]", "bg-[--answer-blue]", "bg-[--answer-yellow]", "bg-[--answer-green]"]
  const answerLabels = ["A", "B", "C", "D"]

  return (
    <main className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Zap className="w-5 h-5 text-primary shrink-0" fill="currentColor" />
          <h1 className="font-bold text-foreground text-lg truncate">Create Quiz</h1>
        </div>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {loading ? "Creating..." : "Launch"}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-6">
        {error && (
          <div className="bg-destructive/20 border border-destructive/40 text-destructive-foreground rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Quiz Info */}
        <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4">
          <h2 className="font-bold text-foreground">Quiz Details</h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-sm font-medium">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. World Geography"
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-sm font-medium">Your Name (Host)</label>
              <input
                type="text"
                value={hostName}
                onChange={e => setHostName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          </div>
        </div>

        {/* Question Tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">Questions ({questions.length})</h2>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Question Selector Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQ(idx)}
                className={`shrink-0 w-9 h-9 rounded-full text-sm font-bold transition-all ${
                  idx === activeQ
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Active Question Editor */}
          <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Question {activeQ + 1}</label>
                <textarea
                  value={q.question_text}
                  onChange={e => updateQuestion(activeQ, "question_text", e.target.value)}
                  placeholder="Type your question here..."
                  rows={2}
                  className="mt-1.5 w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none leading-relaxed"
                />
              </div>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(activeQ)}
                  className="mt-6 p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Time limit */}
            <div className="flex items-center gap-3">
              <label className="text-muted-foreground text-sm font-medium shrink-0">Time limit:</label>
              <div className="flex gap-2">
                {[10, 20, 30, 60].map(t => (
                  <button
                    key={t}
                    onClick={() => updateQuestion(activeQ, "time_limit", t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      q.time_limit === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2">
              <label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Answer Options</label>
              <p className="text-muted-foreground text-xs">Tap an option to set it as correct</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                      q.correct_index === oIdx ? "border-white/60" : "border-transparent"
                    }`}
                    onClick={() => updateQuestion(activeQ, "correct_index", oIdx)}
                  >
                    <div className={`${answerColors[oIdx]} p-1 flex items-center justify-between gap-1`}>
                      <span className="text-white font-bold text-xs px-1.5">{answerLabels[oIdx]}</span>
                      {q.correct_index === oIdx && (
                        <span className="text-white text-xs font-bold px-1.5">✓ Correct</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => { e.stopPropagation(); updateOption(activeQ, oIdx, e.target.value) }}
                      placeholder={`Option ${answerLabels[oIdx]}`}
                      onClick={e => e.stopPropagation()}
                      className={`w-full bg-secondary px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
