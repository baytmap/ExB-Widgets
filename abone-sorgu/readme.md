Custom ArcGIS Experience Builder Widget
📌 Compatibility
This widget is built for the following versions:

Component	Version
Experience Builder (exb)	1.17
Maps SDK	4.32
ArcGIS Enterprise	11.5
Developer Edition	1.17
🚀 Using the Widget in Developer Edition
1️⃣ Download Experience Builder Developer Edition
Download ArcGIS Experience Builder Developer Edition 1.17 from:

https://developers.arcgis.com/experience-builder/guide/downloads/

2️⃣ Add the Widget to Extensions Folder
Copy your widget folder into:

C:\Users\User\Downloads\arcgis-experience-builder-1.17\ArcGISExperienceBuilder\client\your-extensions\widgets
⚠️ Note: The base path may vary depending on where you extracted the Developer Edition (for example, it may not be inside Downloads).

3️⃣ Install Dependencies (IMPORTANT)
Before running the project, install dependencies.

Open Command Prompt (CMD) in both:

server directory
client directory
Run:

npm install
⚠️ Make sure you have:

Node.js 16.x or 18.x (LTS recommended)
npm installed
You can check your versions using:

node -v
npm -v
👉 Do this BEFORE running npm start.

4️⃣ Start the Development Environment
After installing dependencies, run the following command in both server and client folders:

npm start
5️⃣ Access the Application
Open your browser and navigate to:

http://localhost:3000
or

http://localhost:3001
(depending on your configuration)

You should now be able to use the widget inside Experience Builder Dev Edition.

🏗 Using the Widget in ArcGIS Enterprise (Production)
1️⃣ Build for Production
Navigate to the client folder and run:

npm run build:prod
This will create a production-ready widget folder in:

dist-prod
folder.

2️⃣ Deploy to ArcGIS Enterprise
Publish the built widget
Deploy it to your ArcGIS Enterprise 11.5 environment
Add and use it inside your Experience Builder application
