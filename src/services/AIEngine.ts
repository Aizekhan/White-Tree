import { NarrativeMode, NarrativeAspect, NarrativeMemory, NarrativeForm, ArchitectNarrativeMode, NarrativeMedium, Project, AdaptTarget } from "../types";
import { API_BASE_URL, getAuthToken } from "../config/apiConfig";
import { EXTRACT_CANON_SYSTEM, EXTRACT_CANON_RESPONSE_PROPERTIES, buildExtractCanonInput } from "../canon/extractCanonPrompt";
import { EXTRACT_FROM_EDIT_SYSTEM, EXTRACT_FROM_EDIT_RESPONSE_SCHEMA, buildExtractFromEditInput } from "../canon/extractFromEditPrompt";


export interface AIAnalysisParams {
    text: string;
    mode: NarrativeMode;
    aspect: NarrativeAspect;
    memory: NarrativeMemory;
    activeProject: Project | null;
    activeScene?: any;
    sceneType?: string;
    narrativeForm?: NarrativeForm;
    architectNarrativeMode?: ArchitectNarrativeMode;
    narrativeMedium?: NarrativeMedium;
    adaptTarget?: AdaptTarget;
}

export const sanitizeAIResponse = (obj: any, isRoot = false): any => {
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeAIResponse(item, false));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = sanitizeAIResponse(obj[key], false);
        }
        return newObj;
    }
    return obj;
};

export const generateNarrativeContent = async (params: AIAnalysisParams) => {
    const {
        text,
        mode,
        aspect,
        memory,
        activeProject,
        activeScene,
        sceneType,
        narrativeForm,
        architectNarrativeMode,
        narrativeMedium,
        adaptTarget
    } = params;

    const languageInstruction = `CRITICAL: All generated text, analysis, suggestions, and story elements MUST be in ${activeProject?.language === 'UA' ? 'Ukrainian' : 'English'}.`;
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
      
      Scene Structure Requirements:
      ${sceneType === "Action" || (sceneType === "Auto" && text.toLowerCase().includes("action")) ? `
      1. Setup: Begin with the character actively pursuing the defined Scene Goal.
      2. Inciting Conflict: Introduce the defined Scene Conflict naturally in the environment, dialogue, or situation.
      3. Escalation: Increase tension or stakes. The character must struggle against the conflict.
      4. Outcome: End the scene with a clear outcome that changes the situation (Success, Failure, Complication, or New information revealed). The outcome should naturally lead into the next scene.
      ` : sceneType === "Reflection" ? `
      1. Reaction: Begin with the character reacting to the outcome of the previous scene or current situation.
      2. Dilemma: Introduce a conflict of choice or internal struggle.
      3. Decision: The character must make a decision or formulate a new plan.
      4. Outcome: End the scene with a clear decision that sets up the next goal.
      ` : `
      If this is an Action Scene:
      1. Setup: Begin with the character actively pursuing the defined Scene Goal.
      2. Inciting Conflict: Introduce the defined Scene Conflict naturally.
      3. Escalation: Increase tension or stakes. The character must struggle against the conflict.
      4. Outcome: End the scene with a clear outcome that changes the situation.
      
      If this is a Reflection Scene:
      1. Reaction: Begin with the character reacting to the outcome of the previous scene.
      2. Dilemma: Introduce a conflict of choice or internal struggle.
      3. Decision: The character must make a decision or formulate a new plan.
      4. Outcome: End the scene with a clear decision that sets up the next goal.
      `}
      
      NARRATIVE MEMORY EXTRACTION (ACCURACY FOCUS):
      - Carefully analyze the generated text. Extract updates for Narrative Memory ONLY if they are significant new facts or meaningful state changes.
      - DO NOT suggest duplicates of existing memory items. Compare with provided context.
      - Detect new characters or meaningful state shifts (e.g., a character dies, moves to a new continent, or changes their main goal).
      - Detect new locations, major plot events, or fundamental world rules discovered.
      - targetId MUST be the EXACT name for characters/locations, or the EXACT text of the existing memory item for updates.
      - Extract the Outcome of the scene in one punchy, meaningful sentence (e.g., "Krag reaches the outpost but collapses from poison.") and suggest it as an Event update.
      
      Return the generated text in "improvedText" and suggested memory updates in "memorySuggestions".`;

        responseProperties = {
            improvedText: { type: "string" },
            memorySuggestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        type: { type: "string", description: "character, location, event, timeline, or rule" },
                        action: { type: "string", description: "add or update" },
                        targetId: { type: "string", description: "Name of the character/location or index of the event/timeline/rule" },
                        newData: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                role: { type: "string" },
                                trait: { type: "string" },
                                status: { type: "string" },
                                location: { type: "string" },
                                goal: { type: "string" },
                                relationships: { type: "string" },
                                developmentArc: { type: "string" },
                                event: { type: "string" },
                                date: { type: "string" },
                                rule: { type: "string" }
                            }
                        },
                        reason: { type: "string" }
                    },
                    required: ["id", "type", "action", "newData", "reason"]
                }
            }
        };
        requiredFields = ["improvedText", "memorySuggestions"];
    } else if (mode === NarrativeMode.ANALYZE) {
        modeInstruction = `Perform a complete narrative diagnostic of the provided text.

      CRITICAL ANALYSIS TASKS:
      1. Consistency Check: Compare text against Narrative Memory and Active Scene Context. Identify contradictions.
      2. Goal Progression: Evaluate if the scene addresses the defined Scene Goal.
      3. Conflict Resolution: Analyze how the Scene Conflict is introduced or handled.
      4. Narrative Diagnostic: Provide scores (0-10), strengths, weaknesses, and suggestions.
      5. Tension Analysis: Break down narrative into 8-10 segments and evaluate tension (0-10) for each.
      6. Story Structure: Identify which standard story structure stages are present.
      7. NARRATIVE MEMORY EXTRACTION: Extract ONLY significant new facts. Avoid duplicates.

      SCORING GUIDELINES (0-10):
      - 0-3: Critical issues. 4-6: Functional but lacking. 9-10: Exceptional.

      ===== CRITICAL OUTPUT RULES =====
      1. Return ONLY a single valid JSON object. No text before or after it.
      2. Do NOT wrap in markdown code blocks (no \`\`\`json).
      3. All string values MUST be properly escaped. Use \\n for line breaks inside strings.
      4. No trailing commas after the last item in any array or object.
      5. Keep ALL string field values under 500 characters.
      6. Limit arrays to a maximum of 8 items each.
      7. SELF-VALIDATION: Before returning, mentally verify the response could be parsed by JSON.parse(). If not — fix it.
      ================================`;

        responseProperties = {
            score: { type: "number", description: "Overall narrative score from 0 to 10" },
            detailedScores: {
                type: "object",
                properties: {
                    plot: { type: "number", description: "Plot score from 0 to 10" },
                    characters: { type: "number", description: "Character score from 0 to 10" },
                    conflict: { type: "number", description: "Conflict score from 0 to 10" },
                    atmosphere: { type: "number", description: "Atmosphere score from 0 to 10" },
                    dialogue: { type: "number", description: "Dialogue score from 0 to 10" },
                    style: { type: "number", description: "Style score from 0 to 10" },
                },
                required: ["plot", "characters", "conflict", "atmosphere", "dialogue", "style"],
            },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            editorSuggestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        original: { type: "string" },
                        suggested: { type: "string" },
                        reason: { type: "string" },
                    },
                    required: ["original", "suggested", "reason"],
                }
            },
            quickFixes: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        issue: { type: "string" },
                        improvement: { type: "string" },
                        targetText: { type: "string" },
                    },
                    required: ["issue", "improvement", "targetText"],
                }
            },
            consistencyIssues: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        type: { type: "string" },
                        description: { type: "string" },
                        contradiction: { type: "string" },
                    },
                    required: ["type", "description", "contradiction"],
                }
            },
            storyStructure: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        stage: { type: "string" },
                        description: { type: "string" },
                        found: { type: "boolean" },
                        textSnippet: { type: "string" },
                    },
                    required: ["stage", "description", "found"],
                }
            },
            tensionAnalysis: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        segment: { type: "string" },
                        level: { type: "number" },
                        pacing: { type: "string" },
                        hasConflict: { type: "boolean" },
                        note: { type: "string" },
                    },
                    required: ["segment", "level", "pacing", "hasConflict", "note"],
                }
            },
            storyGoal: {
                type: "object",
                properties: {
                    protagonist: { type: "string" },
                    mainGoal: { type: "string" },
                    obstacles: { type: "array", items: { type: "string" } },
                    stakes: { type: "string" },
                    progression: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                segment: { type: "string" },
                                status: { type: "string" },
                                description: { type: "string" },
                            },
                            required: ["segment", "status", "description"],
                        }
                    }
                },
                required: ["protagonist", "mainGoal", "obstacles", "stakes", "progression"],
            },
            themes: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        prevalence: { type: "number" },
                        supportByScenes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    segment: { type: "string" },
                                    strength: { type: "number" },
                                    description: { type: "string" },
                                },
                                required: ["segment", "strength", "description"],
                            }
                        }
                    },
                    required: ["name", "description", "prevalence", "supportByScenes"],
                }
            },
            sceneAnalysis: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        segment: { type: "string" },
                        purposes: { type: "array", items: { type: "string" } },
                        impact: { type: "number" },
                        description: { type: "string" },
                    },
                    required: ["segment", "purposes", "impact", "description"],
                }
            },
            transitions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        fromScene: { type: "string" },
                        toScene: { type: "string" },
                        quality: { type: "number" },
                        type: { type: "string" },
                        description: { type: "string" },
                        suggestion: { type: "string" },
                    },
                    required: ["fromScene", "toScene", "quality", "type", "description", "suggestion"],
                }
            },
            narrativeFormat: {
                type: "object",
                properties: {
                    form: { type: "string" },
                    mode: { type: "string" },
                    medium: { type: "string" },
                    explanation: { type: "string" },
                },
                required: ["form", "mode", "medium", "explanation"],
            },
            storyMap: {
                type: "object",
                properties: {
                    nodes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                label: { type: "string" },
                                type: { type: "string" },
                                description: { type: "string" },
                            },
                            required: ["id", "label", "type"],
                        }
                    },
                    links: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                source: { type: "string" },
                                target: { type: "string" },
                                relation: { type: "string" },
                            },
                            required: ["source", "target", "relation"],
                        }
                    }
                },
                required: ["nodes", "links"],
            },
            memorySuggestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        type: { type: "string", description: "character, location, event, timeline, or rule" },
                        action: { type: "string", description: "add or update" },
                        targetId: { type: "string", description: "Name of the character/location or index of the event/timeline/rule" },
                        newData: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                role: { type: "string" },
                                trait: { type: "string" },
                                status: { type: "string" },
                                location: { type: "string" },
                                goal: { type: "string" },
                                relationships: { type: "string" },
                                developmentArc: { type: "string" },
                                event: { type: "string" },
                                date: { type: "string" },
                                rule: { type: "string" }
                            }
                        },
                        reason: { type: "string" }
                    },
                    required: ["id", "type", "action", "newData", "reason"]
                }
            }
        };
        requiredFields = ["score", "detailedScores", "strengths", "weaknesses", "suggestions", "editorSuggestions", "quickFixes", "consistencyIssues", "storyStructure", "tensionAnalysis", "storyGoal", "themes", "sceneAnalysis", "transitions", "narrativeFormat", "storyMap", "memorySuggestions"];
    } else if (mode === NarrativeMode.IMPROVE) {
        modeInstruction = `Improve the provided text by rewriting weak sections, focusing on: ${aspect}. 
      
      CONSTRAINTS:
      - DO NOT change the plot, character goals, or established facts.
      - Enhance the prose, pacing, and emotional resonance while maintaining the original voice.
      - Ensure consistency with Narrative Memory and Active Scene Context.
      
      NARRATIVE MEMORY EXTRACTION (ACCURACY FOCUS):
      - Carefully analyze the improved text. Extract updates for Narrative Memory ONLY if they are significant new facts or meaningful state changes.
      - DO NOT suggest duplicates. Compare with provided context.
      - targetId MUST be the EXACT name for characters/locations, or the EXACT text of the existing memory item for updates.
      
      Return the improved text in "improvedText", specific "editorSuggestions", and suggested memory updates in "memorySuggestions".`;

        responseProperties = {
            improvedText: { type: "string" },
            editorSuggestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        original: { type: "string" },
                        suggested: { type: "string" },
                        reason: { type: "string" },
                    },
                    required: ["original", "suggested", "reason"],
                }
            },
            memorySuggestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        type: { type: "string", description: "character, location, event, timeline, or rule" },
                        action: { type: "string", description: "add or update" },
                        targetId: { type: "string", description: "Name of the character/location or index of the event/timeline/rule" },
                        newData: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                role: { type: "string" },
                                trait: { type: "string" },
                                status: { type: "string" },
                                location: { type: "string" },
                                goal: { type: "string" },
                                relationships: { type: "string" },
                                developmentArc: { type: "string" },
                                event: { type: "string" },
                                date: { type: "string" },
                                rule: { type: "string" }
                            }
                        },
                        reason: { type: "string" }
                    },
                    required: ["id", "type", "action", "newData", "reason"]
                }
            }
        };
        requiredFields = ["improvedText", "editorSuggestions", "memorySuggestions"];
    } else if (mode === NarrativeMode.ADAPT) {
        modeInstruction = `Convert the provided narrative text into a structured, professional scene-based screenplay. 
      
      FORMATTING RULES:
      - Use standard sluglines: INT. or EXT. LOCATION - TIME OF DAY.
      - Character names must be in ALL CAPS before dialogue.
      - Action lines should be concise and present tense.
      - Include parentheticals for emotional direction where necessary.

      CINEMATIC WRITING (CRITICAL):
      - SHOW, DON'T TELL: A director cannot "film" abstract thoughts, metaphors, or internal feelings. 
      - Replace abstract atmospheric descriptions with concrete, visible actions.
      - ❌ BAD: "Nature desperately tries to warn its creature."
      - ✅ GOOD: "The fog thickens. Roots under the crawler's paws move slowly."
      - ❌ BAD: "He felt a wave of regret wash over him."
      - ✅ GOOD: "He stops, looking back at the closed door. He lowers his head."
      - ❌ BAD: "The atmosphere was tense and heavy with anticipation."
      - ✅ GOOD: "Silence. The only sound is the ticking of a clock. Everyone's eyes are glued to the door."
      - Focus on what can be SEEN and HEARD on screen. Use active, cinematic language.
      
      Identify scenes, locations, characters, and suggest visual shots. Return the full structured formatting in the "script" object AND provide the full formatted markdown screenplay in "improvedText" for immediate preview.`;

        if (adaptTarget === AdaptTarget.VIDEO_CARDS) {
            modeInstruction = `Convert the provided narrative text into a series of "Video Cards" optimized for short-form video (YouTube Shorts, TikTok, Reels).
            - Each card must be a concise, powerful visual unit.
            - Provide a "VISUAL DESCRIPTION": What the camera sees (lighting, action, composition).
            - Provide a "VOICEOVER/TEXT": The exact words to be spoken or displayed.
            - Ensure a fast, engaging pace with strong hooks at the beginning.
            Format the output in "improvedText" using a clear "CARD 1, CARD 2..." markdown structure.`;
        } else if (adaptTarget === AdaptTarget.TODDLER_BOOK) {
            modeInstruction = `Adapt the story into a charming, educational book for toddlers (ages 2-4).
            - Use rhythmic, repetitive language with simple sentence structures.
            - Focus on tactile and sensory words.
            - For each page, provide the "PAGE TEXT" and a vivid "ILLUSTRATION DESCRIPTION".
            - Tone should be warm, safe, and engaging.
            Format the output in "improvedText" using "PAGE 1, PAGE 2..." markdown structure.`;
        } else if (adaptTarget === AdaptTarget.POETRY) {
            modeInstruction = `Adapt the narrative into a profound poem.
            - You can choose the form (Sonnet, Free Verse, Haiku Sequence) that best fits the mood.
            - Focus on metaphor, rhythm, and the "unspoken" emotional weight of the scene.
            Return the result as formatted markdown poetry in "improvedText".`;
        } else if (adaptTarget === AdaptTarget.SOCIAL_POST) {
            modeInstruction = `Transform the scene into a viral social media thread or post.
            - Structure: Strong Hook -> Value/Story -> Call to Action/Insight.
            - Include appropriate hashtags and emoji for the platform (X, Instagram, or LinkedIn).
            - Provide 2-3 variations (e.g., "Story-driven", "Controversial", "Educational").
            Return the result in "improvedText".`;
        }

        if (adaptTarget === AdaptTarget.SCREENPLAY || !adaptTarget) {
            responseProperties = {
                improvedText: { type: "string", description: "Full formatted markdown adaptation" },
                script: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        scenes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    sceneNumber: { type: "number" },
                                    slugline: { type: "string" },
                                    location: { type: "string" },
                                    characters: { type: "array", items: { type: "string" } },
                                    elements: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                type: { type: "string" },
                                                character: { type: "string" },
                                                text: { type: "string" },
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
            requiredFields = ["script", "improvedText"];
        } else {
            // For other targets, only need the markdown text. 
            // This is much faster as it avoids generating a large redundant JSON structure.
            responseProperties = {
                improvedText: { type: "string", description: "Full formatted markdown adaptation" }
            };
            requiredFields = ["improvedText"];
        }
    } else if (mode === NarrativeMode.ARCHITECT) {
        modeInstruction = `Generate a full story structure from a short idea.Create a full narrative outline including ACT I, ACT II, and ACT III.For each act, include chapters, scenes, character goals, and conflicts.CRITICAL: For every scene, you MUST also provide 3 - 5 "keyEvents"(external plot beats that happen in the scene).Also, provide a storyMap with nodes and links.`;

        responseProperties = {
            architecture: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    premise: { type: "string" },
                    acts: {
                        type: "object",
                        properties: {
                            act1: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    milestones: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                label: { type: "string" },
                                                description: { type: "string" },
                                            },
                                            required: ["label", "description"],
                                        }
                                    },
                                    chapters: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                title: { type: "string" },
                                                scenes: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            title: { type: "string" },
                                                            description: { type: "string" },
                                                            characterGoals: { type: "array", items: { type: "string" } },
                                                            conflicts: { type: "array", items: { type: "string" } },
                                                            keyEvents: { type: "array", items: { type: "string" } },
                                                        },
                                                        required: ["title", "description", "characterGoals", "conflicts", "keyEvents"],
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
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    milestones: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                label: { type: "string" },
                                                description: { type: "string" },
                                            },
                                            required: ["label", "description"],
                                        }
                                    },
                                    chapters: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                title: { type: "string" },
                                                scenes: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            title: { type: "string" },
                                                            description: { type: "string" },
                                                            characterGoals: { type: "array", items: { type: "string" } },
                                                            conflicts: { type: "array", items: { type: "string" } },
                                                            keyEvents: { type: "array", items: { type: "string" } },
                                                        },
                                                        required: ["title", "description", "characterGoals", "conflicts", "keyEvents"],
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
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    milestones: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                label: { type: "string" },
                                                description: { type: "string" },
                                            },
                                            required: ["label", "description"],
                                        }
                                    },
                                    chapters: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                title: { type: "string" },
                                                scenes: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            title: { type: "string" },
                                                            description: { type: "string" },
                                                            characterGoals: { type: "array", items: { type: "string" } },
                                                            conflicts: { type: "array", items: { type: "string" } },
                                                            keyEvents: { type: "array", items: { type: "string" } },
                                                        },
                                                        required: ["title", "description", "characterGoals", "conflicts", "keyEvents"],
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
                type: "object",
                properties: {
                    nodes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                label: { type: "string" },
                                type: { type: "string" },
                                description: { type: "string" },
                            },
                            required: ["id", "label", "type"],
                        }
                    },
                    links: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                source: { type: "string" },
                                target: { type: "string" },
                                relation: { type: "string" },
                            },
                            required: ["source", "target", "relation"],
                        }
                    }
                },
                required: ["nodes", "links"],
            }
        };
        requiredFields = ["architecture", "storyMap"];
    } else if (mode === NarrativeMode.EXTRACT_CANON) {
        // Canon extraction mode: memory + architecture + text → inferred canon graph
        modeInstruction = EXTRACT_CANON_SYSTEM;
        responseProperties = EXTRACT_CANON_RESPONSE_PROPERTIES;
        requiredFields = ["canon"];
    } else if (mode === NarrativeMode.EXTRACT_FROM_EDIT) {
        // Extract from edit mode: edited text → new entities + conflicts
        modeInstruction = EXTRACT_FROM_EDIT_SYSTEM;
        responseProperties = EXTRACT_FROM_EDIT_RESPONSE_SCHEMA;
        requiredFields = ["newEntities", "conflicts", "suggestions"];
    }

    // Helper to normalize the AI response structure (Fallback safety net)
    const normalizeResponse = (data: any) => {
        if (!data) return data;

        // Level 1: Backend marked as parseError, try simple client-side parse
        if (data.parseError === true && data.rawText) {
            console.warn("[AI] Backend parseError. Attempting simple recovery...");
            let cleaned = data.rawText.trim();
            // Remove markdown json wrapping if any
            if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
            if (cleaned.startsWith("```")) cleaned = cleaned.substring(3);
            if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
            cleaned = cleaned.trim();

            try {
                const recovered = JSON.parse(cleaned);
                console.log("[AI] Simple recovery SUCCESS");
                return normalizeResponse(recovered);
            } catch (e) {
                console.error("[AI] Simple recovery failed:", e);
            }
            
            return {
                improvedText: data.rawText || "",
                rawText: data.rawText || "",
                parseError: true
            };
        }

        // Handle variations (architecture vs storyArchitecture, etc)
        if (data.storyArchitecture && !data.architecture) {
            data.architecture = data.storyArchitecture;
            delete data.storyArchitecture;
        }

        if (data.architecture && Array.isArray(data.architecture.acts)) {
            const actsObj: any = {};
            data.architecture.acts.forEach((act: any, index: number) => {
                actsObj[`act${index + 1}`] = act;
            });
            data.architecture.acts = actsObj;
        }

        // Handle storyMap links (from/to to source/target)
        if (data.storyMap?.links && Array.isArray(data.storyMap.links)) {
            data.storyMap.links = data.storyMap.links.map((link: any) => ({
                ...link,
                source: link.source || link.from || "",
                target: link.target || link.to || ""
            }));
        }

        return data;
    };

    let filteredMemory = { ...memory };

    if (activeScene && mode !== NarrativeMode.ARCHITECT && mode !== NarrativeMode.EXTRACT_CANON && mode !== NarrativeMode.EXTRACT_FROM_EDIT) {
        const sceneContextText = `${activeScene.title} ${activeScene.description} ${activeScene.goals.join(" ")} ${activeScene.conflicts.join(" ")} `.toLowerCase();

        filteredMemory.characters = memory.characters.filter(c =>
            sceneContextText.includes(c.name.toLowerCase()) ||
            (c.location && sceneContextText.includes(c.location.toLowerCase()))
        );

        filteredMemory.locations = memory.locations.filter(l =>
            sceneContextText.includes(l.toLowerCase()) ||
            filteredMemory.characters.some(c => c.location && c.location.toLowerCase() === l.toLowerCase())
        );

        filteredMemory.plotEvents = memory.plotEvents.slice(-5);

        filteredMemory.worldRules = memory.worldRules.filter(r =>
            sceneContextText.includes(r.toLowerCase()) ||
            filteredMemory.locations.some(l => r.toLowerCase().includes(l.toLowerCase()))
        );
    }

    const systemInstruction = `
    You are an expert Narrative Writer and Editor. Your goal is to help the user ${mode.toLowerCase()} their story.
    
    CRITICAL PROJECT CONTEXT (DATA ISOLATION):
    - Project ID: ${activeProject?.id || 'New Project'}
    - Project Title: ${activeProject?.title || 'Untitled'}
    
    Current Mode: ${mode}
    Selected Narrative Aspect: ${aspect}
    
    Filtered Narrative Memory(Context):
        - System instructions: ${modeInstruction}
        - Content to analyze / architecture starting point: ${text}
        - Narrative Memory(Context): ${JSON.stringify(memory)}
        - Characters: ${filteredMemory.characters.map(c => `${c.name} (Role: ${c.role}, Trait: ${c.trait}, Status: ${c.status}, Location: ${c.location}, Goal: ${c.goal}, Relationships: ${c.relationships}, Arc: ${c.developmentArc})`).join("; ") || "None"}
        - Locations: ${filteredMemory.locations.join(", ") || "None"}
        - Timeline: ${filteredMemory.timeline.join(", ") || "None"}
        - World Rules: ${filteredMemory.worldRules.join(", ") || "None"}
        - Plot Events: ${filteredMemory.plotEvents.join(", ") || "None"}
    
    ${activeScene && mode !== NarrativeMode.ARCHITECT && mode !== NarrativeMode.EXTRACT_CANON && mode !== NarrativeMode.EXTRACT_FROM_EDIT ? `
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
    ` : ""
        }
    
    Instructions for ${mode}:
    ${modeInstruction}
    
    ${languageInstruction}
    
    CRITICAL: 
    - Limit total output to under 8000 characters. 
    - You MUST return project-specific data in the following JSON format:
    ${JSON.stringify(responseProperties, null, 2)}
    
    REQUIRED FIELDS: ${requiredFields.join(", ")}
    
    Return the response as a valid JSON object ONLY. No markdown wrapping.
  `;

    // EXTRACT_CANON and EXTRACT_FROM_EDIT use special prompt builders
    const prompt = mode === NarrativeMode.EXTRACT_CANON
        ? buildExtractCanonInput({
            memory,
            architecture: activeProject?.architecture,
            text
          })
        : mode === NarrativeMode.EXTRACT_FROM_EDIT && activeProject?.canon
        ? buildExtractFromEditInput({
            text,
            sceneId: activeScene?.id || 'unknown',
            existingCanon: activeProject.canon,
            language: 'UA'
          })
        : `
${mode === NarrativeMode.ARCHITECT ? `
Narrative Form: ${narrativeForm}
Narrative Mode: ${architectNarrativeMode}
Narrative Medium: ${narrativeMedium}
` : ""
        }

Story Text / Idea:
${text}

${mode === NarrativeMode.ARCHITECT ? "Generate a full story architecture with acts and scenes based on the idea above." : mode === NarrativeMode.ANALYZE ? "Analyze the narrative text provided above and perform a full diagnostic." : mode === NarrativeMode.WRITE ? "Write the scene based on the context." : mode === NarrativeMode.IMPROVE ? "Improve the scene text." : "Adapt the scene to script format."}
        `;

    const token = await getAuthToken();
    if (!token) {
        throw new Error('Помилка авторизації: не вдалося отримати токен. Спробуйте вийти та увійти знову.');
    }
    console.log("[AI] Token retrieved. Sending request...");
    
    const url = `${API_BASE_URL}/api/ai/generate?p=${activeProject?.id || 'unknown'}&t=${Date.now()}`;
    console.log("[DEBUG] AIEngine: Final URL:", url);
    console.log("[DEBUG] AIEngine: Request Body:", {
        mode,
        aspect,
        projectId: activeProject?.id,
        hasText: !!text,
        systemInstructionLength: systemInstruction.length,
        promptLength: prompt.length
    });

    let rawData: any;
    const fetchWithRetry = async (retries = 1): Promise<any> => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    systemInstruction,
                    prompt,
                    responseProperties,
                    requiredFields,
                    projectId: activeProject?.id,
                    config: { 
                        temperature: mode === NarrativeMode.ANALYZE ? 0.2 : 0.7,
                        responseMimeType: "application/json"
                    }
                })
            });

            const text = await response.text();
            if (!response.ok) {
                if (retries > 0 && response.status >= 500) {
                    console.warn(`[AI] HTTP ${response.status}. Retrying...`);
                    return fetchWithRetry(retries - 1);
                }
                throw new Error(`AI Engine Error (${response.status}): ${text}`);
            }

            try {
                return JSON.parse(text);
            } catch (e) {
                if (retries > 0) {
                    console.warn("[AI] JSON Parse failed. Retrying...");
                    return fetchWithRetry(retries - 1);
                }
                return { rawText: text, parseError: true };
            }
        } catch (e) {
            if (retries > 0) {
                console.warn("[AI] Fetch failed. Retrying...", e);
                return fetchWithRetry(retries - 1);
            }
            throw e;
        }
    };

    rawData = await fetchWithRetry(1);

    const sanitizedData = sanitizeAIResponse(rawData, true);
    const data = normalizeResponse(sanitizedData);

    // Warn about parseError fallback — UI will see rawText as improvedText
    if (data?.parseError) {
        console.warn("[AI] parseError fallback active. rawText length:", data.rawText?.length || 0);
    }

    return {
        data,
        filteredMemory
    };
};

// ── resyncFutureHistory ────────────────────────────────────────────────────────
// Called after a Pro+ user edits a Future History scene.
// Returns updated architecture with only Future History scenes changed,
// plus inconsistencies detected vs True History.

import { StoryArchitecture, ArchitectureInconsistency, ArchitectScene } from "../types";

export interface ResyncResult {
    updatedArchitecture: StoryArchitecture;
    inconsistencies: ArchitectureInconsistency[];
}

function extractTrueHistory(architecture: StoryArchitecture): string {
    const lines: string[] = [];
    Object.entries(architecture.acts).forEach(([actKey, act]) => {
        act.chapters.forEach((chapter, ci) => {
            chapter.scenes.forEach((scene, si) => {
                if (scene.isLocked || scene.writtenText) {
                    lines.push(`[TRUE HISTORY]Act: ${act.title} | Chapter: ${chapter.title} | Scene: ${scene.title} \nDescription: ${scene.description} \nWritten text excerpt: ${scene.writtenText?.slice(0, 300) || "(description only)"} `);
                }
            });
        });
    });
    return lines.join("\n\n");
}

function extractFutureHistory(architecture: StoryArchitecture): string {
    const lines: string[] = [];
    Object.entries(architecture.acts).forEach(([actKey, act]) => {
        act.chapters.forEach((chapter, ci) => {
            chapter.scenes.forEach((scene, si) => {
                if (!scene.isLocked && !scene.writtenText) {
                    lines.push(`[FUTURE HISTORY]Act: ${act.title} | Chapter: ${chapter.title} | Scene: ${scene.title} \nDescription: ${scene.description} `);
                }
            });
        });
    });
    return lines.join("\n\n");
}

export const resyncFutureHistory = async (
    architecture: StoryArchitecture,
    changedScene: ArchitectScene,
    projectId: string,
    language: 'UA' | 'ENG' = 'ENG'
): Promise<ResyncResult> => {
    const trueHistoryContext = extractTrueHistory(architecture);
    const futureHistoryContext = extractFutureHistory(architecture);
    const langInstruction = language === 'UA'
        ? "CRITICAL: All text must be in Ukrainian."
        : "CRITICAL: All text must be in English.";

    const systemInstruction = `You are a story architecture expert.A user has edited a Future History scene in their story blueprint.
Your task:
        1. Regenerate ONLY the Future History scenes(unwritten, unlocked) to maintain narrative coherence with the change.
2. DO NOT modify or reference any True History scenes.
3. Detect any inconsistencies between the changed scene and True History.
            ${langInstruction} `;

    const prompt = `
TRUE HISTORY SCENES(DO NOT CHANGE):
${trueHistoryContext || "None yet."}

CHANGED FUTURE HISTORY SCENE:
        Title: ${changedScene.title}
New Description: ${changedScene.description}
        Goals: ${changedScene.characterGoals.join(", ")}
        Conflicts: ${changedScene.conflicts.join(", ")}

ALL FUTURE HISTORY SCENES(to be updated):
${futureHistoryContext}

Full architecture JSON for reference:
${JSON.stringify(architecture, null, 2)}

        Tasks:
        1. Return the full updated architecture JSON where Future History scenes are regenerated for coherence.
2. Return inconsistencies[] if the changed scene contradicts any True History scene.
`;

    const token = await getAuthToken();
    if (!token) {
        throw new Error('Помилка авторизації: не вдалося отримати токен для resync.');
    }

    const url = `${API_BASE_URL}/api/ai/resync?p=${projectId}&t=${Date.now()}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            systemInstruction,
            prompt,
            projectId
        })
    });

    if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
            const errData = await response.json();
            errorMsg = errData.details || errData.error || response.statusText;
        } catch (_) {}
        throw new Error(`AI Resync Error (${response.status}): ${errorMsg}`);
    }

    const raw = await response.json();
    return {
        updatedArchitecture: raw.updatedArchitecture as StoryArchitecture,
        inconsistencies: (raw.inconsistencies || []) as ArchitectureInconsistency[],
    };
};
