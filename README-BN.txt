SMART NOTES PRO — GitHub Pages (Local Edition)

এই সংস্করণটি Online Notepad-এর মতো পরিষ্কার নোট-লাইব্রেরি ও এডিটর অভিজ্ঞতা অনুসরণ করে, তবে নিজস্ব কোডে তৈরি।

ডেটা ও গোপনীয়তা:
- Local-only storage: নোট একই ব্রাউজার/ডিভাইসে থাকে।
- Google Login, Cloud Sync, Sharing, Public/Private Link, Multi-user Collaboration নেই।
- কোনো API secret বা AI key কোডে রাখা হয়নি।

ফিচার:
1. নোট তৈরি, সম্পাদনা, Auto Save, Search ও Sort
2. Folder, Favorite, Archive, Trash, Restore, Permanent Delete
3. নোট Duplicate
4. Rich Text: Bold, Italic, Underline, Strike, Heading, Quote, Code
5. Font size, Text color, Highlight, Bullet/Number list, Checklist
6. Link, Image, Table, Divider, Date, Text alignment, Undo/Redo
7. Word count, Character count, HTML file size ও Gzip size (ব্রাউজার সমর্থন করলে)
8. TXT, HTML ও Word-compatible DOC export
9. TXT, HTML, DOC, DOCX, PDF ও Image import (DOCX/PDF import-এ প্রথমবার ইন্টারনেট প্রয়োজন)
10. PDF / Print (Print dialog থেকে Save as PDF)
11. Full-screen writing
12. Keyboard shortcuts: Ctrl+K Search, Ctrl+S Save
13. Slash command prompt: h1, h2, bullet, number, quote, date
14. Light/Dark theme
15. JSON Backup / Restore
16. PWA offline shell

AI tools:
- AI Paraphraser, AI Summarizer ও Help Me Write-এর জন্য নিরাপদ server-side AI endpoint প্রয়োজন।
- GitHub Pages-এর public JavaScript-এ API key রাখা নিরাপদ নয়; তাই এই সংস্করণে AI API সংযুক্ত করা হয়নি।

GitHub Pages:
1. ZIP Extract করুন।
2. ভেতরের ফাইলগুলো repository root-এ upload করুন।
3. Commit changes করুন।
4. Settings > Pages > Deploy from a branch > main > /(root) > Save।
5. GitHub Pages URL খুলে Chrome থেকে Install app / Add to Home screen করুন।

সতর্কতা:
- ব্রাউজারের Site data clear করলে নোট হারাতে পারে। JSON Backup নিয়মিত ডাউনলোড করুন।
- PDF/DOCX import-এর জন্য প্রয়োজনীয় লাইব্রেরি প্রথমবার অনলাইন থেকে লোড হয়।
- Word export .doc-compatible HTML ফাইল; এটি Microsoft Word-এ খোলা যায়, native .docx নয়।
