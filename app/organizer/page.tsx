"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Play, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { Question, QuestionType } from "@/lib/types"

interface QuestionForm {
  question_text: string
  type: QuestionType
  options: string[]
  correct_index: number
  time_limit: number
}

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  poll: "Poll",
}

const DEFAULT_FORM: QuestionForm = {
  question_text: "",
  type: "multiple_choice",
  options: ["", "", "", ""],
  correct_index: 0,
  time_limit: 20,
}

export default function OrganizerDashboard() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizTitle, setQuizTitle] = useState("My Quiz")
  const [customCode, setCustomCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null)
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [form, setForm] = useState<QuestionForm>(DEFAULT_FORM)

  useEffect(() => {
    if (localStorage.getItem("organizer_auth") !== "true") {
      router.push("/")
      return
    }
    const saved = localStorage.getItem("draft_questions")
    if (saved) setQuestions(JSON.parse(saved))
    const savedTitle = localStorage.getItem("draft_title")
    if (savedTitle) setQuizTitle(savedTitle)
    setLoading(false)
  }, [router])

  // When type changes, reset options accordingly
  const setType = (type: QuestionType) => {
    const options =
      type === "true_false"
        ? ["True", "False"]
        : type === "poll"
        ? ["", "", "", ""]
        : ["", "", "", ""]
    setForm(f => ({ ...f, type, options, correct_index: 0 }))
  }

  const addQuestion = () => {
    const { question_text, type, options, correct_index, time_limit } = form
    if (!question_text.trim()) return
    if (type !== "poll" && options.some(o => !o.trim())) return
    if (type === "poll" && options.filter(o => o.trim()).length < 2) return

    const newQ: Question = {
      id: crypto.randomUUID(),
      quiz_id: "",
      question_text,
      type,
      options: type === "true_false" ? ["True", "False"] : options.filter(o => o.trim()),
      correct_index,
      time_limit,
      position: questions.length,
    }
    const updated = [...questions, newQ]
    setQuestions(updated)
    localStorage.setItem("draft_questions", JSON.stringify(updated))
    setForm(DEFAULT_FORM)
  }

  const removeQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id)
    setQuestions(updated)
    localStorage.setItem("draft_questions", JSON.stringify(updated))
  }

  const createQuiz = async () => {
    if (questions.length === 0) return
    setStarting(true)
    localStorage.setItem("draft_title", quizTitle)
    const gameCode = customCode.trim().toUpperCase() || Math.random().toString(36).substring(2, 8).toUpperCase()
    const supabase = createClient()

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({ title: quizTitle, host_name: "Organizer", game_code: gameCode, status: "lobby", current_question_index: 0, theme_bg: "#0a0a0a", theme_btn: "#7c3aed" })
      .select()
      .single()

    if (quizError || !quizData) { setStarting(false); return }

    const { error: qError } = await supabase.from("questions").insert(
      questions.map((q, i) => ({
        quiz_id: quizData.id,
        question_text: q.question_text,
        type: q.type ?? "multiple_choice",
        options: q.type === "true_false" ? ["True", "False"] : q.options,
        correct_index: q.correct_index ?? 0,
        time_limit: q.time_limit ?? 20,
        position: i,
      }))
    )

    if (qError) {
      console.error("[v0] questions insert error:", qError.message)
      setStarting(false)
      return
    }

    setCreatedQuizId(quizData.id)
    setCreatedCode(gameCode)
    setStarting(false)
  }

  const copyLink = (path: string) => navigator.clipboard.writeText(`${window.location.origin}${path}`)
  const logout = () => { localStorage.removeItem("organizer_auth"); router.push("/") }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (createdQuizId && createdCode) {
    const screenUrl = `/screen/${createdQuizId}`
    const hostUrl = `/host/${createdQuizId}`
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm animate-fade-in">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Quiz Ready</CardTitle>
            <p className="text-muted-foreground text-sm">{quizTitle}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-secondary rounded-xl">
              <p className="text-muted-foreground text-xs mb-1">Join Code</p>
              <p className="text-3xl font-mono font-bold tracking-widest text-primary">{createdCode}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Projector Screen Link</Label>
              <div className="flex gap-2">
                <Input value={screenUrl} readOnly className="font-mono text-xs" />
                <Button size="icon" variant="secondary" onClick={() => copyLink(screenUrl)}><Copy className="w-4 h-4" /></Button>
                <Button size="icon" variant="secondary" onClick={() => window.open(screenUrl, "_blank")}><ExternalLink className="w-4 h-4" /></Button>
              </div>
              <p className="text-muted-foreground text-xs">Open this on the projector before starting</p>
            </div>
            <Button onClick={() => router.push(hostUrl)} className="w-full h-12 font-semibold">
              <Play className="w-4 h-4 mr-2" />
              Go to Control Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Quiz Builder</h1>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground text-xs">Logout</Button>
        </div>

        {/* Quiz details */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Quiz Title</Label>
              <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="Enter quiz title" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Custom Join Code (optional)</Label>
              <Input
                value={customCode}
                onChange={e => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
                placeholder="e.g. FUNQUIZ"
                className="font-mono uppercase tracking-wider"
                maxLength={8}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Question */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Question type tabs */}
            <div className="flex gap-1 p-1 bg-secondary rounded-lg">
              {(["multiple_choice", "true_false", "poll"] as QuestionType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
                    form.type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "multiple_choice" ? "Choice" : t === "true_false" ? "T/F" : "Poll"}
                </button>
              ))}
            </div>

            <Input
              value={form.question_text}
              onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))}
              placeholder="Enter your question"
            />

            {/* Options based on type */}
            {form.type === "true_false" && (
              <div className="grid grid-cols-2 gap-2">
                {["True", "False"].map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, correct_index: i }))}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                      form.correct_index === i
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    {opt}
                    {form.correct_index === i && <span className="ml-1 text-xs">(correct)</span>}
                  </button>
                ))}
              </div>
            )}

            {form.type === "multiple_choice" && (
              <div className="grid grid-cols-2 gap-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="relative">
                    <Input
                      value={opt}
                      onChange={e => {
                        const o = [...form.options]; o[i] = e.target.value
                        setForm(f => ({ ...f, options: o }))
                      }}
                      placeholder={`Option ${i + 1}`}
                      className={`pr-8 text-sm ${form.correct_index === i ? "border-primary bg-primary/10" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, correct_index: i }))}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
                        form.correct_index === i
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 hover:border-primary"
                      }`}
                    >
                      {form.correct_index === i && "✓"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {form.type === "poll" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Add poll options (min 2, no correct answer)</p>
                {form.options.map((opt, i) => (
                  <Input
                    key={i}
                    value={opt}
                    onChange={e => {
                      const o = [...form.options]; o[i] = e.target.value
                      setForm(f => ({ ...f, options: o }))
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="text-sm"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <select
                value={form.time_limit}
                onChange={e => setForm(f => ({ ...f, time_limit: Number(e.target.value) }))}
                className="h-9 px-2 rounded-md border border-input bg-background text-sm"
              >
                <option value={10}>10s</option>
                <option value={15}>15s</option>
                <option value={20}>20s</option>
                <option value={30}>30s</option>
              </select>
              <Button
                onClick={addQuestion}
                disabled={
                  !form.question_text.trim() ||
                  (form.type === "multiple_choice" && form.options.some(o => !o.trim())) ||
                  (form.type === "poll" && form.options.filter(o => o.trim()).length < 2)
                }
                size="sm"
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions list */}
        {questions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{q.question_text}</p>
                    <p className="text-xs text-muted-foreground">{TYPE_LABELS[q.type ?? "multiple_choice"]}</p>
                  </div>
                  <button onClick={() => removeQuestion(q.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button onClick={createQuiz} disabled={questions.length === 0 || starting} className="w-full h-12 font-semibold">
          {starting ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Play className="w-4 h-4 mr-2" />Create Quiz ({questions.length} questions)</>
          )}
        </Button>
      </div>
    </div>
  )
}
