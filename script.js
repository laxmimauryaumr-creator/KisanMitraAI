async function getAdvice() {
    const crop = document.getElementById("crop").value;
    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer");

    if (crop === "" || question === "") {
        answer.textContent =
            "Kripya fasal chunein aur apna sawal likhein.";
        return;
    }

    answer.textContent = "Kisan Mitra AI salah taiyar kar raha hai...";

    try {
        const response = await fetch("https://kisanmitraai-dawp.onrender.com/api/crop-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                crop: crop,
                question: question,
                language:
                document.getElementById("language").value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "AI se jawab nahi mila.");
        }

        answer.innerHTML = marked.parse(data.answer);
    } catch (error) {
        console.error("Error:", error);
        answer.textContent =
            "AI se connect nahi ho pa raha. Check karein ki server chal raha hai aur API key sahi hai.";
    }
}
function startVoiceInput() {
    const answer = document.getElementById("answer");
    const question = document.getElementById("question");

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        answer.textContent =
            "Voice input is not supported. Please use Google Chrome.";
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = function () {
        answer.textContent = "Boliyе, aapki baat suni ja rahi hai...";
    };

    recognition.onresult = function (event) {
        question.value =
            event.results[0][0].transcript;
        answer.textContent =
            "Aapka sawal likh diya gaya hai. Ab Salah paayein dabayein.";
    };

    recognition.onerror = function () {
        answer.textContent =
            "Microphone kaam nahi kar raha. Browser ki microphone permission check karein.";
    };

    recognition.start();
}
function speakAdvice() {
    const answer = document.getElementById("answer");
    const text = answer.innerText.trim();

    if (text === "") {
        answer.textContent = "Pehle Salah paayein button dabayein.";
        return;
    }

    if (!("speechSynthesis" in window)) {
        answer.textContent +=
            "\nAapka browser voice response support nahi karta.";
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
}
async function getWeather() {
    const city = document.getElementById("city").value.trim();
    const result = document.getElementById("weatherResult");

    if (!city) {
        result.textContent = "Kripya gaon ya shahar ka naam likhein.";
        return;
    }

    result.textContent = "Mausam ki jankari aa rahi hai...";

    try {
        const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`
);

        if (!geoResponse.ok) {
            throw new Error("Location search nahi ho payi.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            result.textContent = "Yeh gaon ya shahar nahi mila. Naam dobara check karein.";
            return;
        }

        const place = geoData.results[0];

        const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`
);

        
        if (!weatherResponse.ok) {
            throw new Error("Weather data nahi mil paya.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        const weatherNames = {
            0: "Saaf aasman",
            1: "Aasman adhiktar saaf",
            2: "Kuch badal",
            3: "Badal chhaye hue",
            45: "Kohra",
            48: "Kohra",
            51: "Halki boonda-bandi",
            53: "Boonda-bandi",
            55: "Tez boonda-bandi",
            61: "Halki baarish",
            63: "Baarish",
            65: "Tez baarish",
            71: "Halki barfbaari",
            73: "Barfbaari",
            75: "Tez barfbaari",
            80: "Baarish ki bauchharein",
            81: "Tez bauchharein",
            82: "Bahut tez bauchharein",
            95: "Garaj-chamak ke saath aandhi-baarish",
            96: "Garaj-chamak aur ole",
            99: "Tez garaj-chamak aur ole"
        };

        const condition =
            weatherNames[current.weather_code] || "Mausam ki sthiti uplabdh nahi";

        result.innerHTML = `
            <h3>📍 ${place.name}, ${place.country}</h3>
            <p>🌤️ Mausam: ${condition}</p>
            <p>🌡️ Taapman: ${current.temperature_2m}°C</p>
            <p>🤗 Mehsoos hone wala taapman: ${current.apparent_temperature}°C</p>
            <p>💧 Nami: ${current.relative_humidity_2m}%</p>
            <p>💨 Hawa ki raftaar: ${current.wind_speed_10m} km/h</p>
            <p>🌧️ Vartaman varsha: ${current.precipitation} mm</p>
            <small>Samay: ${weatherData.current.time.replace("T", " ")}</small>
        `;
    } catch (error) {
        console.error("Weather error:", error);
        result.textContent =
            "Mausam load nahi hua. Internet connection check karke dobara koshish karein.";
    }
}
function previewCropImage() {
    const input = document.getElementById("cropImage");
    const preview = document.getElementById("imagePreview");
    const result = document.getElementById("diseaseResult");

    if (!input.files || !input.files[0]) {
        result.textContent = "Pehle fasal ki photo chunein.";
        return;
    }

    const file = input.files[0];

    if (!file.type.startsWith("image/")) {
        result.textContent = "Kripya image file chunein.";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        result.textContent = "5 MB se chhoti photo chunein.";
        return;
    }

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    result.textContent = "Photo select ho gayi hai.";
}
async function analyzeCropImage() {
  const input = document.getElementById("cropImage");
  const result = document.getElementById("diseaseResult");
  const cropInput = document.getElementById("crop");

  if (!input.files || !input.files[0]) {
    result.textContent = "Pehle fasal ki photo chunein.";
    return;
  }

  const file = input.files[0];

  if (file.size > 5 * 1024 * 1024) {
    result.textContent = "5 MB se chhoti photo chunein.";
    return;
  }

  result.textContent = "AI photo analyze kar raha hai...";

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result.split(",")[1]);
      };

      reader.onerror = () => reject(
        new Error("Photo read nahi ho payi.")
      );

      reader.readAsDataURL(file);
    });

    const response = await fetch("http://localhost:3000/api/crop-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: base64,
        mimeType: file.type,
        crop: cropInput ? cropInput.value : ""
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request fail ho gayi.");
    }

    result.textContent = data.answer;
  } catch (error) {
    console.error(error);
    result.textContent =
      error.message || "Server se connection nahi ho paya.";
  }
}

function showDiary() {
    const records = JSON.parse(
        localStorage.getItem("kisanDiary") || "[]"
    );

    const container = document.getElementById("diaryRecords");
    if (!container) return;

    container.replaceChildren();

    records.forEach((record, index) => {
        const card = document.createElement("div");
        const title = document.createElement("h3");
        const date = document.createElement("p");
        const notes = document.createElement("p");
        const removeButton = document.createElement("button");

        card.className = "diary-record";
        title.textContent = record.crop;
        date.textContent = "Tareekh: " + record.date;
        notes.textContent = record.notes;
        removeButton.textContent = "Delete";
        removeButton.type = "button";
        removeButton.onclick = () => deleteDiary(index);

        card.append(title, date, notes, removeButton);
        container.appendChild(card);
    });
}

function saveDiary() {
    const crop = document.getElementById("diaryCrop").value.trim();
    const date = document.getElementById("diaryDate").value;
    const notes = document.getElementById("diaryNotes").value.trim();

    if (!crop || !date || !notes) {
        alert("Kripya sabhi details bharein.");
        return;
    }

    const records = JSON.parse(
        localStorage.getItem("kisanDiary") || "[]"
    );

    records.unshift({ crop, date, notes });

    localStorage.setItem("kisanDiary", JSON.stringify(records));

    document.getElementById("diaryCrop").value = "";
    document.getElementById("diaryDate").value = "";
    document.getElementById("diaryNotes").value = "";

    showDiary();
    alert("Kisan Diary ka record save ho gaya!");
}

function deleteDiary(index) {
    const records = JSON.parse(
        localStorage.getItem("kisanDiary") || "[]"
    );

    records.splice(index, 1);
    localStorage.setItem("kisanDiary", JSON.stringify(records));
    showDiary();
}

showDiary();

async function getMandiPrices() {
    const state = document.getElementById("mandiState").value;
    const crop = document.getElementById("mandiCrop").value.trim();
    const status = document.getElementById("mandiStatus");
    const results = document.getElementById("mandiResults");

    if (!crop) {
        status.textContent = "Kripya fasal ka naam likhein.";
        return;
    }

    status.textContent = "Mandi bhav load ho rahe hain...";
    results.replaceChildren();

    try {
        const url = new URL("https://mandi-api.onrender.com/v1/prices");
        url.searchParams.set("state", state);
        url.searchParams.set("commodity", crop);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(
                data.error?.message || "Mandi data abhi nahi mila."
            );
        }

        const rows = Array.isArray(data)
            ? data
            : data.data || data.records || data.prices || [];

        if (!rows.length) {
            status.textContent =
                "Is fasal ke liye data nahi mila. Fasal ka English naam bhi try karein.";
            return;
        }

        rows.forEach(item => {
            const card = document.createElement("div");
            card.className = "mandi-result-card";

            const heading = document.createElement("h3");
            heading.textContent =
                item.commodity || item.crop || item.commodity_name || crop;

            const details = document.createElement("p");
            details.textContent = [
                "Mandi: " + (item.market || item.market_name || "N/A"),
                "District: " + (item.district || "N/A"),
                "Minimum: ₹" + (item.min_price ?? item.minPrice ?? "N/A"),
                "Maximum: ₹" + (item.max_price ?? item.maxPrice ?? "N/A"),
                "Modal: ₹" + (item.modal_price ?? item.modalPrice ?? "N/A"),
                "Date: " + (item.date || item.arrival_date || "Data mein nahi di gayi")
            ].join(" | ");

            card.append(heading, details);
            results.appendChild(card);
        });

        status.textContent =
            "Data mil gaya. Rate ki tareekh zaroor check karein.";
    } catch (error) {
        console.error("Mandi API error:", error);
        status.textContent =
            "Mandi data load nahi hua. Internet ya API service check karein.";
    }
}

function getFarmTasks() {
    try {
        const tasks = JSON.parse(
            localStorage.getItem("kisanFarmTasks") || "[]"
        );
        return Array.isArray(tasks) ? tasks : [];
    } catch {
        return [];
    }
}

function showFarmTasks() {
    const container = document.getElementById("farmTaskList");
    if (!container) return;

    container.replaceChildren();

    const tasks = getFarmTasks();

    if (tasks.length === 0) {
        container.textContent = "Abhi koi kaam add nahi kiya gaya.";
        return;
    }

    tasks.sort((a, b) => a.date.localeCompare(b.date));

    tasks.forEach((task) => {
        const card = document.createElement("div");
        card.className = "farm-task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        const title = document.createElement("h3");
        title.textContent = task.name;

        const details = document.createElement("p");
        details.textContent =
            "Fasal: " + task.crop + " | Tareekh: " + task.date;

        const status = document.createElement("p");
        status.textContent = task.completed
            ? "✅ Kaam poora ho gaya"
            : "⏳ Kaam baaki hai";

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.textContent = task.completed
            ? "Adhoora Mark Karein"
            : "Complete Mark Karein";
        completeButton.onclick = () => toggleFarmTask(task.id);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteFarmTask(task.id);

        card.append(title, details, status, completeButton, deleteButton);
        container.appendChild(card);
    });
}

function addFarmTask() {
    const name = document.getElementById("farmTask").value.trim();
    const date = document.getElementById("farmTaskDate").value;
    const crop = document.getElementById("farmTaskCrop").value;

    if (!name || !date) {
        alert("Kaam ka naam aur tareekh dono bharein.");
        return;
    }

    const tasks = getFarmTasks();

    tasks.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        name,
        date,
        crop,
        completed: false
    });

    localStorage.setItem("kisanFarmTasks", JSON.stringify(tasks));

    document.getElementById("farmTask").value = "";
    document.getElementById("farmTaskDate").value = "";

    showFarmTasks();
}

function toggleFarmTask(id) {
    const tasks = getFarmTasks().map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    localStorage.setItem("kisanFarmTasks", JSON.stringify(tasks));
    showFarmTasks();
}

function deleteFarmTask(id) {
    const tasks = getFarmTasks().filter(task => task.id !== id);

    localStorage.setItem("kisanFarmTasks", JSON.stringify(tasks));
    showFarmTasks();
}

showFarmTasks();

function checkSoilHealth() {
  const phInput = document.getElementById("soilPH").value;
  const nInput = document.getElementById("soilN").value;
  const pInput = document.getElementById("soilP").value;
  const kInput = document.getElementById("soilK").value;
  const result = document.getElementById("soilResult");

  if (
    phInput === "" ||
    nInput === "" ||
    pInput === "" ||
    kInput === ""
  ) {
    result.textContent =
      "Kripya Soil Health Card ki sabhi values bharein.";
    return;
  }

  const ph = Number(phInput);
  const nitrogen = Number(nInput);
  const phosphorus = Number(pInput);
  const potassium = Number(kInput);

  if (
    !Number.isFinite(ph) ||
    !Number.isFinite(nitrogen) ||
    !Number.isFinite(phosphorus) ||
    !Number.isFinite(potassium) ||
    ph < 0 || ph > 14 ||
    nitrogen < 0 ||
    phosphorus < 0 ||
    potassium < 0
  ) {
    result.textContent =
      "Kripya valid aur non-negative values bharein.";
    return;
  }

  let message = `
    <h3>आपकी Soil Report</h3>
    <p><b>pH:</b> ${ph}</p>
    <p><b>Nitrogen (N):</b> ${nitrogen}</p>
    <p><b>Phosphorus (P):</b> ${phosphorus}</p>
    <p><b>Potassium (K):</b> ${potassium}</p>
  `;

  if (ph < 6) {
    message +=
      "<p>मिट्टी अम्लीय (acidic) हो सकती है।</p>";
  } else if (ph <= 7.5) {
    message +=
      "<p>pH सामान्यतः कई फसलों के लिए अनुकूल सीमा में है।</p>";
  } else if (ph <= 8.5) {
    message +=
      "<p>मिट्टी क्षारीय (alkaline) हो सकती है।</p>";
  } else {
    message +=
      "<p>pH काफी अधिक है। स्थानीय कृषि विशेषज्ञ से सलाह लें।</p>";
  }

  message += `
    <p><b>ध्यान दें:</b> N, P और K की कमी या पर्याप्तता
    केवल इन नंबरों से तय नहीं की जा सकती। Soil Health Card
    पर दी गई units, rating और crop recommendations भी देखें।</p>
    <p>उर्वरक की सही मात्रा के लिए अपनी रिपोर्ट और फसल के
    अनुसार कृषि विशेषज्ञ की सलाह लें।</p>
  `;

  result.innerHTML = message;
}

function checkSchemes() {
  const state = document.getElementById("farmerState").value;
  const land = document.getElementById("farmerLand").value;
  const category = document.getElementById("farmerCategory").value;
  const result = document.getElementById("schemeEligibilityResult");

  if (!state || !land || !category) {
    result.textContent = "Kripya sabhi options select karein.";
    return;
  }

  let html = "<h3>आपके लिए जाँचने योग्य योजनाएँ</h3><ul>";

  html += `
    <li>
      <b>PM-KISAN:</b>
      पात्रता और जमीन के रिकॉर्ड की शर्तें आधिकारिक पोर्टल पर जाँचें।
      <a href="https://pmkisan.gov.in/" target="_blank" rel="noopener noreferrer">
        आधिकारिक वेबसाइट
      </a>
    </li>
    <li>
      <b>PM Fasal Bima Yojana:</b>
      अपनी फसल, क्षेत्र और वर्तमान सीजन के अनुसार बीमा उपलब्धता जाँचें।
      <a href="https://pmfby.gov.in/" target="_blank" rel="noopener noreferrer">
        आधिकारिक वेबसाइट
      </a>
    </li>
    <li>
      <b>Soil Health Card:</b>
      मिट्टी की जाँच और रिपोर्ट संबंधी जानकारी देखें।
      <a href="https://soilhealth.dac.gov.in/" target="_blank" rel="noopener noreferrer">
        आधिकारिक वेबसाइट
      </a>
    </li>
  `;

  if (state === "mp") {
    html += `
      <li>
        <b>मध्य प्रदेश की योजनाएँ:</b>
        राज्य की कृषि योजनाओं और वर्तमान पात्रता की जानकारी
        अपने जिले के कृषि विभाग से सत्यापित करें।
      </li>
    `;
  }

  html += "</ul>";
  html += `
    <p><b>ध्यान दें:</b> यह शुरुआती मार्गदर्शन है, पात्रता की पुष्टि नहीं।
    अंतिम निर्णय संबंधित योजना के आधिकारिक नियमों और दस्तावेजों पर निर्भर है।</p>
  `;

  result.innerHTML = html;
}
