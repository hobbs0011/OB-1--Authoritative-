# Firebase Hosting — OBI (Natural English Training)

## Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Update `.firebaserc` with your project ID
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Login: `firebase login`
5. Deploy: `firebase deploy`

## Architecture

- **Hosting:** Static landing page + Chrome Extension download
- **Firestore:** Student profiles, lesson progress, teacher dashboard
- **Functions:** API endpoints (Node.js 22)
- **Auth:** Google Sign-In for students + admin claims for teachers

## Firestore Schema

```
/students/{uid}
  - name: string
  - email: string
  - level: string (mouse|cat|tiger)
  - createdAt: timestamp
  - lastActive: timestamp

/students/{uid}/progress/{lessonId}
  - score: number
  - completedAt: timestamp
  - timeSpent: number (seconds)

/lessons/{lessonId}
  - title: string
  - level: string
  - content: map
  - createdAt: timestamp

/admin/dashboard
  - totalStudents: number
  - activeToday: number
  - lessonsCompleted: number
```

## Cost: $0 (Spark plan)
- Hosting: 10GB storage, 360MB/day transfer
- Firestore: 50K reads/day, 20K writes/day, 1GB storage
- Functions: 125K invocations/month
- Auth: Free for all providers
