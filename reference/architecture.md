```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                         │
├────────────────┬────────────────────────┬──────────────────────┐
│ Candidate UI   │                        │  HR Department UI    │
│ - Resume Upload│                        │ - Job Description    │
│ - Interview    │                        │ - Scoring Dashboard  │
│   Interface    │                        │ - Correlation Matrix │
└────────────────┴────────────────────────┴──────────────────────┘
           ▲                                      ▲
           │                                      │
           ▼                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                           API Layer                             │
└─────────────────────────────────────────────────────────────────┘
           ▲                                      ▲
           │                                      │
           ▼                                      ▼
┌─────────────────┐                    ┌─────────────────────────┐
│   LangChain/    │                    │                         │
│   LangGraph     │◄───────────────────┤    Eleven Labs API      │
│   Agents        │                    │    (Speech-to-Text)     │
└─────────────────┘                    └─────────────────────────┘
           ▲                                      ▲
           │                                      │
           ▼                                      ▼
┌─────────────────┐                    ┌─────────────────────────┐
│   OpenRouter    │                    │                         │
│   (LLM Access)  │                    │      Supabase DB        │
└─────────────────┘                    └─────────────────────────┘
```

System Architecture
The tool is divided into three components:
Candidate Frontend:
Resume upload (PDF or DOCX).

Interview window (text-based or video-based with audio extraction).

HR Frontend:
Job description text field.

Final report displaying scores (out of 20) for empathy, collaboration, and confidence, plus a correlation matrix for job fitness.

Backend:
Speech-to-text conversion using Eleven Labs.

Text analysis for soft skills and professionalism.

Resume analysis for skills and professionalism.

Database management with Supabase.

LLM integration via OpenRouter with LangChain-based agents.



