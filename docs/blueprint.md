# **App Name**: ResumeCraft AI

## Core Features:

- Google Sign-In: Secure user authentication using Firebase Auth with Google Sign-In. Authentication is required to use the app.
- Resume Tailoring: Use Gemini API to rewrite the candidate’s resume based on the job description. The tool uses a system prompt to guide the AI.
- Resume Input: Enable users to input their resumes by either pasting text or uploading a .txt file; extract plain text client-side.
- Job Description Input: Provide a large textarea for users to input the target job description.
- Language Selection: Let users select the resume language, currently supporting EN, RU, and KZ. Default is EN.
- Output Display: Display the tailored resume in Markdown format, match score, and change log on the screen. Provide Copy, Save to History, and Download as DOCX buttons.
- History Page: List the user’s last 20 runs from Firestore, including createdAt, language, and match score. Allow users to view details with original inputs and outputs.
- Prompt Lab Page: Provide a textarea for the current 'system prompt' and a Save button to store a version label. Display the last 3 saved versions.

## Style Guidelines:

- Maintain a clean and intuitive layout with clear section divisions. Utilize whitespace effectively to avoid overwhelming the user with information. Group elements into Inputs, Actions, Results, and History sections.
- Use 'Inter' font for headings and body text to ensure a clean, modern, and readable interface.
- Use modern and simple icons for key actions such as uploading, tailoring, copying, and downloading.
- Incorporate subtle transitions and animations for buttons and card entries. Use skeleton loaders during AI calls.
- Cards should have rounded corners and soft shadows
- primary color for Tailor button and secondary color for Copy and Download
- Use Inter font