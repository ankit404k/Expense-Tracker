📕 Khatabook - Digital Ledger Tracker

Khatabook ek pure JavaScript-based accounting tool hai jo chote businessmen ya individuals ko apna lena-dena (receivables/payables) manage karne mein madad karta hai. Yeh project mere Logic Building aur DOM Manipulation ki skills ko showcase karta hai.



🚀 Key Features (Interview Highlights)

Dual Ledger System: 'Customer' aur 'Vendor' ke liye alag-alag accounting logic.

Real-time Stats: Har transaction ke baad Dashboard par "Kaul" (Income) aur "Udhar" (Expense) automatic update hota hai.

Data Persistence: LocalStorage ka use kiya gaya hai taaki page refresh hone par bhi data delete na ho.

Transaction Management: Har khate ke andar jaakar naya transaction add ya purana delete karne ki suvidha.

Clean UI/UX: Minimalist design ke saath interactive Tabs aur Modals ka upyog.



🛠️ Tech Stack

HTML5: Semantic structure ke liye.

CSS3: Flexbox aur Grid ka use karke responsive layout banane ke liye.

Vanilla JavaScript (ES6+): Pura business logic handle karne ke liye (Bina kisi framework ke).



🧠 Technical Logic (Interview Question Prep)

ID Generation: Date.now() ka use karke har khate aur transaction ko unique ID di gayi hai.

Data Handling: Array.map(), Array.filter(), aur Array.reduce() ka upyog karke data ko filter aur display kiya gaya hai.

Calculation Engine: Ek custom function calculateBalance banaya jo type (Credit/Debit) ke basis par mathematical calculation karta hai.

State Management: Ek global variable khatas maintain kiya hai jo UI aur LocalStorage ke beech bridge ka kaam karta hai.



📂 Project Structure

Plaintext
├── index.html       # UI Structure & Modals
├── style.css        # Minimalist & Responsive Design
└── script.js        # Core Business Logic & LocalStorage handling



💡 What I Learned?

Browser ki Memory (LocalStorage) ko efficiently kaise use karte hain.

Complex Array of Objects ko kaise manage aur filter kiya jata hai.

JavaScript se real-time CSS classes toggle karke dynamic UI kaise banate hain.
