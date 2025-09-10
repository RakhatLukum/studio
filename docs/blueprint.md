# **App Name**: AI Resume Tailor

## Core Features:

- Google Sign-In: Secure authentication using Firebase Auth with Google Sign-In.
- Resume Tailoring: Rewrites the candidate’s resume based on the job description using the Gemini API. The tool uses a system prompt to guide the AI, forbidding fabrications and emphasizing relevant skills.
- Resume Input: Enables users to input their resumes by pasting text or uploading a .txt file; extracts plain text client-side.
- Job Description Input: Provides a large textarea for users to input the target job description.
- Language Selection: Lets users select the resume language; currently supporting EN, RU, and KZ. Default is EN.
- Output Display: Displays the tailored resume in Markdown format, match score, and change log on the screen. Provides Copy to clipboard, Save to History, and Download as DOCX buttons.
- History Page: Lists the user’s last 20 runs from Firestore, including createdAt, language, and match score. Allows users to view details with original inputs and outputs.
- Prompt Lab Page: Provides a textarea for the current 'system prompt' and a Save button to store a version label. Displays the last 3 saved versions to demonstrate prompting and iteration.

## Style Guidelines:

- Maintains a clean and intuitive layout with clear section divisions. Utilizes generous whitespace effectively to avoid overwhelming the user with information. Groups elements into Inputs, Actions, Results, and History sections.
- Uses 'Inter' font for headings and body text to ensure a clean, modern, and readable interface.
- Uses modern and simple icons for key actions such as uploading, tailoring, copying, and downloading.
- Incorporates subtle transitions and animations for buttons and card entries. Uses skeleton loaders during AI calls to indicate loading states.
- Cards should have rounded corners and soft shadows to provide a modern and visually appealing interface.
- Primary color for the Tailor button and a secondary color for the Copy and Download buttons to visually differentiate the primary action.