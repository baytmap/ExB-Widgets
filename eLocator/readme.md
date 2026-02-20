# Custom ArcGIS Experience Builder Widget – Locate Coordinates

This widget allows users to **locate coordinates** on a map, supporting both:

* **WGS84 (WKID: 4326)** – global latitude/longitude in degrees
* **TUREF TM36 (WKID: 5256)** – local projected coordinates in meters (Azerbaijan)

### 📌 Examples

**WKID: 5256 (meters)**

```
4.128.043,731331  569.495,719625
```

**WKID: 4326 (degrees)**

```
37,281539  36,783638
```

---

## 📌 Compatibility

| Component                | Version |
| ------------------------ | ------- |
| Experience Builder (ExB) | 1.17    |
| Maps SDK                 | 4.32    |
| ArcGIS Enterprise        | 11.5    |
| Developer Edition        | 1.17    |

---

## 🚀 Using the Widget in Developer Edition

### 1️⃣ Download Experience Builder Developer Edition

Download ArcGIS Experience Builder Developer Edition 1.17 from:

[https://developers.arcgis.com/experience-builder/guide/downloads/](https://developers.arcgis.com/experience-builder/guide/downloads/)

---

### 2️⃣ Add the Widget to Extensions Folder

Copy your widget folder into:

```
C:\Users\User\Downloads\arcgis-experience-builder-1.17\ArcGISExperienceBuilder\client\your-extensions\widgets
```

> ⚠️ The base path may vary depending on where you extracted the Developer Edition.

---

### 3️⃣ Install Dependencies (IMPORTANT)

Before running the project, install dependencies.

Open Command Prompt (CMD) in both:

* `server` directory
* `client` directory

Run:

```bash
npm install
```

> ⚠️ Make sure you have Node.js 16.x or 18.x (LTS recommended) and npm installed.
> Check versions with:
>
> ```bash
> node -v
> npm -v
> ```

---

### 4️⃣ Start the Development Environment

After installing dependencies, run the following command in both `server` and `client` folders:

```bash
npm start
```

---

### 5️⃣ Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

or

```
http://localhost:3001
```

(depending on your configuration)

You should now be able to **use the widget inside Experience Builder Dev Edition**.

---

## 🏗 Using the Widget in ArcGIS Enterprise (Production)

### 1️⃣ Build for Production

Navigate to the `client` folder and run:

```bash
npm run build:prod
```

This will create a **production-ready widget folder** in:

```
dist-prod
```

---

### 2️⃣ Deploy to ArcGIS Enterprise

1. Publish the built widget
2. Deploy it to your ArcGIS Enterprise 11.5 environment
3. Add and use it inside your Experience Builder application


Do you want me to do that?
