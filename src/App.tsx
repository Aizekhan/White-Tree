import React, { useState, useEffect, useRef } from "react";
import { 
  PenLine, 
  Search, 
  Sparkles, 
  ChevronDown, 
  History, 
  Users, 
  MapPin, 
  Clock, 
  BookOpen, 
  Zap,
  Loader2,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  Target,
  Palette,
  Layers,
  Activity,
  Heart,
  Clapperboard,
  Film,
  Layout,
  Compass,
  Wand2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  NarrativeMode,
  NarrativeAspect,
  NarrativeMemory,
  AnalysisResult,
  Character,
  DetailedScores,
  EditorSuggestion,
  ConsistencyIssue,
  StoryStage,
  TensionPoint,
  NarrativeNode,
  NarrativeLink, 
  QuickFix,
  NarrativeForm,
  ArchitectNarrativeMode,
  NarrativeMedium
} from "./types";
import { ProjectCanon, CanonBase } from "./canon";
import NarrativeMemoryPanel from "./features/memory/components/NarrativeMemoryPanel";
import StoryMap from "./components/StoryMap";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default function App() {
  const [mode, setMode] = useState<NarrativeMode>(NarrativeMode.ARCHITECT);
  const [aspect, setAspect] = useState<NarrativeAspect>(NarrativeAspect.PLOT_STRUCTURE);
  const [narrativeForm, setNarrativeForm] = useState<NarrativeForm>(NarrativeForm.PROSE);
  const [architectNarrativeMode, setArchitectNarrativeMode] = useState<ArchitectNarrativeMode>(ArchitectNarrativeMode.MIXED);
  const [narrativeMedium, setNarrativeMedium] = useState<NarrativeMedium>(NarrativeMedium.NOVEL);
  const [text, setText] = useState("");
  const [activeScene, setActiveScene] = useState<{
    act: string;
    chapter: string;
    scene: string;
    title: string;
    description: string;
    goals: string[];
    conflicts: string[];
  } | null>(null);
  const [sceneProgress, setSceneProgress] = useState<Record<string, "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted">>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const updateSceneStatus = (sceneTitle: string, status: "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted") => {
    setSceneProgress(prev => ({
      ...prev,
      [sceneTitle]: status
    }));
  };
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showMemory, setShowMemory] = useState(false);
  const [memory, setMemory] = useState<NarrativeMemory>({
    characters: [],
    locations: [],
    timeline: [],
    worldRules: [],
    plotEvents: [],
  });

  // Canon System state (Phase 2.3 — inferred entities confirmation queue)
  const [canon, setCanon] = useState<ProjectCanon | undefined>(undefined);

  // Load test canon data for demo (Phase 2.3)
  const loadTestCanon = () => {
    setCanon({
      characters: [
        {
          id: "char_krig",
          slug: "krig",
          name: "Кріг",
          type: "characters",
          role: "Дослідник",
          trait: "Цілеспрямований",
          goal: "Знайти джерело сигналу",
          developmentArc: "Від скептика до віруючого",
          origin: { source: "inferred", confidence: 0.9, confirmed: false, createdBy: "migration", updatedAt: Date.now() },
          relations: [{ id: "char_ivy", kind: "довіряє", confidence: 0.8 }]
        },
        {
          id: "char_ivy",
          slug: "aivi",
          name: "Айві",
          type: "characters",
          role: "Технік",
          trait: "Розумна",
          goal: "Розшифрувати сигнал",
          developmentArc: "Навчається довіряти інтуїції",
          origin: { source: "inferred", confidence: 0.85, confirmed: false, createdBy: "migration", updatedAt: Date.now() }
        },
        {
          id: "char_victor",
          slug: "viktor",
          name: "Віктор",
          type: "characters",
          role: "Командир",
          trait: "Авторитарний",
          goal: "Зберегти секретність",
          developmentArc: "Розкриває приховану мотивацію",
          origin: { source: "inferred", confidence: 0.7, confirmed: false, createdBy: "migration", updatedAt: Date.now() }
        }
      ],
      locations: [
        {
          id: "loc_horizon",
          slug: "stantsiya-gorizont",
          name: "Станція \"Горизонт\"",
          type: "locations",
          desc: "Арктична дослідна база",
          origin: { source: "inferred", confidence: 0.95, confirmed: false, createdBy: "migration", updatedAt: Date.now() }
        },
        {
          id: "loc_lab",
          slug: "pidzemna-laboratoriya",
          name: "Підземна лабораторія",
          type: "locations",
          desc: "Секретний об'єкт під льодом",
          origin: { source: "inferred", confidence: 0.8, confirmed: false, createdBy: "migration", updatedAt: Date.now() }
        }
      ],
      events: [
        {
          id: "evt_signal",
          slug: "viyavlennya-signalu",
          name: "Виявлення сигналу",
          type: "events",
          when: "День 1",
          act: 1,
          origin: { source: "inferred", confidence: 1.0, confirmed: false, createdBy: "migration", updatedAt: Date.now() }
        },
        {
          id: "evt_decode",
          slug: "rozshifrovka",
          name: "Розшифровка",
          type: "events",
          when: "День 3",
          act: 2,
          origin: { source: "inferred", confidence: 0.9, confirmed: false, createdBy: "migration", updatedAt: Date.now() }
        }
      ],
      factions: [],
      artifacts: [
        {
          id: "art_signal",
          slug: "anomalnyi-signal",
          name: "Аномальний сигнал",
          type: "artifacts",
          desc: "Загадкова передача з глибин льоду",
          origin: { source: "inferred", confidence: 1.0, confirmed: false, createdBy: "migration", updatedAt: Date.now() }
        }
      ],
      world: { rules: ["Сигнал йде з глибин льоду", "Температура критична", "Зв'язок обмежений"] }
    });
    console.log("[Canon] Loaded test canon data (7 inferred entities)");
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  const applyQuickFix = (fix: QuickFix) => {
    if (!fix.targetText || !fix.improvement) return;
    // Use a more robust replacement that handles potential multiple occurrences by taking the first one
    // or we could ask the AI to be very specific.
    const index = text.indexOf(fix.targetText);
    if (index === -1) {
      alert("Could not find the original text in the editor to apply the fix.");
      return;
    }
    
    const newText = text.slice(0, index) + fix.improvement + text.slice(index + fix.targetText.length);
    setText(newText);
  };

  const handleWriteScene = (
    actTitle: string, 
    chapterTitle: string, 
    sceneTitle: string, 
    sceneDescription: string,
    goals: string[] = [],
    conflicts: string[] = []
  ) => {
    setActiveScene({
      act: actTitle,
      chapter: chapterTitle,
      scene: sceneTitle,
      title: sceneTitle,
      description: sceneDescription,
      goals,
      conflicts
    });
    const scenePrompt = `Scene: ${sceneTitle}\nDescription: ${sceneDescription}\n\n`;
    setText(scenePrompt);
    setMode(NarrativeMode.WRITE);
    setResult(null);
    if (!sceneProgress[sceneTitle]) {
      updateSceneStatus(sceneTitle, "Planned");
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (textAreaRef.current) {
      textAreaRef.current.focus();
      setTimeout(() => {
        textAreaRef.current?.setSelectionRange(0, scenePrompt.length);
      }, 100);
    }
  };

  const scrollToScene = (segment: string) => {
    if (!textAreaRef.current) return;
    const index = text.indexOf(segment);
    if (index !== -1) {
      textAreaRef.current.focus();
      textAreaRef.current.setSelectionRange(index, index + segment.length);
      // Modern browsers scroll to selection automatically on focus()
      // but we can also manually scroll if needed.
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      let modeInstruction = "";
      let responseProperties: any = {};
      let requiredFields: string[] = [];

      if (mode === NarrativeMode.WRITE) {
        modeInstruction = `Write a new scene or continue the story based on the user's input and context. 
          
          CRITICAL CONTEXT:
          - Use the Active Scene Context (Title, Description, Goal, Conflict) as the primary blueprint for this scene.
          - Consult Narrative Memory (Characters, Locations, World Rules) to ensure absolute consistency.
          
          Guidelines for Narrative Generation:
          - Selected Aspect: Focus on ${aspect}.
          - Show, Don't Tell: Present information through observation, dialogue, or action.
          - Sensory Focus: Prioritize sensory experience and character reactions.
          - Lore Consistency: Do not contradict established facts in Narrative Memory.
          
          ONLY return the generated text in the "improvedText" field. Do not perform any analysis.`;
        
        responseProperties = {
          improvedText: { type: Type.STRING }
        };
        requiredFields = ["improvedText"];
      } else if (mode === NarrativeMode.ANALYZE) {
        modeInstruction = `Perform a complete narrative diagnostic of the provided text. 
          
          CRITICAL ANALYSIS TASKS:
          1. Consistency Check: Compare the text against Narrative Memory (Characters, Locations, World Rules) and Active Scene Context (Goal, Conflict). Identify any contradictions.
          2. Goal Progression: Evaluate if the scene successfully addresses the defined Scene Goal.
          3. Conflict Resolution: Analyze how the Scene Conflict is introduced or handled.
          4. Transition Quality: If multiple scenes are present or implied, evaluate the flow between them.
          5. Narrative Diagnostic: Provide scores, strengths, weaknesses, and specific suggestions for improvement.
          
          Ensure all fields in the JSON schema are populated with high-quality, professional insights.`;
        
        responseProperties = {
          score: { type: Type.NUMBER },
          detailedScores: {
            type: Type.OBJECT,
            properties: {
              plot: { type: Type.NUMBER },
              characters: { type: Type.NUMBER },
              conflict: { type: Type.NUMBER },
              atmosphere: { type: Type.NUMBER },
              dialogue: { type: Type.NUMBER },
              style: { type: Type.NUMBER },
            },
            required: ["plot", "characters", "conflict", "atmosphere", "dialogue", "style"],
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          editorSuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                suggested: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["original", "suggested", "reason"],
            }
          },
          quickFixes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                issue: { type: Type.STRING },
                improvement: { type: Type.STRING },
                targetText: { type: Type.STRING },
              },
              required: ["issue", "improvement", "targetText"],
            }
          },
          consistencyIssues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                contradiction: { type: Type.STRING },
              },
              required: ["type", "description", "contradiction"],
            }
          },
          storyStructure: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stage: { type: Type.STRING },
                description: { type: Type.STRING },
                found: { type: Type.BOOLEAN },
                textSnippet: { type: Type.STRING },
              },
              required: ["stage", "description", "found"],
            }
          },
          tensionAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                segment: { type: Type.STRING },
                level: { type: Type.NUMBER },
                pacing: { type: Type.STRING },
                hasConflict: { type: Type.BOOLEAN },
                note: { type: Type.STRING },
              },
              required: ["segment", "level", "pacing", "hasConflict", "note"],
            }
          },
          storyGoal: {
            type: Type.OBJECT,
            properties: {
              protagonist: { type: Type.STRING },
              mainGoal: { type: Type.STRING },
              obstacles: { type: Type.ARRAY, items: { type: Type.STRING } },
              stakes: { type: Type.STRING },
              progression: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    segment: { type: Type.STRING },
                    status: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["segment", "status", "description"],
                }
              }
            },
            required: ["protagonist", "mainGoal", "obstacles", "stakes", "progression"],
          },
          themes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                prevalence: { type: Type.NUMBER },
                supportByScenes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      segment: { type: Type.STRING },
                      strength: { type: Type.NUMBER },
                      description: { type: Type.STRING },
                    },
                    required: ["segment", "strength", "description"],
                  }
                }
              },
              required: ["name", "description", "prevalence", "supportByScenes"],
            }
          },
          sceneAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                segment: { type: Type.STRING },
                purposes: { type: Type.ARRAY, items: { type: Type.STRING } },
                impact: { type: Type.NUMBER },
                description: { type: Type.STRING },
              },
              required: ["segment", "purposes", "impact", "description"],
            }
          },
          transitions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                fromScene: { type: Type.STRING },
                toScene: { type: Type.STRING },
                quality: { type: Type.NUMBER },
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                suggestion: { type: Type.STRING },
              },
              required: ["fromScene", "toScene", "quality", "type", "description", "suggestion"],
            }
          },
          narrativeFormat: {
            type: Type.OBJECT,
            properties: {
              form: { type: Type.STRING },
              mode: { type: Type.STRING },
              medium: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["form", "mode", "medium", "explanation"],
          },
          storyMap: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["id", "label", "type"],
                }
              },
              links: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    relation: { type: Type.STRING },
                  },
                  required: ["source", "target", "relation"],
                }
              }
            },
            required: ["nodes", "links"],
          }
        };
        requiredFields = ["score", "detailedScores", "strengths", "weaknesses", "suggestions", "editorSuggestions", "quickFixes", "consistencyIssues", "storyStructure", "tensionAnalysis", "storyGoal", "themes", "sceneAnalysis", "transitions", "narrativeFormat", "storyMap"];
      } else if (mode === NarrativeMode.IMPROVE) {
        modeInstruction = `Improve the provided text by rewriting weak sections, focusing on: ${aspect}. 
          
          CONSTRAINTS:
          - DO NOT change the plot, character goals, or established facts.
          - Enhance the prose, pacing, and emotional resonance while maintaining the original voice.
          - Ensure consistency with Narrative Memory and Active Scene Context.
          
          Return the improved text in "improvedText" and provide specific "editorSuggestions".`;
        
        responseProperties = {
          improvedText: { type: Type.STRING },
          editorSuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                suggested: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["original", "suggested", "reason"],
            }
          }
        };
        requiredFields = ["improvedText", "editorSuggestions"];
      } else if (mode === NarrativeMode.ADAPT) {
        modeInstruction = `Convert the provided narrative text into a structured, professional scene-based screenplay. 
          
          FORMATTING RULES:
          - Use standard sluglines: INT. or EXT. LOCATION - TIME OF DAY.
          - Character names must be in ALL CAPS before dialogue.
          - Action lines should be concise and present tense.
          - Include parentheticals for emotional direction where necessary.
          
          Identify scenes, locations, characters, and suggest visual shots. Return the result in the "script" object.`;
        
        responseProperties = {
          script: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.NUMBER },
                    slugline: { type: Type.STRING },
                    location: { type: Type.STRING },
                    characters: { type: Type.ARRAY, items: { type: Type.STRING } },
                    elements: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING },
                          character: { type: Type.STRING },
                          text: { type: Type.STRING },
                        },
                        required: ["type", "text"],
                      }
                    }
                  },
                  required: ["sceneNumber", "slugline", "location", "characters", "elements"],
                }
              }
            },
            required: ["title", "scenes"],
          }
        };
        requiredFields = ["script"];
      } else if (mode === NarrativeMode.ARCHITECT) {
        modeInstruction = `Generate a full story structure from a short idea. Create a full narrative outline including ACT I, ACT II, and ACT III. For each act, include chapters, scenes, character goals, and conflicts. Also, provide a storyMap with nodes and links.`;
        
        responseProperties = {
          architecture: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              premise: { type: Type.STRING },
              acts: {
                type: Type.OBJECT,
                properties: {
                  act1: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      milestones: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ["label", "description"],
                        }
                      },
                      chapters: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            scenes: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  title: { type: Type.STRING },
                                  description: { type: Type.STRING },
                                  characterGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
                                  conflicts: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                                required: ["title", "description", "characterGoals", "conflicts"],
                              }
                            }
                          },
                          required: ["title", "scenes"],
                        }
                      }
                    },
                    required: ["title", "description", "milestones", "chapters"],
                  },
                  act2: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      milestones: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ["label", "description"],
                        }
                      },
                      chapters: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            scenes: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  title: { type: Type.STRING },
                                  description: { type: Type.STRING },
                                  characterGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
                                  conflicts: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                                required: ["title", "description", "characterGoals", "conflicts"],
                              }
                            }
                          },
                          required: ["title", "scenes"],
                        }
                      }
                    },
                    required: ["title", "description", "milestones", "chapters"],
                  },
                  act3: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      milestones: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ["label", "description"],
                        }
                      },
                      chapters: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            scenes: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  title: { type: Type.STRING },
                                  description: { type: Type.STRING },
                                  characterGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
                                  conflicts: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                                required: ["title", "description", "characterGoals", "conflicts"],
                              }
                            }
                          },
                          required: ["title", "scenes"],
                        }
                      }
                    },
                    required: ["title", "description", "milestones", "chapters"],
                  },
                },
                required: ["act1", "act2", "act3"],
              }
            },
            required: ["title", "premise", "acts"],
          },
          storyMap: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["id", "label", "type"],
                }
              },
              links: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    relation: { type: Type.STRING },
                  },
                  required: ["source", "target", "relation"],
                }
              }
            },
            required: ["nodes", "links"],
          }
        };
        requiredFields = ["architecture", "storyMap"];
      }

      const systemInstruction = `
        You are an expert Narrative Writer and Editor. Your goal is to help the user ${mode.toLowerCase()} their story.
        
        Current Mode: ${mode}
        Selected Narrative Aspect: ${aspect}
        
        Narrative Memory (Context):
        - Characters: ${memory.characters.map(c => `${c.name} (Role: ${c.role}, Trait: ${c.trait}, Goals: ${c.goals}, Relationships: ${c.relationships}, Arc: ${c.developmentArc})`).join("; ") || "None"}
        - Locations: ${memory.locations.join(", ") || "None"}
        - Timeline: ${memory.timeline.join(", ") || "None"}
        - World Rules: ${memory.worldRules.join(", ") || "None"}
        - Plot Events: ${memory.plotEvents.join(", ") || "None"}
        
        ${activeScene && mode !== NarrativeMode.ARCHITECT ? `
        Current Scene Context:
        Act: ${activeScene.act}
        Chapter: ${activeScene.chapter}
        Scene: ${activeScene.title}
        
        Description:
        ${activeScene.description}
        
        Goal:
        ${activeScene.goals.join(", ") || "None"}
        
        Conflict:
        ${activeScene.conflicts.join(", ") || "None"}
        
        You are currently working on this specific scene. Ensure your ${mode.toLowerCase()} is consistent with this context.
        ` : ""}
        
        Instructions for ${mode}:
        ${modeInstruction}
        
        Return the response in JSON format.
      `;

      const prompt = `
${mode === NarrativeMode.ARCHITECT ? `
Narrative Form: ${narrativeForm}
Narrative Mode: ${architectNarrativeMode}
Narrative Medium: ${narrativeMedium}
` : ""}

Story Text/Idea:
${text}

${mode === NarrativeMode.ARCHITECT ? "Generate a full story architecture with acts and scenes based on the idea above." : mode === NarrativeMode.ANALYZE ? "Analyze the narrative text provided above and perform a full diagnostic." : mode === NarrativeMode.WRITE ? "Write the scene based on the context." : mode === NarrativeMode.IMPROVE ? "Improve the scene text." : "Adapt the scene to script format."}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: responseProperties,
            required: requiredFields
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);

      if (activeScene) {
        if (mode === NarrativeMode.WRITE) updateSceneStatus(activeScene.title, "Drafted");
        else if (mode === NarrativeMode.ANALYZE) updateSceneStatus(activeScene.title, "Analyzed");
        else if (mode === NarrativeMode.IMPROVE) updateSceneStatus(activeScene.title, "Improved");
        else if (mode === NarrativeMode.ADAPT) updateSceneStatus(activeScene.title, "Adapted");
      }

      // Sync architecture to memory if available
      if (data.architecture && data.storyMap) {
        const newCharacters = data.storyMap.nodes
          .filter((n: any) => n.type === 'character')
          .map((n: any) => ({
            name: n.label,
            role: "Generated Character",
            trait: "TBD",
            goals: n.description || "Generated by Architect",
            relationships: "Part of the generated story",
            developmentArc: "TBD"
          }));
        
        const newLocations = data.storyMap.nodes
          .filter((n: any) => n.type === 'location')
          .map((n: any) => n.label);
          
        const newEvents = data.storyMap.nodes
          .filter((n: any) => n.type === 'event')
          .map((n: any) => n.label);

        // Add to memory if not already present
        newCharacters.forEach((char: Character) => {
          if (!memory.characters.some(c => c.name.toLowerCase() === char.name.toLowerCase())) {
            addCharacterMemory(char);
          }
        });
        
        newLocations.forEach((loc: string) => {
          if (!memory.locations.some(l => l.toLowerCase() === loc.toLowerCase())) {
            addStringMemory('locations', loc);
          }
        });

        newEvents.forEach((evt: string) => {
          if (!memory.plotEvents.some(e => e.toLowerCase() === evt.toLowerCase())) {
            addStringMemory('plotEvents', evt);
          }
        });
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addStringMemory = (key: keyof Omit<NarrativeMemory, 'characters'>, value: string) => {
    if (!value.trim()) return;
    setMemory(prev => ({
      ...prev,
      [key]: [...(prev[key] as string[]), value.trim()]
    }));
  };

  const addCharacterMemory = (char: Character) => {
    setMemory(prev => ({
      ...prev,
      characters: [...prev.characters, char]
    }));
  };

  const removeFromMemory = (key: keyof NarrativeMemory, index: number) => {
    setMemory(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((_, i) => i !== index)
    }));
  };

  // Canon handlers (Phase 2.3)
  const handleConfirmCanonEntity = (entityId: string, entityType: string) => {
    if (!canon) return;

    setCanon((prev) => {
      if (!prev) return prev;

      // Find entity and mark as confirmed
      const typeKey = entityType as keyof ProjectCanon;
      const entities = prev[typeKey] as any[];

      return {
        ...prev,
        [typeKey]: entities.map(e =>
          e.id === entityId
            ? { ...e, origin: { ...e.origin, confirmed: true, updatedAt: Date.now() } }
            : e
        )
      };
    });

    console.log(`[Canon] Confirmed ${entityType}/${entityId}`);
  };

  const handleRejectCanonEntity = (entityId: string, entityType: string) => {
    if (!canon) return;

    setCanon((prev) => {
      if (!prev) return prev;

      // Remove entity
      const typeKey = entityType as keyof ProjectCanon;
      const entities = prev[typeKey] as any[];

      return {
        ...prev,
        [typeKey]: entities.filter(e => e.id !== entityId)
      };
    });

    console.log(`[Canon] Rejected ${entityType}/${entityId}`);
  };

  const handleEditCanonEntity = (entity: CanonBase, entityType: string) => {
    // TODO (Phase 2.3.1): Implement edit modal
    console.log(`[Canon] Edit ${entityType}/${entity.id} (not implemented yet)`);
    alert(`Edit entity: ${entity.name}\n\n(Edit modal coming in Phase 2.3.1)`);
  };

  const ScoreBar = ({ label, score }: { label: string, score: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-ink/60">
        <span>{label}</span>
        <span>{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full bg-ink/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          className="h-full bg-violet-500 rounded-full"
        />
      </div>
    </div>
  );

  const CharacterTracker = () => {
    const [newChar, setNewChar] = useState<Character>({ name: "", role: "", trait: "", goals: "", relationships: "", developmentArc: "" });
    const [isAdding, setIsAdding] = useState(false);

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-ink/60 text-sm font-medium uppercase tracking-wider">
            <Users size={14} />
            Character Tracker
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs bg-ink/5 hover:bg-ink/10 px-2 py-1 rounded-md transition-all"
          >
            {isAdding ? "Cancel" : "Add Character"}
          </button>
        </div>

        {isAdding && (
          <div className="bg-ink/5 p-4 rounded-xl space-y-3 mb-4">
            <input 
              placeholder="Name" 
              className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
              value={newChar.name}
              onChange={e => setNewChar({...newChar, name: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-2">
              <input 
                placeholder="Role" 
                className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                value={newChar.role}
                onChange={e => setNewChar({...newChar, role: e.target.value})}
              />
              <input 
                placeholder="Trait" 
                className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                value={newChar.trait}
                onChange={e => setNewChar({...newChar, trait: e.target.value})}
              />
            </div>
            <input 
              placeholder="Goals" 
              className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
              value={newChar.goals}
              onChange={e => setNewChar({...newChar, goals: e.target.value})}
            />
            <input 
              placeholder="Relationships" 
              className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
              value={newChar.relationships}
              onChange={e => setNewChar({...newChar, relationships: e.target.value})}
            />
            <input 
              placeholder="Development Arc" 
              className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
              value={newChar.developmentArc}
              onChange={e => setNewChar({...newChar, developmentArc: e.target.value})}
            />
            <button 
              onClick={() => {
                if (newChar.name) {
                  addCharacterMemory(newChar);
                  setNewChar({ name: "", role: "", trait: "", goals: "", relationships: "", developmentArc: "" });
                  setIsAdding(false);
                }
              }}
              className="w-full bg-ink text-paper py-2 rounded-lg text-sm font-medium"
            >
              Save Character
            </button>
          </div>
        )}

        <div className="space-y-3">
          {memory.characters.map((char, idx) => (
            <div key={idx} className="bg-white border border-ink/5 p-4 rounded-xl shadow-sm group relative">
              <button 
                onClick={() => removeFromMemory('characters', idx)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-ink/20 hover:text-red-500 transition-all"
              >
                <X size={14} />
              </button>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm">{char.name}</h4>
                <span className="text-[9px] font-bold uppercase tracking-widest text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">
                  {char.role}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-[11px]">
                <div className="flex gap-2">
                  <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Trait:</span>
                  <span className="text-ink/70">{char.trait}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Goals:</span>
                  <span className="text-ink/70">{char.goals}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Rel:</span>
                  <span className="text-ink/70">{char.relationships}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Arc:</span>
                  <span className="text-ink/70">{char.developmentArc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MemorySection = ({ title, icon: Icon, items, onAdd, onRemove }: { 
    title: string, 
    icon: any, 
    items: string[], 
    onAdd: (val: string) => void,
    onRemove: (idx: number) => void
  }) => {
    const [input, setInput] = useState("");
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-ink/60 text-sm font-medium uppercase tracking-wider">
            <Icon size={14} />
            {title}
          </div>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between group bg-ink/5 px-3 py-1.5 rounded-lg text-sm">
              <span className="truncate">{item}</span>
              <button 
                onClick={() => onRemove(idx)}
                className="opacity-0 group-hover:opacity-100 text-ink/40 hover:text-red-500 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onAdd(input);
                  setInput("");
                }
              }}
              placeholder={`Add ${title.toLowerCase()}...`}
              className="w-full bg-transparent border-b border-ink/10 py-1 text-sm focus:border-ink/30 outline-none placeholder:text-ink/20"
            />
            <button 
              onClick={() => { onAdd(input); setInput(""); }}
              className="absolute right-0 top-1 text-ink/40 hover:text-ink"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-ink/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ink text-paper rounded-xl flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl leading-tight">AI Narrative Writer</h1>
              <p className="text-[10px] text-ink/40 uppercase tracking-widest font-medium">Professional Story Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMemory(!showMemory)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                showMemory ? "bg-ink text-paper" : "bg-ink/5 text-ink hover:bg-ink/10"
              )}
            >
              <History size={16} />
              Memory
            </button>

            {/* Test Canon Data Button (Phase 2.3 demo) */}
            <button
              onClick={loadTestCanon}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all bg-violet-100 text-violet-700 hover:bg-violet-200"
              title="Load test canon data to see inferred entities queue"
            >
              🧪 Test Canon
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor & Content Generation */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 border-r border-ink/5 bg-paper/30">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Workflow Step Bar */}
            <div className="flex flex-col gap-6 mb-12">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Creative Workflow</h2>
                {mode !== NarrativeMode.ARCHITECT && (
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                    <span>Focus:</span>
                    <div className="relative">
                      <select 
                        value={aspect}
                        onChange={(e) => setAspect(e.target.value as NarrativeAspect)}
                        className="appearance-none bg-transparent font-bold text-violet-600 border-b border-violet-200 pr-6 cursor-pointer focus:outline-none"
                      >
                        {Object.values(NarrativeAspect).map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-2 py-4 border-b border-ink/5">
                {[
                  { id: NarrativeMode.ARCHITECT, label: "Architect", icon: Layout },
                  { id: NarrativeMode.WRITE, label: "Write", icon: PenLine },
                  { id: NarrativeMode.ANALYZE, label: "Analyze", icon: Search },
                  { id: NarrativeMode.IMPROVE, label: "Improve", icon: Sparkles },
                  { id: NarrativeMode.ADAPT, label: "Adapt", icon: Clapperboard },
                ].map((step, i, arr) => {
                  const workflowOrder = [NarrativeMode.ARCHITECT, NarrativeMode.WRITE, NarrativeMode.ANALYZE, NarrativeMode.IMPROVE, NarrativeMode.ADAPT];
                  const currentStepIdx = workflowOrder.indexOf(mode);
                  const stepIdx = workflowOrder.indexOf(step.id);
                  
                  return (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setMode(step.id)}>
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                          mode === step.id 
                            ? "bg-violet-600 text-white shadow-lg shadow-violet-200 scale-110" 
                            : "bg-ink/5 text-ink/30 group-hover:bg-ink/10 group-hover:text-ink/50"
                        )}>
                          <step.icon size={18} />
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest transition-colors",
                          mode === step.id ? "text-violet-600" : "text-ink/30"
                        )}>
                          {step.label}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex-1 h-px bg-ink/5 mx-4 relative">
                          <div className={cn(
                            "absolute inset-0 bg-violet-200 transition-all duration-500 origin-left",
                            currentStepIdx > i ? "scale-x-100" : "scale-x-0"
                          )} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Narrative Format Layer (Architect Mode Only) */}
            <AnimatePresence>
              {mode === NarrativeMode.ARCHITECT && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="narrative-card p-6 bg-violet-50/30 border-violet-100 space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-600">
                      <Layout size={14} />
                      Narrative Format Layer
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-ink/40">Narrative Form</label>
                        <div className="relative">
                          <select 
                            value={narrativeForm}
                            onChange={(e) => setNarrativeForm(e.target.value as NarrativeForm)}
                            className="w-full appearance-none bg-white border border-ink/5 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            {Object.values(NarrativeForm).map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-ink/40">Narrative Mode</label>
                        <div className="relative">
                          <select 
                            value={architectNarrativeMode}
                            onChange={(e) => setArchitectNarrativeMode(e.target.value as ArchitectNarrativeMode)}
                            className="w-full appearance-none bg-white border border-ink/5 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            {Object.values(ArchitectNarrativeMode).map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-ink/40">Narrative Medium</label>
                        <div className="relative">
                          <select 
                            value={narrativeMedium}
                            onChange={(e) => setNarrativeMedium(e.target.value as NarrativeMedium)}
                            className="w-full appearance-none bg-white border border-ink/5 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
                          >
                            {Object.values(NarrativeMedium).map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Scene Context Panel */}
            {activeScene && mode !== NarrativeMode.ARCHITECT && (
              <div className="narrative-card p-4 bg-white border-violet-100 shadow-lg shadow-violet-100/20 mb-6 border-l-4 border-l-violet-500">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-500/60">
                      <span>{activeScene.act}</span>
                      <ArrowRight size={10} />
                      <span>{activeScene.chapter}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Scene:</span>
                        <span className="text-sm font-serif font-bold text-ink">{activeScene.title}</span>
                      </div>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60">Goal:</span>
                        <span className="text-[11px] text-ink/70">{activeScene.goals.join(", ") || "N/A"}</span>
                      </div>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-600/60">Conflict:</span>
                        <span className="text-[11px] text-ink/70">{activeScene.conflicts.join(", ") || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setMode(NarrativeMode.ARCHITECT)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-ink/5 hover:bg-ink/10 text-[9px] font-bold uppercase tracking-widest transition-all text-ink/40"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Editor Area */}
            <div className={cn(
              "narrative-card p-8 min-h-[500px] flex flex-col shadow-xl shadow-ink/5 transition-all duration-500",
              activeScene && mode !== NarrativeMode.ARCHITECT ? "ring-2 ring-violet-500/20 border-violet-200 bg-violet-50/5" : ""
            )}>
              <textarea
                ref={textAreaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  mode === NarrativeMode.WRITE 
                    ? "Start writing your story or describe a scene you want to generate..." 
                    : "Paste your story here for analysis or improvement..."
                }
                className="input-field flex-1 text-lg leading-relaxed font-serif"
              />
              <div className="mt-6 flex items-center justify-between border-t border-ink/5 pt-6">
                <div className="flex items-center gap-4">
                  <div className="text-xs text-ink/30 font-mono">
                    {text.split(/\s+/).filter(Boolean).length} words
                  </div>
                  <button 
                    onClick={() => { setText(""); setResult(null); }}
                    className="text-ink/30 hover:text-red-500 transition-colors"
                    title="Clear Editor"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !text.trim()}
                    className="btn-primary flex items-center gap-2 px-8"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {mode === NarrativeMode.WRITE ? <PenLine size={18} /> : mode === NarrativeMode.ANALYZE ? <Search size={18} /> : mode === NarrativeMode.ADAPT ? <Clapperboard size={18} /> : mode === NarrativeMode.ARCHITECT ? <Layout size={18} /> : <Sparkles size={18} />}
                        {mode === NarrativeMode.WRITE ? "Generate Narrative" : mode === NarrativeMode.ANALYZE ? "Full Story Analysis" : mode === NarrativeMode.ADAPT ? "Adapt to Script" : mode === NarrativeMode.ARCHITECT ? "Generate Story Architecture" : "Improve Text"}
                      </>
                    )}
                  </button>
                  {mode === NarrativeMode.ANALYZE && !isAnalyzing && (
                    <p className="text-[10px] text-ink/30 font-medium uppercase tracking-wider">
                      Performs a complete narrative diagnostic
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Content (Improved Text / Script / Architecture) */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 pb-20"
                >
                  {result.architecture && mode === NarrativeMode.ARCHITECT && (
                    <div className="narrative-card p-8 space-y-12 border-violet-100 bg-violet-50/10">
                      <div className="border-b border-ink/10 pb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-violet-600 text-paper flex items-center justify-center shadow-lg shadow-violet-200">
                            <Layout size={24} />
                          </div>
                          <div>
                            <h2 className="font-serif text-3xl font-bold text-ink">{result.architecture.title}</h2>
                            <p className="text-xs text-ink/40 uppercase tracking-widest font-bold">Story Architecture Outline</p>
                          </div>
                        </div>
                        <p className="text-lg text-ink/70 leading-relaxed italic font-serif">
                          "{result.architecture.premise}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-12">
                        {[result.architecture.acts.act1, result.architecture.acts.act2, result.architecture.acts.act3].map((act, actIdx) => (
                          <div key={actIdx} className="space-y-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-bold text-sm">
                                {actIdx + 1}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold uppercase tracking-tight">{act.title}</h3>
                                <p className="text-sm text-ink/50">{act.description}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Key Milestones</h4>
                                <div className="space-y-3">
                                  {act.milestones.map((m, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100/50">
                                      <div className="font-bold text-xs text-violet-900 mb-1">{m.label}</div>
                                      <p className="text-[11px] text-violet-900/60 leading-relaxed">{m.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Chapters & Scenes</h4>
                                <div className="space-y-6">
                                  {act.chapters.map((chapter, i) => (
                                    <div key={i} className="space-y-4">
                                      <div className="text-sm font-bold border-b border-ink/5 pb-2">{chapter.title}</div>
                                      <div className="space-y-4">
                                        {chapter.scenes.map((scene, j) => (
                                          <div key={j} className="pl-4 border-l-2 border-ink/5 space-y-2 group/scene relative">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <div className="text-xs font-bold text-ink/80">{scene.title}</div>
                                                {sceneProgress[scene.title] && (
                                                  <span className={cn(
                                                    "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border",
                                                    sceneProgress[scene.title] === "Adapted" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    sceneProgress[scene.title] === "Improved" ? "bg-pink-50 text-pink-600 border-pink-100" :
                                                    sceneProgress[scene.title] === "Analyzed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    sceneProgress[scene.title] === "Drafted" ? "bg-violet-50 text-violet-600 border-violet-100" :
                                                    "bg-ink/5 text-ink/40 border-ink/10"
                                                  )}>
                                                    {sceneProgress[scene.title]}
                                                  </span>
                                                )}
                                              </div>
                                              <button 
                                                onClick={() => handleWriteScene(act.title, chapter.title, scene.title, scene.description, scene.characterGoals, scene.conflicts)}
                                                className="opacity-0 group-hover/scene:opacity-100 transition-opacity flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-600 text-paper text-[9px] font-bold uppercase tracking-widest shadow-sm hover:bg-violet-700 transition-all"
                                              >
                                                <PenLine size={10} />
                                                Write Scene
                                              </button>
                                            </div>
                                            <p className="text-[11px] text-ink/50 leading-relaxed">{scene.description}</p>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                              {scene.characterGoals.map((goal, k) => (
                                                <span key={k} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase tracking-wider border border-emerald-100">
                                                  Goal: {goal}
                                                </span>
                                              ))}
                                              {scene.conflicts.map((conflict, k) => (
                                                <span key={k} className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[8px] font-bold uppercase tracking-wider border border-red-100">
                                                  Conflict: {conflict}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.script && result.script.scenes.length > 0 && mode === NarrativeMode.ADAPT && (
                    <div className="narrative-card p-8 bg-[#f8f9fa] border-ink/10">
                      <div className="flex items-center justify-between mb-8 border-b border-ink/10 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-ink text-paper flex items-center justify-center">
                            <Film size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg uppercase tracking-tight">{result.script.title}</h3>
                            <p className="text-[10px] text-ink/40 uppercase tracking-widest font-bold">Screenplay Adaptation</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const scriptText = result.script!.scenes.map(s => {
                              let sceneText = `${s.slugline}\n\n`;
                              s.elements.forEach(e => {
                                if (e.type === 'dialogue') {
                                  sceneText += `\t\t${e.character}\n\t${e.text}\n\n`;
                                } else if (e.type === 'parenthetical') {
                                  sceneText += `\t(${e.text})\n`;
                                } else if (e.type === 'shot') {
                                  sceneText += `${e.text.toUpperCase()}\n\n`;
                                } else {
                                  sceneText += `${e.text}\n\n`;
                                }
                              });
                              return sceneText;
                            }).join('\n');
                            copyToClipboard(scriptText);
                          }}
                          className="text-xs bg-ink/5 hover:bg-ink/10 px-4 py-2 rounded-full transition-all flex items-center gap-2 font-bold"
                        >
                          <Copy size={14} />
                          Copy Script
                        </button>
                      </div>

                      <div className="space-y-12 max-w-2xl mx-auto font-mono text-sm text-ink/80">
                        {result.script.scenes.map((scene, i) => (
                          <div key={i} className="space-y-6">
                            <div className="font-bold border-b border-ink/5 pb-2 flex items-center justify-between">
                              <span>{scene.slugline}</span>
                              <span className="text-[10px] text-ink/20">SCENE {scene.sceneNumber}</span>
                            </div>
                            
                            <div className="space-y-4">
                              {scene.elements.map((el, j) => (
                                <div key={j} className={cn(
                                  "relative",
                                  el.type === 'dialogue' ? "pl-24 pr-12" : 
                                  el.type === 'parenthetical' ? "pl-32 pr-20 italic text-ink/60" :
                                  el.type === 'shot' ? "font-bold text-ink/40 uppercase text-xs" :
                                  "text-justify leading-relaxed"
                                )}>
                                  {el.type === 'dialogue' && (
                                    <div className="absolute left-0 top-0 font-bold text-ink uppercase text-xs tracking-wider">
                                      {el.character}
                                    </div>
                                  )}
                                  {el.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.improvedText && (mode === NarrativeMode.WRITE || mode === NarrativeMode.IMPROVE) && (
                    <div className="narrative-card p-8 bg-ink text-paper shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-serif text-xl font-medium">
                          {mode === NarrativeMode.WRITE ? "Generated Scene" : "Improved Version"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => copyToClipboard(result.improvedText!)}
                            className="text-xs bg-paper/10 hover:bg-paper/20 px-3 py-1.5 rounded-full transition-all flex items-center gap-2"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                          <button 
                            onClick={() => {
                              addStringMemory('plotEvents', `Scene: ${activeScene?.title || 'Draft'}. Summary: ${result.improvedText?.slice(0, 100)}...`);
                            }}
                            className="text-xs bg-paper/10 hover:bg-paper/20 px-3 py-1.5 rounded-full transition-all flex items-center gap-2"
                          >
                            <History size={14} />
                            Add to Memory
                          </button>
                          <button 
                            onClick={() => {
                              setText(result.improvedText!);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs bg-paper/10 hover:bg-paper/20 px-3 py-1.5 rounded-full transition-all"
                          >
                            Apply to Editor
                          </button>
                        </div>
                      </div>
                      <div className="markdown-body prose-invert opacity-90 font-serif text-lg leading-relaxed">
                        <ReactMarkdown>{result.improvedText}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="w-[450px] xl:w-[550px] overflow-y-auto p-6 lg:p-8 bg-white border-l border-ink/5">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4"
              >
                <Loader2 size={32} className="animate-spin text-violet-500" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink">Analyzing Narrative...</h3>
                  <p className="text-sm text-ink/40 max-w-[240px] mx-auto">
                    Our AI is evaluating your story structure, characters, and tension.
                  </p>
                </div>
              </motion.div>
            ) : !result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center text-ink/20">
                  <Activity size={32} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink/40">No Analysis Yet</h3>
                  <p className="text-sm text-ink/30 max-w-[240px] mx-auto">
                    {mode === NarrativeMode.WRITE 
                      ? "Generate your scene first, then click 'Analyze' in the workflow to see narrative insights."
                      : "Write your story and click 'Analyze Story' to see professional narrative insights."}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8 pb-20"
              >
                {/* Story Health Report Header */}
                {result.score !== undefined && (
                  <div className="border-b border-ink/5 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center">
                        <Activity size={18} />
                      </div>
                      <h2 className="font-serif text-2xl font-bold">Story Health Report</h2>
                    </div>
                    <p className="text-xs text-ink/40 uppercase tracking-widest font-bold">Complete Narrative Diagnostic Results</p>
                  </div>
                )}

                {/* Story Health Score */}
                {result.score !== undefined && result.detailedScores && (
                  <div className="narrative-card p-8 bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none shadow-xl shadow-violet-200">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Story Health</h3>
                        <div className="text-5xl font-serif font-bold">{(result.score * 10).toFixed(0)}<span className="text-xl opacity-40">/100</span></div>
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
                        <Heart size={32} className={cn("fill-current", result.score > 7 ? "text-emerald-400" : result.score > 4 ? "text-amber-400" : "text-red-400")} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-70">
                          <span>Plot</span>
                          <span>{result.detailedScores.plot * 10}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.detailedScores.plot * 10}%` }}
                            className="h-full bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-70">
                          <span>Characters</span>
                          <span>{result.detailedScores.characters * 10}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.detailedScores.characters * 10}%` }}
                            className="h-full bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-70">
                          <span>Conflict</span>
                          <span>{result.detailedScores.conflict * 10}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.detailedScores.conflict * 10}%` }}
                            className="h-full bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-70">
                          <span>Atmosphere</span>
                          <span>{result.detailedScores.atmosphere * 10}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.detailedScores.atmosphere * 10}%` }}
                            className="h-full bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-70">
                          <span>Dialogue</span>
                          <span>{result.detailedScores.dialogue * 10}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.detailedScores.dialogue * 10}%` }}
                            className="h-full bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-70">
                          <span>Style</span>
                          <span>{result.detailedScores.style * 10}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.detailedScores.style * 10}%` }}
                            className="h-full bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Fix Suggestions */}
                {result.quickFixes && result.quickFixes.length > 0 && (
                  <div className="narrative-card p-6 bg-violet-50/50 border-violet-100">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-6 flex items-center gap-2">
                      <Wand2 size={14} />
                      Quick Fix Suggestions
                    </h3>
                    <div className="space-y-4">
                      {result.quickFixes.map((fix, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white border border-violet-100 shadow-sm space-y-3">
                          <div>
                            <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-1">Issue</div>
                            <p className="text-xs font-bold text-ink">{fix.issue}</p>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-1">Recommendation</div>
                            <p className="text-[11px] text-ink/60 leading-relaxed italic">"{fix.improvement.slice(0, 100)}..."</p>
                          </div>
                          <button 
                            onClick={() => applyQuickFix(fix)}
                            className="w-full py-2 rounded-lg bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles size={12} />
                            Apply Fix
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scene Navigation */}
                {result.sceneAnalysis && result.sceneAnalysis.length > 0 && mode === NarrativeMode.ARCHITECT && (
                  <div className="narrative-card p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2">
                      <Compass size={14} className="text-emerald-500" />
                      Scene Navigation
                    </h3>
                    <div className="space-y-2">
                      {result.sceneAnalysis.map((scene, i) => (
                        <button 
                          key={i}
                          onClick={() => scrollToScene(scene.segment)}
                          className="w-full text-left p-3 rounded-xl hover:bg-ink/[0.02] border border-transparent hover:border-ink/5 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-ink group-hover:text-violet-600 transition-colors">
                              Scene {i + 1} – {scene.segment.slice(0, 30)}...
                            </span>
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {scene.impact}/10
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {scene.purposes.map((p, j) => (
                              <span key={j} className="text-[8px] text-ink/40 font-bold uppercase tracking-tighter">
                                {p}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Score & Metrics (Original - Hidden or kept as secondary) */}
                {result.score !== undefined && result.detailedScores && (
                  <div className="space-y-6 opacity-50">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif text-2xl font-bold">Narrative Analysis</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Overall Score</span>
                        <div className="w-14 h-14 rounded-full border-2 border-violet-500 flex items-center justify-center font-bold text-violet-600 shadow-lg shadow-violet-100">
                          {result.score.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="narrative-card p-6 space-y-4 bg-ink/[0.02]">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-2">Quality Metrics</h3>
                      <ScoreBar label="Plot" score={result.detailedScores.plot} />
                      <ScoreBar label="Characters" score={result.detailedScores.characters} />
                      <ScoreBar label="Conflict" score={result.detailedScores.conflict} />
                      <ScoreBar label="Atmosphere" score={result.detailedScores.atmosphere} />
                      <ScoreBar label="Dialogue" score={result.detailedScores.dialogue} />
                      <ScoreBar label="Style" score={result.detailedScores.style} />
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                {result.strengths && result.weaknesses && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="narrative-card p-6 bg-emerald-50/30 border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-4">
                        <CheckCircle2 size={16} />
                        Strengths
                      </div>
                      <ul className="space-y-3">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-emerald-900/70 flex gap-2 leading-relaxed">
                            <span className="text-emerald-400 shrink-0">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="narrative-card p-6 bg-amber-50/30 border-amber-100">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mb-4">
                        <AlertCircle size={16} />
                        Weaknesses
                      </div>
                      <ul className="space-y-3">
                        {result.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs text-amber-900/70 flex gap-2 leading-relaxed">
                            <span className="text-amber-400 shrink-0">•</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Story Structure */}
                {result.storyStructure && mode === NarrativeMode.ARCHITECT && (
                  <div className="narrative-card p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-500" />
                      Story Structure
                    </h3>
                    <div className="space-y-6">
                      {result.storyStructure.map((stage, i) => (
                        <div key={i} className={cn(
                          "relative pl-6 border-l-2 transition-all",
                          stage.found ? "border-blue-500 opacity-100" : "border-ink/10 opacity-40"
                        )}>
                          <div className={cn(
                            "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white",
                            stage.found ? "border-blue-500" : "border-ink/20"
                          )} />
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider">{stage.stage}</span>
                            {stage.found && <CheckCircle2 size={12} className="text-blue-500" />}
                          </div>
                          <p className="text-[11px] text-ink/60 leading-relaxed">{stage.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tension Analysis */}
                {result.tensionAnalysis && (
                  <div className="narrative-card p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2">
                      <Zap size={14} className="text-orange-500" />
                      Narrative Tension
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-end gap-1 h-24 border-b border-ink/10 pb-2">
                        {result.tensionAnalysis.map((point, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center group relative">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${point.level * 10}%` }}
                              className={cn(
                                "w-full rounded-t-sm transition-all",
                                point.hasConflict ? "bg-orange-400" : "bg-ink/10"
                              )}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[8px] text-ink/30 uppercase tracking-widest font-bold">
                        <span>Beginning</span>
                        <span>End</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Goal Analysis */}
                {result.storyGoal && (
                  <div className="narrative-card p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2">
                      <Target size={14} className="text-emerald-500" />
                      Goal Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-ink/30 mb-1">Protagonist</div>
                        <div className="text-xs font-bold">{result.storyGoal.protagonist}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-ink/30 mb-1">Main Goal</div>
                        <div className="text-xs leading-relaxed text-ink/80">{result.storyGoal.mainGoal}</div>
                      </div>
                      <div className="space-y-3 pt-2">
                        {result.storyGoal.progression.map((step, i) => (
                          <div key={i} className="relative pl-4 border-l border-ink/10">
                            <div className={cn(
                              "absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full",
                              step.status === "achieved" ? "bg-emerald-500" : "bg-blue-500"
                            )} />
                            <span className="text-[10px] font-bold text-ink/80 block">{step.segment}</span>
                            <p className="text-[10px] text-ink/50 leading-tight">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Theme Analysis */}
                {result.themes && result.themes.length > 0 && (
                  <div className="narrative-card p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2">
                      <Palette size={14} className="text-pink-500" />
                      Theme Analysis
                    </h3>
                    <div className="space-y-6">
                      {result.themes.map((theme, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-ink">{theme.name}</h4>
                            <span className="text-[9px] font-bold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                              {theme.prevalence}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink/60 leading-relaxed italic">"{theme.description}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Narrative Format Analysis */}
                {result.narrativeFormat && (
                  <div className="narrative-card p-6 border-violet-100 bg-violet-50/10">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-6 flex items-center gap-2">
                      <Layout size={14} />
                      Narrative Format Analysis
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-white border border-violet-100 shadow-sm">
                        <div className="text-[8px] font-bold text-violet-400 uppercase tracking-widest mb-1">Form</div>
                        <div className="text-[11px] font-bold text-ink">{result.narrativeFormat.form}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-violet-100 shadow-sm">
                        <div className="text-[8px] font-bold text-violet-400 uppercase tracking-widest mb-1">Mode</div>
                        <div className="text-[11px] font-bold text-ink">{result.narrativeFormat.mode}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-violet-100 shadow-sm">
                        <div className="text-[8px] font-bold text-violet-400 uppercase tracking-widest mb-1">Medium</div>
                        <div className="text-[11px] font-bold text-ink">{result.narrativeFormat.medium}</div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 border border-violet-50">
                      <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-2">Explanation</div>
                      <p className="text-[11px] text-ink/70 leading-relaxed italic">{result.narrativeFormat.explanation}</p>
                    </div>
                  </div>
                )}

                {/* Plot Consistency Checker */}
                {result.consistencyIssues && result.consistencyIssues.length > 0 && (
                  <div className="narrative-card p-6 border-red-100 bg-red-50/10">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
                      <AlertCircle size={14} />
                      Plot Consistency Checker
                    </h3>
                    <div className="space-y-4">
                      {result.consistencyIssues.map((issue, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white border border-red-100 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                              {issue.type} issue
                            </span>
                          </div>
                          <p className="text-xs font-bold text-ink mb-1">{issue.description}</p>
                          <p className="text-[10px] text-ink/50 italic">Contradicts: {issue.contradiction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scene Analysis */}
                {result.sceneAnalysis && result.sceneAnalysis.length > 0 && (
                  <div className="narrative-card p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2">
                      <Activity size={14} className="text-violet-500" />
                      Scene Purpose Analysis
                    </h3>
                    <div className="space-y-4">
                      {result.sceneAnalysis.map((scene, i) => (
                        <div key={i} className="relative pl-4 border-l-2 border-violet-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-ink/80">{scene.segment}</span>
                            <span className="text-[9px] font-bold text-violet-500">Impact: {scene.impact}/10</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {scene.purposes.map((p, j) => (
                              <span key={j} className="text-[8px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-bold uppercase tracking-tighter">
                                {p}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-ink/50 leading-relaxed">{scene.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scene Transitions */}
                {result.transitions && result.transitions.length > 0 && (
                  <div className="narrative-card p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2">
                      <ArrowRight size={14} className="text-blue-500" />
                      Scene Transition Analysis
                    </h3>
                    <div className="space-y-4">
                      {result.transitions.map((t, i) => (
                        <div key={i} className="p-4 rounded-xl bg-ink/[0.02] border border-ink/5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">
                              {t.fromScene.slice(0, 20)}... → {t.toScene.slice(0, 20)}...
                            </div>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                              t.quality > 7 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            )}>
                              {t.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink/80 mb-2">{t.description}</p>
                          <div className="text-[9px] text-blue-600 font-bold italic">💡 {t.suggestion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Story Map */}
                {result.storyMap && result.storyMap.nodes.length > 0 && mode === NarrativeMode.ARCHITECT && (
                  <div className="narrative-card p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2">
                      <Layers size={14} className="text-pink-500" />
                      Story Map
                    </h3>
                    <div className="h-[300px] border border-ink/5 rounded-xl overflow-hidden">
                      <StoryMap nodes={result.storyMap.nodes} links={result.storyMap.links} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar - Narrative Memory (Phase 2.3: with Canon Confirmation Queue) */}
        <AnimatePresence>
          {showMemory && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 border-l border-ink/5 shadow-2xl z-40"
            >
              <NarrativeMemoryPanel
                memory={memory}
                canon={canon}
                showMemory={showMemory}
                setShowMemory={setShowMemory}
                t={{
                  narrativeMemory: "Narrative Memory",
                  reset: "Reset",
                  characterTracker: "Characters",
                  addCharacter: "Add Character",
                  cancel: "Cancel",
                  save: "Save",
                  characterName: "Character Name",
                  characterRole: "Role (e.g., Protagonist)",
                  characterTrait: "Key Trait",
                  characterGoals: "Goals",
                  characterRelationships: "Relationships",
                  characterArc: "Development Arc",
                  locations: "Locations",
                  timeline: "Timeline",
                  worldRules: "World Rules",
                  plotEvents: "Plot Events",
                  proTip: "Pro Tip: Memory context is automatically sent to the AI to ensure consistency across your story."
                }}
                onResetMemory={() => {
                  if (confirm("Are you sure you want to reset the entire story and memory?")) {
                    setMemory({ characters: [], locations: [], timeline: [], worldRules: [], plotEvents: [] });
                    setResult(null);
                    setText("");
                    setActiveScene(null);
                    setSceneProgress({});
                  }
                }}
                onAddCharacter={addCharacterMemory}
                onRemoveCharacter={(idx) => removeFromMemory('characters', idx)}
                onAddStringMemory={addStringMemory}
                onRemoveStringMemory={removeFromMemory}
                onConfirmCanonEntity={handleConfirmCanonEntity}
                onRejectCanonEntity={handleRejectCanonEntity}
                onEditCanonEntity={handleEditCanonEntity}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
