async function getAdvice() {
    const crop = document.getElementById("crop").value;
    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer");

    if (!crop || !question) {
        answer.textContent = "Kripya fasal chunein aur sawal likhein.";
        return;
    }

    answer.textContent = "Kisan Mitra AI salah taiyar kar raha hai...";

    try {
        const response = await fetch(
            "https://kisanmitraai-dawp.onrender.com/api/advice",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    crop: crop,
                    question: question,
                    language:
                        document.getElementById("language")?.value || "Hindi"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "AI se jawab nahi mila.");
        }

        answer.textContent = data.answer || "Koi jawab nahi mila.";
    } catch (error) {
        answer.textContent = "Error: " + error.message;
        console.error(error);
    }
}

window.getAdvice = getAdvice;