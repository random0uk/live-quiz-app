"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, Plus, Trash2, Play, Settings, ChevronRight, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import type { Question, OrganizerSettings } from "@/lib/types"

interface QuestionForm {
  question_text: string
  options: string[]
  correct_index: number
  time_limit: number
}

const DEFAULT_COLORS = [
  { bg: "#6c2bd9", btn: "#a855f7", name: "Purple" },
  { bg: "#2563eb", btn: "#3b82f6", name: "Blue" },
  { bg: "#059669", btn: "#10b981", name: "Green" },
  { bg: "#dc2626", btn: "#ef4444", name: "Red" },
  { bg: "#d97706", btn: "#f59e0b", name: "Orange" },
  { bg: "#db2777", btn: "#ec4899", name: "Pink" },
]

export default function OrganizerDashboard() {
  const router = useRouter()
  const [settings, setSettings] = useState<OrganizerSettings | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizTitle, setQuizTitle] = useState("My Quiz")
  const [themeBg, setThemeBg] = useState("#6c2bd9")
  const [themeBtn, setThemeBtn] = useState("#a855f7")
  const [newPin, setNewPin] = useState("")
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    question_text: "",
    options: ["", "", "", ""],
    correct_index: 0,
    time_limit: 20,
  })

  useEffect(() => {
    const auth = localStorage.getItem("organizer_auth")
    if (auth !== "true") {
      router.push("/")
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    const supabase = createClient()
    const { data: settingsData } = await supabase
      .from("organizer_settings")
      .select("*")
      .eq("id", 1)
      .single()

    if (settingsData) {
      setSettings(settingsData)
      setThemeBg(settingsData.default_theme_bg)
      setThemeBtn(settingsData.default_theme_btn)
      setNewPin(settingsData.pin_code)
    }

    // Load any draft questions from localStorage
    const savedQuestions = localStorage.getItem("draft_questions")
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions))
    }
    const savedTitle = localStorage.getItem("draft_title")
    if (savedTitle) setQuizTitle(savedTitle)

    setLoading(false)
  }

  const addQuestion = () => {
    if (!questionForm.question_text.trim() || questionForm.options.some(o => !o.trim())) {
      return
    }
    const newQ: Question = {
      id: crypto.randomUUID(),
      quiz_id: "",
      question_text: questionForm.question_text,
      options: questionForm.options,
      correct_index: questionForm.correct_index,
      time_limit: questionForm.time_limit,
      position: questions.length,
      created_at: new Date().toISOString(),
    }
    const updated = [...questions, newQ]
    setQuestions(updated)
    localStorage.setItem("draft_questions", JSON.stringify(updated))
    setQuestionForm({
      question_text: "",
      options: ["", "", "", ""],
      correct_index: 0,
      time_limit: 20,
    })
  }

  const removeQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id)
    setQuestions(updated)
    localStorage.setItem("draft_questions", JSON.stringify(updated))
  }

  const saveSettings = async () => {
    const supabase = createClient()
    await supabase
      .from("organizer_settings")
      .update({
        pin_code: newPin,
        default_theme_bg: themeBg,
        default_theme_btn: themeBtn,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
  }

  const startGame = async () => {
    if (questions.length === 0) return
    setStarting(true)

    localStorage.setItem("draft_title", quizTitle)

    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const supabase = createClient()

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        title: quizTitle,
        host_name: "Organizer",
        game_code: gameCode,
        status: "lobby",
        current_question_index: 0,
        theme_bg: themeBg,
        theme_btn: themeBtn,
      })
      .select()
      .single()

    if (quizError || !quizData) {
      setStarting(false)
      return
    }

    const questionsToInsert = questions.map((q, i) => ({
      quiz_id: quizData.id,
      question_text: q.question_text,
      options: q.options,
      correct_index: q.correct_index,
      time_limit: q.time_limit,
      position: i,
    }))

    await supabase.from("questions").insert(questionsToInsert)

    router.push(`/host/${quizData.id}`)
  }

  const logout = () => {
    localStorage.removeItem("organizer_auth")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-xl text-gray-900">QuizBlitz</span>
          </div>
          <Button variant="ghost" onClick={logout} className="text-gray-500">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="quiz" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="quiz" className="text-base font-semibold">Quiz Builder</TabsTrigger>
            <TabsTrigger value="settings" className="text-base font-semibold">Settings</TabsTrigger>
          </TabsList>

          {/* Quiz Builder Tab */}
          <TabsContent value="quiz" className="space-y-6">
            {/* Quiz Title */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Quiz Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Quiz Title</Label>
                  <Input
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title"
                    className="text-lg h-12"
                  />
                </div>

                {/* Theme Color Picker */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Theme Color
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color.bg}
                        onClick={() => {
                          setThemeBg(color.bg)
                          setThemeBtn(color.btn)
                        }}
                        className={`w-12 h-12 rounded-xl transition-all ${
                          themeBg === color.bg ? "ring-4 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.btn})` }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview Bar */}
                <div
                  className="h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: `linear-gradient(135deg, ${themeBg}, ${themeBtn})` }}
                >
                  Preview: {quizTitle || "My Quiz"}
                </div>
              </CardContent>
            </Card>

            {/* Add Question Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Question
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input
                    value={questionForm.question_text}
                    onChange={(e) => setQuestionForm(f => ({ ...f, question_text: e.target.value }))}
                    placeholder="Enter your question"
                    className="text-lg h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {questionForm.options.map((opt, i) => (
                    <div key={i} className="space-y-1">
                      <Label className="text-sm text-gray-500">Option {i + 1}</Label>
                      <div className="relative">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...questionForm.options]
                            newOpts[i] = e.target.value
                            setQuestionForm(f => ({ ...f, options: newOpts }))
                          }}
                          placeholder={`Answer ${i + 1}`}
                          className={`pr-10 ${questionForm.correct_index === i ? "border-green-500 bg-green-50" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setQuestionForm(f => ({ ...f, correct_index: i }))}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            questionForm.correct_index === i
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 hover:border-green-400"
                          }`}
                        >
                          {questionForm.correct_index === i && "✓"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Time Limit</Label>
                    <select
                      value={questionForm.time_limit}
                      onChange={(e) => setQuestionForm(f => ({ ...f, time_limit: Number(e.target.value) }))}
                      className="h-10 px-3 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value={10}>10 seconds</option>
                      <option value={15}>15 seconds</option>
                      <option value={20}>20 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={45}>45 seconds</option>
                      <option value={60}>60 seconds</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={addQuestion}
                  disabled={!questionForm.question_text.trim() || questionForm.options.some(o => !o.trim())}
                  className="w-full h-12 text-lg font-semibold"
                  style={{ background: `linear-gradient(135deg, ${themeBg}, ${themeBtn})` }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>

            {/* Questions List */}
            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Questions ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                        style={{ background: `linear-gradient(135deg, ${themeBg}, ${themeBtn})` }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{q.question_text}</p>
                        <p className="text-sm text-gray-500">{q.time_limit}s • {q.options.length} options</p>
                      </div>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Start Game Button */}
            <Button
              onClick={startGame}
              disabled={questions.length === 0 || starting}
              className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl"
              style={{ background: `linear-gradient(135deg, ${themeBg}, ${themeBtn})` }}
            >
              {starting ? (
                "Creating Game..."
              ) : (
                <>
                  <Play className="w-6 h-6 mr-2" fill="currentColor" />
                  Start Game ({questions.length} questions)
                  <ChevronRight className="w-6 h-6 ml-2" />
                </>
              )}
            </Button>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Change PIN Code</Label>
                  <Input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new PIN"
                    className="text-center text-xl tracking-[0.3em] h-12"
                    maxLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Default Theme Color
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color.bg}
                        onClick={() => {
                          setThemeBg(color.bg)
                          setThemeBtn(color.btn)
                        }}
                        className={`w-12 h-12 rounded-xl transition-all ${
                          themeBg === color.bg ? "ring-4 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.btn})` }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={saveSettings}
                  className="w-full h-12 text-lg font-semibold"
                  style={{ background: `linear-gradient(135deg, ${themeBg}, ${themeBtn})` }}
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
