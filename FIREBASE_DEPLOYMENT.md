# הוראות פריסה ל-Firebase Hosting

## הכנת הפרויקט לפריסה

### 1. בניית הפרויקט
```bash
npm install
npm run build
```

### 2. התקנת Firebase CLI (אם לא מותקן)
```bash
npm install -g firebase-tools
```

### 3. התחברות ל-Firebase
```bash
firebase login
```

### 4. אתחול הפרויקט
```bash
firebase init hosting
```

בחר:
- Use an existing project: `shareit-454f0`
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Overwrite index.html: `No`

### 5. פריסה
```bash
firebase deploy
```

## קבצי הגדרה חשובים

### firebase.json
הקובץ כבר מוכן ומוגדר עם:
- תיקיית פרסום: `dist-client`
- Rewrites לאפליקציית SPA
- Headers לקבצים סטטיים

### מבנה הפרויקט לאחר בנייה
```
dist-client/
├── index.html
├── assets/
│   ├── *.js
│   ├── *.css
│   └── *.png
└── firebase.json
```

## משתני סביבה נדרשים

הפרויקט כבר מוגדר עם המפתחות הנכונים:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

## מאפיינים שיעבדו ב-Firebase Hosting

✅ **Frontend בלבד** - React SPA
✅ **Firebase Authentication** - התחברות Google ודוא"ל
✅ **Firebase Firestore** - מסד נתונים עם 20 המלצות, 8 משתמשים, 4 עסקים
✅ **Firebase Storage** - לוגו ותמונות
✅ **תמיכה RTL בעברית**
✅ **סריקת QR** - Html5QRCode
✅ **שיתוף ברשתות חברתיות**

## URL לאחר פריסה
האתר יהיה זמין בכתובת:
`https://shareit-454f0.web.app`

## הערות חשובות

1. **השרת Express לא נדרש** - הפרויקט עובד כ-Frontend בלבד
2. **כל הנתונים ב-Firebase** - לא נדרש שרת חיצוני
3. **אימות מוכן** - Google Sign-in מוגדר
4. **מותאם לנייד** - עיצוב רספונסיבי

האתר מוכן לפריסה מיידית!